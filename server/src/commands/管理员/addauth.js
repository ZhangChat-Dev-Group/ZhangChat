/*
  本模块用于添加系统认证信息。
  本模块由小张软件总程序员Mr_Zhang编写
  本模块是ZHC专用的，所以不建议其他聊天室使用。
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.auth) {
    core.config.auth = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (data.info===undefined) {
    return server.reply({
      cmd: 'warn',
      text: `丢失参数“认证信息”！`,
    }, socket);
  }
  if (data.trip===undefined) {
    return server.reply({
      cmd: 'warn',
      text: `丢失参数“识别码”！`,
    }, socket);
  }
  var had=0
  for (var i=0; i<core.config.auth.length; i++) {
    if(core.config.auth[i].trip == data.trip) {
        had = 1
    }
  }
  if(had == 1) {
    return server.reply({
      cmd: 'warn',
      text: `该用户已存在认证信息，无需操作。`,
    }, socket);
  }

  // add new token to config
  core.config.auth.push({ trip:data.trip,info:data.info });


  // return success message
  server.broadcast({
    cmd:"info",
    text:`${socket.nick} 已添加新的认证信息，以下是详细信息：
识别码：${data.trip}
认证信息：${data.info}`
  },{level:UAC.isModerator})
  server.broadcast({
    cmd:"info",
    text:`管理员已为你添加认证信息：${data.info}`,
  },{trip:data.trip})
  // 存为档案
  core.logger.logAction(socket,[],'addauth',data)
  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }
  return true;
}

export function initHooks(server) {
  server.registerHook('out', 'onlineAdd', this.addAuthToPayload.bind(this));
}

export function addAuthToPayload(core,server,socket,payload){
  if (payload.auth){
    return payload
  }
  if (!payload.trip){
    return payload
  }
  if (core.config.auth.filter((a) => a.trip === payload.trip).length > 0){
    payload.auth = core.config.auth.filter((a) => a.trip === payload.trip)[0].info
  }
  return payload
}

export const requiredData = ['trip', 'info'];
export const info = {
  name: 'addauth',
  description: '添加一个认证信息',
  usage: `
    API: { cmd: 'addauth', trip: '<目标识别码>', info:'<认证信息>' }
    文本：以聊天形式发送 /addauth <目标识别码> <认证信息>`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    },
    {
      name:'info',
      len:0
    }
  ],
  level: UAC.levels.moderator,
};
