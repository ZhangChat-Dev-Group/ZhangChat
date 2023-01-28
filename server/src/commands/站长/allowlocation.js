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
  if (core.config.bannedLocations.indexOf(data.location.toLowerCase()) === -1){
    return server.reply({
      cmd:'warn',
      text:'该地区没有被暂停服务，无需操作'
    },socket)
  }
  core.config.bannedLocations = core.config.bannedLocations.filter((l) => l.toLowerCase() !== data.location.toLowerCase())
  server.broadcast({
    cmd:'info',
    text:`已取消暂停对 ${data.location} 地区的服务`
  },{})
  if (!core.configManager.save()) {
    return server.reply({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, socket);
  }
}

export const requiredData = ['location'];
export const info = {
  name: 'allowlocation',
  description: '取消停止对指定地区的服务',
  usage: `
    API: { cmd: 'allowlocation', location: '<target location>' }
    文本：以聊天形式发送 /allowlocation 目标地区
    例如：{ cmd: 'allowlocation', location: '天津市' } 或者 /allowlocation 天津市`,
  fastcmd:[
    {
      name:'location',
      len:1
    }
  ]
};
