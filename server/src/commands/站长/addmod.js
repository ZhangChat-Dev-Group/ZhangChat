/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }

  // add new trip to config
  core.config.mods.push({ trip: data.trip });

  // find targets current connections
  const newMod = server.findSockets({ trip: data.trip });
  if (newMod.length !== 0) {
    for (let i = 0, l = newMod.length; i < l; i += 1) {
      // upgrade privilages
      newMod[i].uType = 'mod';
      newMod[i].level = UAC.levels.moderator;

      // inform new mod
      server.send({
        cmd: 'info',
        text: '你现在是一个管理员',
      }, newMod[i]);
    }
  }

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `添加了一个Mod，识别码为: ${data.trip}`,
  }, { level: UAC.isModerator });

  
  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig命令来保存配置`,
  }, socket);

  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'addmod',
  description: '将目标trip添加为一个mod，并提升这个用户的等级',
  usage: `
    API: { cmd: 'addmod', trip: '<target trip>' }
    文本：以聊天形式发送 /addmod 目标识别码`,
  fastcmd:[    //fastcmd支持
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};
