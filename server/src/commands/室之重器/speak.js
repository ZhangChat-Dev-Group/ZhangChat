/*
 * Description: Pardon a dumb user to be able to speak again
 * Author: simple
 */

import * as UAC from '../utility/UAC/_info';

// module constructor
export function init(core) {
  if (typeof core.mutedIP !== 'object') {
    core.mutedIP = new Map();
  }
}

// module main
export async function run(core, server, socket, data) {
  if (data.ip === '*') {
    core.mutedIP = new Map()
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick}#${socket.trip} 解除了所有禁言`
    }, { level: UAC.isModerator })
    return core.logger.logAction(socket,[],'speak',data)
  }
  if (!core.isMuted(core, data.ip)) return server.replyWarn('目标IP地址没有被禁言，无需重复操作', socket)
  core.mutedIP.delete(data.ip)
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 解除了 ${data.ip} 的禁言`
  }, { level: UAC.isModerator })
  server.broadcast({
    cmd: 'info',
    text: '你已被手动解除禁言'
  }, { address: data.ip })
  core.logger.logAction(socket,[],'speak',data)
  return true;
}

export const info = {
  name: 'speak',
  description: '解除对某IP的禁言',
  usage: `
    API: { cmd: 'speak', ip: '<目标IP>' }
    文本：以聊天形式发送 /speak 目标IP（如果设置为“*”则解除所有禁言）`,
  dataRules: [
    {
      name:'ip',
      required: true,
    },
  ],
  runByChat: true,
  level: UAC.levels.moderator,
};
info.aliases = ['unmuzzle', 'unmute'];
