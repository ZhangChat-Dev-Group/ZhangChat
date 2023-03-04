/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }

  if (core.config.sudoers.indexOf(data.trip) !== -1){
    return server.reply({
      cmd:'warn',
      text:'已经允许该用户提权了，无需重复操作'
    },socket)
  }

  core.config.sudoers.push(data.trip)

  server.broadcast({
    cmd:'info',
    text:'您被允许使用提权功能'
  },{ trip: data.trip })

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `已添加可提权用户，识别码为：${data.trip}`,
  }, { level: UAC.isModerator });

  
  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig命令来保存配置`,
  }, socket);

  core.logger.logAction(socket,[],'addsudoer',data)

  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'addsudoer',
  description: '将目标识别码添加到可提权用户列表中',
  usage: `
    API: { cmd: 'addsudoer', trip: '<target trip>' }
    文本：以聊天形式发送 /addsudoer 目标识别码`,
  fastcmd:[    //fastcmd支持
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};
