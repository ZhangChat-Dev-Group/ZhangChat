/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // find target user(s)
  const badClients = server.findSockets({ channel: socket.channel, nick: data.nick });

  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到你指定的用户',
    }, socket);
  }

  // check if found targets are kickable, add them to the list if they are
  const kicked = [];
  for (let i = 0, j = badClients.length; i < j; i += 1) {
    if (badClients[i].level >= socket.level) {
      return server.reply({
        cmd: 'warn',
        text: '不能踢你的同事，这是很粗鲁的',
      }, socket);
    } else {
      kicked.push(badClients[i]);
    }
  }

  // publicly broadcast kick event
  server.broadcast({
    cmd: 'info',
    text: `${kicked.map((k) => k.nick).join('、')} 被踢出聊天室`,
  }, { channel: socket.channel, level: (level) => level < UAC.levels.channelOwner });

  server.broadcast({
    cmd: 'info',
    text: `${kicked.map((k) => k.nick).join('、')} 被 ${socket.nick} 踢出了聊天室`,
  }, { channel: socket.channel, level: UAC.isChannelOwner });

  var i = 0
  for (i in kicked){
    kicked[i].terminate()
  }

  // stats are fun
  core.stats.increment('users-kicked', kicked.length);

  // 保存为档案
  core.logger.logAction(socket,[],'kick',data,`${kicked.map((k) => k.nick).join('、')} 被踢出聊天室`)

  return true;
}

export const info = {
  name: 'kick',
  description: '踢出一个或多个用户。当nick为数组时则踢出多名用户',
  runByChat: true,
  usage: `
    API: { cmd: 'kick', nick: '<target nick>' }
    文本：以聊天形式发送 /kick 目标昵称`,
  dataRules: [
    {
      name: 'nick',
      verify: (data) => {
        if (typeof data === 'object') {
          if (!Array.isArray(data)) return false
          let i = 0
          for (i in data) {
            if (typeof data[i] !== 'string') return false
            if (!UAC.verifyNickname(data[i])) return false
          }
          return true
        }else if (typeof data === 'string') {
          return UAC.verifyNickname(data)
        }
      },
      errorMessage: UAC.nameLimit.nick,
      required: true,
    }
  ],
  level: UAC.levels.channelOwner,
};
