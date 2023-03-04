/*
  本模块用于移除一个认证信息。
  本模块由小张软件总程序员Mr_Zhang编写
  本模块是XChat专用的，所以不建议其他聊天室使用。
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.auth) {
    core.config.auth = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin   //永远不会变的注释啊
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:"warn",
      text:"权限不足，无法操作。",
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  var had = 0
  for (var i=0; i<core.config.auth.length; i++) {
      if(core.config.auth[i].trip == data.trip) {
          had = 1
      }
  }
  if(had == 0) {
      return server.reply({
        cmd: 'warn',
        text: `不能找到这个识别码`,
      }, socket);
  }

  core.config.auth = core.config.auth.filter((auth) => auth.trip !== data.trip);


  // return success message
  server.broadcast({
    cmd:"info",
    text:`${socket.nick} 已删除对识别码 ${data.trip} 的认证信息。`
  },{level:UAC.isModerator})

  core.logger.logAction(socket,[],'removeauth',data)

  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'removeauth',
  description: '删除一个认证信息',
  usage: `
    API: { cmd: 'removeauth', trip: '<要移除的认证信息的识别码>' }
    文本：发送 /removeauth <要移除的认证信息的识别码>`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};