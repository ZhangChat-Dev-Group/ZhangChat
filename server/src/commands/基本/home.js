// module main
export async function run(core, server, socket, payload) {
  if (socket.channel) return server.replyWarn('现在不应该运行此命令', socket)
  server.reply({
    cmd: 'home',
    users: server.findSockets({ channel: channel => !!channel }).length,
  }, socket)
  socket.terminate()
}

export const info = {
  name: 'home',
  description: '获取首页展示的信息',
  usage: `
    API: { cmd: 'home' }`,
  dataRules: [],
  runByChat: false,
};
