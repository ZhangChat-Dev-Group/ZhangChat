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
  var replytext= '锁定的房间（不建议长期锁定房间）：\n'
  for (var i=0; i<core.lockedroom.length; i++) {
    replytext+=core.lockedroom[i]+'\n'
  }
  server.reply({
    cmd:"info",
    text:replytext
  },socket)
}
// module meta
export const info = {
  name: 'lockedroomlist',
  description: '查看所有被锁定的房间',
  usage: `
    API: { cmd: 'lockedroomlist' }
    文本：以聊天形式发送 /lockedroomlist`,
  fastcmd:[]
};
