/*
  此命令用于替换识别码
*/

import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.config.trips===undefined){
    core.config.trips={}
  }
}
// module main
export async function run(core, server, socket, data) {
  if (core.config.trips[data.trip]){
    server.reply({
      cmd:'warn',
      text:'该识别码已经被替换了，请删除以后再试。'
    },socket)
    return
  }
  core.config.trips[data.trip] = data.new_trip

  const sockets = server.findSockets({
    trip: data.trip
  })

  if (sockets.length !== 0){
    var i = 0
    for (i in sockets){
      server.reply({
        cmd:'info',
        text:'您的识别码已被替换为 '+data.new_trip
      },sockets[i])
      sockets[i].trip = data.new_trip
    }
  }
  server.broadcast({
    cmd:'info',
    text:`已将识别码 ${data.trip} 替换为 ${data.new_trip}`
  },{level:UAC.isModerator})

  server.reply({
    cmd:'info',
    text:'请不要忘记执行 `saveconfig` 来保存配置文件'
  },socket)

  core.logger.logAction(socket,[],'addtrip',data)
}

export const requiredData = ['trip','new_trip'];
export const info = {
  name: 'addtrip',
  description: '替换识别码',
  usage: `
    API: { cmd: 'addtrip', trip: '<旧的识别码>', new_trip:'<新的识别码>' }
    文本：以聊天形式发送 /addtrip <旧的识别码> <新的识别码>`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    },
    {
      name:'new_trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ],
  level: UAC.levels.admin,
};
