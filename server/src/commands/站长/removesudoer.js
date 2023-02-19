/*
  Description: Removes target trip from the config as a mod and downgrades the socket type
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

  if (core.config.sudoers.indexOf(data.trip) === -1){
    return server.reply({
      cmd:'warn',
      text:'用户没有被允许提权，无需执行此操作'
    },socket)
  }

  // remove trip from config
  core.config.sudoers = core.config.sudoers.filter((trip) => trip !== data.trip);

  server.broadcast({
    cmd:'info',
    text:'您被禁止使用提权功能'
  },{trip:data.trip})

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `删除了一个可提权用户，识别码是: ${data.trip}`,
  }, { level: UAC.isModerator });
  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig来保存配置\n建议执行clearpower命令以确保万无一失`,
  }, socket);
  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'removesudoer',
  description: '将目标识别码从可提权用户列表中移除',
  usage: `
    API: { cmd: 'removesudoer', trip: '<target trip>' }
    文本：以聊天形式发送 /removesudoer 目标识别码`,
  fastcmd:[
    {
      name:'trip',
      len:1
    }
  ]
};
