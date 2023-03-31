import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.lockedrooms === undefined){
    core.lockedrooms = []
  }
}
// module main
export async function run(core, server, socket, data) {
  var replytext= '锁定的频道（不建议长期锁定频道）：\n'
  for (var i=0; i<core.lockedrooms.length; i++) {
    replytext+=core.lockedrooms[i]+'\n'
  }
  server.reply({
    cmd:"info",
    text:replytext
  },socket)
}
// module meta
export const info = {
  name: 'lockedroomlist',
  description: '查看所有被锁定的频道',
  usage: `
    API: { cmd: 'lockedroomlist' }
    文本：以聊天形式发送 /lockedroomlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
