/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.tokens){
    core.config.tokens = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (core.config.tokens.filter((i) => i.token.toLowerCase() === data.token.toLowerCase()).length === 0){
    return server.reply({
      cmd:'warn',
      text:'该token不存在'
    },socket)
  } 
  core.config.tokens = core.config.tokens.filter((t) => t.token !== data.token)
  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 删除了了一个token：${data.token}`,
  }, { level: UAC.isModerator });

  core.logger.logAction(socket,[],'removetoken',data)

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  return true;
}

export const requiredData = ['token'];
export const info = {
  name: 'removetoken',
  description: '删除一个给机器人使用的token',
  usage: `
    API: { cmd: 'removetoken', token: '<the token you want to remove>' }
    文本：以聊天形式发送 /removetoken 要删除的token`,
  fastcmd:[    //fastcmd支持
    {
      name:'token',
      len:1
    }
  ],
  level: UAC.levels.moderator,
};
