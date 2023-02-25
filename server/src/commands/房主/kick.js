/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isChannelOwner(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    if (typeof data.nick !== 'object' && !Array.isArray(data.nick)) {
      server.reply({
        cmd: 'warn',
        text: '参数无效',
      }, socket);
      return true;
    }
  }

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

  return true;
}

export const requiredData = ['nick'];
export const info = {
  name: 'kick',
  description: '踢出一个或多个用户。当nick为数组时则踢出多名用户',
  usage: `
    API: { cmd: 'kick', nick: '<target nick>' }
    文本：以聊天形式发送 /kick 目标昵称`,
  fastcmd:[
    {
      name:'nick',
      len:1,
      check: UAC.verifyNickname
    }
  ]
};
