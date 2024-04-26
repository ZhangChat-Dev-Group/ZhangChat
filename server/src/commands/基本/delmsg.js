import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, payload) {
  if (!socket.lastMsg) return server.replyWarn('找不到你要撤回的信息', socket)
  if (socket.lastMsg.time + 2 * 60 * 200 < Date.now()) return server.replyWarn('只能撤回两分钟内发送的信息', socket)

  const id = socket.lastMsg.id
  const msg = socket.lastMsg.msg
  delete socket.lastMsg

  core.chatDB.queryData('update chat set show = 0 where msg_id = "' + id + '"', (ret) => {
    server.broadcast({
      cmd: 'delmsg',
      id,
    }, { channel: socket.channel })
    server.broadcastInfo(`${socket.nick}#${socket.trip} 撤回了一条信息，原文：\n${msg}`, { channel: socket.channel, level: UAC.isModerator })
  })
}

export const info = {
  name: 'delmsg',
  description: '撤回你发送的上一条信息，两分钟内有效，管理员可以看到被撤回的信息',
  usage: `
    API: { cmd: 'delmsg' }
    以聊天形式发送 /delmsg`,
  dataRules: [],
  runByChat: true,
};
