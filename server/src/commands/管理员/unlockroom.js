import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.lockedroom === undefined){
    core.lockedroom = []
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }
  if (data.channel === undefined || data.channel === ''){
    data.channel = socket.channel
  }
  if (core.lockedroom.indexOf(data.channel) === -1){
    return server.reply({
      cmd:"warn",
      text:"这个房间没有被锁定，无需解锁"
    },socket)
  }
  var new_list = []
  for (var i=0; i<core.lockedroom.length; i++) {
    if(core.lockedroom[i] != data.channel) {
      new_list.push(core.lockedroom[i])
    }
  }
  core.lockedroom=new_list
  server.broadcast({
    cmd:"info",
    text:`${socket.nick} 已解除锁定 ?${data.channel}`
  },{level: UAC.isModerator})
  server.broadcast({
    cmd:"info",
    text:"该房间已解除锁定"
  },{channel:data.channel,level:(level) => level < UAC.levels.moderator})
  core.logger.logAction(socket,[],'unlockroom',data)
}
// module meta
export const info = {
  name: 'unlockroom',
  description: '解除锁定一个房间',
  usage: `
    API: { cmd: 'unlockroom', channel: '<目标房间（选填）>' }
    文本：以聊天形式发送 /unlockroom <目标房间（选填）>`,
  fastcmd:[
    {
      name:'channel',
      len:1
    }
  ]
};
