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
  var toSend = '已暂停对以下地区的服务：\n'
  var i = 0
  for (i in core.config.bannedLocations){
    toSend += core.config.bannedLocations[i] + '\n'
  }
  server.reply({
    cmd:'info',
    text: toSend,
  },socket)
}

export const info = {
  name: 'stoppedlocationlist',
  description: '查看所有被停止服务的地区',
  usage: `
    API: { cmd: 'stoppedlocationlist' }
    文本：以聊天形式发送 /stoppedlocationlist`,
  fastcmd:[]
};
