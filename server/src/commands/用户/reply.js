// module main
export async function run(core, server, socket, payload) {
  if (!socket.whisperReply) return server.replyWarn('还没有人私信你，快去发起私信吧', socket)

  core.commands.handleCommand(server, socket, {
    cmd: 'whisper',
    nick: socket.whisperReply,
    text: payload.text,
  })
}

export const info = {
  name: 'reply',
  aliases: ['r'],
  description: '快速回复上一个私信你的人',
  usage: `
    API: { cmd: 'reply', text: '<text to whisper>' }
    以聊天形式发送 /r 信息`,
  dataRules: [
    {
      name: 'text',
      all: true,
      required: true,
    }
  ],
  runByChat: true,
};
