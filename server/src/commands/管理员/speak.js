/*
 * Description: Pardon a dumb user to be able to speak again
 * Author: simple
 */

import * as UAC from '../utility/UAC/_info';

// module constructor
export function init(core) {
  if (typeof core.muzzledHashes === 'undefined') {
    core.mute = {};
  }
}

// module main
export async function run(core, server, socket, data) {
  // check user input
  if (typeof data.ip !== 'string' && typeof data.hash !== 'string') {
    return server.reply({
      cmd: 'warn',
      text: "参数错误",
    }, socket);
  }
  if (typeof data.hash !== 'string'){
    return true
  }
  if (data.hash === '*') {
    core.mute = {};
    server.broadcast({
      cmd:'info',
      text:'已解除所有禁言',
    },{level: (level) => level < UAC.levels.moderator});
    return server.broadcast({
      cmd: 'info',
      text: `${socket.nick} 解除了所有禁言`,
    }, { level: UAC.isModerator });
  }

  core.mute[data.hash] = undefined;

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}已解除对hash ${data.hash} 的禁言。`,
  }, { level: UAC.isModerator });
  server.broadcast({
    cmd:'info',
    text:`你的禁言已被手动解除。`
  },{hash:data.hash})

  core.logger.logAction(socket,[],'speak',data)

  return true;
}

export const info = {
  name: 'speak',
  description: '解除对某用户的禁言',
  usage: `
    API: { cmd: 'speak', hash: '<目标hash>' }
    文本：以聊天形式发送 /speak 目标hash（如果设置为“*”则解除所有禁言） ==（不是昵称！！！）==`,
  fastcmd:[
    {
      name:'hash',
      len:1,
      check: (text) => {
        if (text === '*'){
          return true
        }
        return /^[a-zA-Z0-9/\+]{15}$/.test(text)
      }
    }
  ],
  level: UAC.levels.moderator,
};
info.aliases = ['unmuzzle', 'unmute'];
