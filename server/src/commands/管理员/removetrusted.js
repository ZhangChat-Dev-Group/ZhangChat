/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
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

  // remove trip from config
  core.config.trusted = core.config.trusted.filter((trip) => trip !== data.trip)

  // find targets current connections
  const targetTrustedUser = server.findSockets({ trip: data.trip });
  if (targetTrustedUser.length !== 0) {
    for (let i = 0, l = targetTrustedUser.length; i < l; i += 1) {
      // downgrade privilages
      targetTrustedUser[i].uType = 'user';
      targetTrustedUser[i].level = UAC.levels.default;

      // inform ex-mod
      server.send({
        cmd: 'info',
        text: '你现在是一个普通用户',
      }, targetTrustedUser[i]);
    }
  }

  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 删除了一个信任用户，识别码为：${data.trip}`,
  }, { level: UAC.isModerator });

  core.logger.logAction(socket,[],'removetrusted',data)

  
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
  name: 'removetrusted',
  description: '将目标trip从信任用户列表中移除，并降低这个用户的等级',
  usage: `
    API: { cmd: 'removetrusted', trip: '<target trip>' }
    文本：以聊天形式发送 /removetrusted 目标识别码`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ],
  level: UAC.levels.moderator,
};
