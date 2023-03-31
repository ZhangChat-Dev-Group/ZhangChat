/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.trusted){
    core.config.trusted = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if ((core.config.mods.filter((mod) => mod.trip === data.trip).length !== 0) || data.trip === 'POWER+'){
    return server.reply({
      cmd:'warn',
      text:'不允许降级其他管理员！'
    },socket)
  }

  // add new trip to config
  core.config.trusted.push(data.trip)

  // find targets current connections
  const newTrustedUser = server.findSockets({ trip: data.trip });
  if (newTrustedUser.length !== 0) {
    for (let i = 0, l = newTrustedUser.length; i < l; i += 1) {
      // upgrade privilages
      newTrustedUser[i].uType = 'trusted';
      newTrustedUser[i].level = UAC.levels.trustedUser;

      // inform new mod
      server.send({
        cmd: 'info',
        text: '你现在是一个信任用户',
      }, newTrustedUser[i]);
    }
  }
  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 添加了一个信任用户，识别码为：${data.trip}`,
  }, { level: UAC.isModerator });

  // 存为档案
  core.logger.logAction(socket,[],'addtrusted',data)

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'addtrusted',
  description: '将目标trip添加为一个信任用户，并提升这个用户的等级到信任用户',
  usage: `
    API: { cmd: 'addtrusted', trip: '<target trip>' }
    文本：以聊天形式发送 /addtrusted 目标识别码`,
  fastcmd:[    //fastcmd支持
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ],
  level: UAC.levels.moderator,
};
