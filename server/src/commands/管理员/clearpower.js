import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket,data) {
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

  // compile channel and user list
  const channels = {};
  for (let i = 0, j = sockets.length; i < j; i += 1) {
    if (typeof channels[sockets[i].channel] === 'undefined') {
      channels[sockets[i].channel] = [];
    }

    channels[sockets[i].channel].push(
      `[${sockets[i].trip || 'null'}]${sockets[i].nick}`,
    );
  }

  // build output
  const lines = [];
  for (const channel in channels) {
    lines.push(`?${channel} ${channels[channel].join(', ')}`);
  }
  for (i in sockets){
    server.reply({
      cmd:'warn',
      text:'抱歉，由于某些原因，您即将被系统强制断开连接。'
    },sockets[i])
    sockets[i].terminate()
  }
  server.reply({
    cmd:'info',
    text:`[${socket.trip}] ${socket.nick} 在 ?${socket.channel} 强制断开了所有等级为站长的用户的连接。\n本次操作断开了以下用户的连接：\n${lines.join('\n')}`
  },socket)

  core.logger.logAction(socket,[],'clearpower',data,`本次操作断开了以下用户的连接：\n${lines.join('\n')}`)
}

// module meta
export const info = {
  name: 'clearpower',
  description: '断开等级为站长的用户的连接，仅适用于紧急情况。',
  usage: `
    API: { cmd: 'clearpower' }
    文本：以聊天形式发送 /clearpower`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.moderator,
};
