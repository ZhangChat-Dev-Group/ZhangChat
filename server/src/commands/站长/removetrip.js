/*
  此命令用于取消替换识别码
*/

import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.config.trips===undefined){
    core.config.trips={}
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作。'
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  var targetTrip = ''
  var i
  for(i in core.config.trips){
    if (core.config.trips[i] === data.trip){
      targetTrip = i
      break
    }
  }
  if (!targetTrip){
    return server.reply({
      cmd:'warn',
      text:'找不到目标识别码'
    },socket)
  }
  delete core.config.trips[targetTrip]
  const sockets = server.findSockets({
    trip: data.trip
  })
  if (sockets.length !== 0){
    let j = 0
    for (j in sockets){
      server.reply({
        cmd:'info',
        text:`您的特殊识别码 ${data.trip} 已被删除，您当前的识别码为：${targetTrip}`
      },sockets[j])
      sockets[j].trip = targetTrip
    }
  }
  server.broadcast({
    cmd:'info',
    text:'已删除特殊识别码 '+data.trip
  },{level:UAC.isModerator})
  server.reply({
    cmd:'info',
    text:'请不要忘记执行 `saveconfig` 来保存配置文件'
  },socket)
  core.logger.logAction(socket,[],'removetrip',data)
}
export const requiredData = ['trip'];
export const info = {
  name: 'removetrip',
  description: '取消替换识别码',
  usage: `
    API: { cmd: 'removetrip', trip: '<识别码>' }
    文本：以聊天形式发送 /removetrip <识别码>`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};
