/*
  Description: Adds the target socket's ip to the ratelimiter
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    return true;
  }

  // find target user
  const targetNick = data.nick;
  let badClient = server.findSockets({ channel: socket.channel, nick: targetNick });

  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到目标用户',
    }, socket);
  }

  [badClient] = badClient;

  // i guess banning mods or admins isn't the best idea?
  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '不能封禁你的同事，这是很粗鲁的',
    }, socket);
  }

  // commit arrest record
  server.police.arrest(badClient.address, badClient.hash);

  console.log(`${socket.nick} [${socket.trip}] 在 ?${socket.channel} 封禁了 ${targetNick}`);

  // notify normal users
  server.broadcast({
    cmd: 'info',
    text: `已封禁 ${targetNick}`,
    user: UAC.getUserDetails(badClient),
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator });

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 封禁了 ?${socket.channel} 的 ${targetNick}，${targetNick} 的hash为：${badClient.hash}\n您可以通过上面提供的hash来解除封禁该用户`,
    channel: socket.channel,
    user: UAC.getUserDetails(badClient),
    banner: UAC.getUserDetails(socket),
  }, { level: UAC.isModerator });

  // force connection closed
  badClient.terminate();

  // stats are fun
  core.stats.increment('users-banned');

  return true;
}

export const requiredData = ['nick'];
export const info = {
  name: 'ban',
  description: '封禁一名用户',
  usage: `
    API: { cmd: 'ban', nick: '<target nickname>' }
    文本：以聊天形式发送 /ban 目标昵称`,
  fastcmd:[
    {
      name:'nick',
      len:1
    }
  ]
};
