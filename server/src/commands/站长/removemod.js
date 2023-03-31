/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // remove trip from config
  core.config.mods = core.config.mods.filter((mod) => mod.trip !== data.trip);

  // find targets current connections
  const targetMod = server.findSockets({ trip: data.trip });
  if (targetMod.length !== 0) {
    for (let i = 0, l = targetMod.length; i < l; i += 1) {
      // downgrade privilages
      targetMod[i].uType = 'trusted';
      targetMod[i].level = UAC.levels.trustedUser;

      // inform ex-mod
      server.send({
        cmd: 'info',
        text: '你现在是一个普通用户',
      }, targetMod[i]);
    }
  }

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `删除了一个Mod，识别码是: ${data.trip}`,
  }, { level: UAC.isModerator });
  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig来保存配置`,
  }, socket);
  core.logger.logAction(socket,[],'removemod',data)
  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'removemod',
  description: '将目标trip从Mod列表中移除，并降低这个用户的等级',
  usage: `
    API: { cmd: 'removemod', trip: '<target trip>' }
    文本：以聊天形式发送 /removemod 目标识别码`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ],
  level: UAC.levels.admin,
};
