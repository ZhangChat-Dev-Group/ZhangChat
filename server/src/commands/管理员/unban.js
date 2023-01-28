/*
  Description: Removes a target ip from the ratelimiter
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.ip !== 'string' && typeof data.hash !== 'string') {
    return server.reply({
      cmd: 'warn',
      text: "您提供的数据无效，您必须提供IP或者hash",
    }, socket);
  }

  // find target
  let mode;
  let target;
  if (typeof data.ip === 'string') {
    mode = 'ip';
    target = data.ip;
  } else {
    mode = 'hash';
    target = data.hash;
  }

  // remove arrest record
  server.police.pardon(target);

  // mask ip if used
  if (mode === 'ip') {
    target = server.getSocketHash(target);
  }
  console.log(`${socket.nick} [${socket.trip}] 已解封 ${target}`);
  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 解除封禁了hash：${target}`,
  }, { level: UAC.isModerator });

  // stats are fun
  core.stats.decrement('users-banned');

  return true;
}

export const info = {
  name: 'unban',
  description: '解除封禁目标IP地址或hash',
  usage: `
    API: { cmd: 'unban', ip/hash: '<target ip or hash>' }
    文本：以聊天形式发送 /unban 目标hash`,
  fastcmd:[
    {
      name:'hash',
      len:1
    }
  ]
};
