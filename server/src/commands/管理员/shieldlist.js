import * as UAC from '../utility/UAC/_info';
export function init(core){
  if (!core.config.shield){
    core.config.shield = []
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作'
    },socket)
    return server.police.frisk(socket.address, 10);
  }
  var send = '屏蔽的内容：\n'
  var i = 0;
  for (i in core.config.shield){
    send += `\`${core.config.shield[i]}\`\n`
  }
  server.reply({
    cmd:'info',
    text:send
  },socket)
  return true;
}
export const info = {
  name: 'shieldlist',
  description: '该命令用于查看屏蔽的内容。',
  usage: `
    API: { cmd: 'shieldlist' }
    文本：以聊天形式发送 /shieldlist`,
  fastcmd:[]
};
