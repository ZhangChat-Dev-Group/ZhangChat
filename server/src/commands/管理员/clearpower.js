import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket,data) {
  if (!UAC.isModerator(socket.level)){
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20)
  }
  const sockets = server.findSockets({
    level: UAC.isAdmin
  })
  if (sockets.length === 0){
    return server.reply({
      cmd:'warn',
      text:'目前没有使用站长身份的用户'
    },socket)
  }
  var i = 0
  for (i in sockets){
    server.reply({
      cmd:'warn',
      text:'抱歉，由于某些原因，您即将被系统强制断开连接。'
    },sockets[i])
    sockets[i].terminate()
  }
  server.reply({
    cmd:'info',
    text:`[${socket.trip}] ${socket.nick} 在 ?${socket.channel} 强制断开了所有等级为站长的用户的连接。\n本次操作共断开了 ${sockets.length} 个连接。`
  },socket)
}

// module meta
export const info = {
  name: 'clearpower',
  description: '断开等级为站长的用户的连接，仅适用于紧急情况。',
  usage: `
    API: { cmd: 'clearpower' }
    文本：以聊天形式发送 /clearpower`,
  fastcmd:[]
};
