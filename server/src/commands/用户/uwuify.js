const uwuifier = require('uwuify');
const uwuify = new uwuifier();

export async function run(core,server,socket,payload) {
  const uwu = !socket.uwu    // 反转

  socket.uwu = uwu    // 设置属性

  server.broadcast({
    cmd:'info',
    text: `${socket.nick} 设置自己的 uwuify 状态为：${uwu ? '开启' : '关闭'}`
  },{
    channel: socket.channel
  })
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out', 'chat', this.uwu.bind(this),5);
  // TODO: add whisper hook, need hook priorities todo finished first
}

export function uwu(core,server,socket,payload) {
  if (payload.uwu) {
    return payload
  }

  payload.uwu = true

  if (typeof payload.text !== 'string' || typeof payload.nick !== 'string') {
    return payload
  }

  var client = server.findSockets({
    channel: socket.channel,
    nick: payload.nick
  })

  if (client.length === 0) {
    return payload
  }

  if (!client[0].uwu) {
    return payload
  }

  const u = uwuify.uwuify(payload.text)

  if (u === payload.text) {
    payload.text+= ' uwu'
  }else {
    payload.text = u
  }

  return payload
}

export const info = {
  name: 'uwu',
  description: 'uwu',
  usage: `
    API: { cmd: 'uwuify' }
    文本：以聊天形式发送 /uwuify`,
  fastcmd:[]
};
