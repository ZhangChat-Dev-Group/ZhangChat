import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (typeof core.config.bannedLocations !== 'object'){
    core.config.bannedLocations = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }
  if (!data.location || typeof data.location !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  if (core.config.bannedLocations.indexOf(data.location.toLowerCase()) !== -1){
    return server.reply({
      cmd:'warn',
      text:'该地区已经被暂停服务了，无需重复添加'
    },socket)
  }
  core.config.bannedLocations.push(data.location.toLowerCase())
  server.broadcast({
    cmd:'info',
    text:`已暂停对 ${data.location} 地区的服务`
  },{})
  var sockets = server.findSockets({
    location: (l) => l.split(' ')[l.split(' ').length - 1].toLowerCase() === data.location.toLowerCase()
  })
  var i = 0
  for (i in sockets){
    server.reply({
      cmd:'warn',
      text:'抱歉，XChat已暂停对您所在的地区的服务'
    },sockets[i])
    sockets[i].terminate()
  }
  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, socket);
  }
}

export const requiredData = ['location'];
export const info = {
  name: 'stoplocation',
  description: '停止对指定地区的服务并立刻断开在目标地区内的用户的连接',
  usage: `
    API: { cmd: 'stoplocation', location: '<target location>' }
    文本：以聊天形式发送 /stoplocation 目标地区
    例如：{ cmd: 'stoplocation', location: '天津市' } 或者 /stoplocation 天津市`,
  fastcmd:[
    {
      name:'location',
      len:1
    }
  ]
};
