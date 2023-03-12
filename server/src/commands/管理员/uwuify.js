import * as UAC from '../utility/UAC/_info';

const uwuifier = require('uwuify');
const uwuify = new uwuifier();

export async function run(core,server,socket,payload) {
  if (!UAC.isModerator(socket.level)) {
    return server.reply({
      cmd:'warn',
      text:'权限不足，无法操作'
    },socket)
  }

  var client = server.findSockets({
    channel: socket.channel,
    nick: payload.nick || socket.nick
  })

  if (client.length === 0) {
    return server.reply({
      cmd:'warn',
      text: `找不到 ${payload.nick || socket.nick}`
    },socket)
  }

  var [client] = client

  const uwu = !client.uwu    // 反转

  client.uwu = uwu    // 设置属性

  server.broadcast({
    cmd:'info',
    text: `${socket.nick} 设置 ${client.nick} 的 uwuify 状态为：${uwu ? '开启' : '关闭'}`
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

export const requiredData = ['nick']

export const info = {
  name: 'uwuify',
  description: 'uwu',
  usage: `
    API: { cmd: 'uwuify', nick: '<目标用户的昵称>' }
    文本：以聊天形式发送 /uwuify <目标用户的昵称>`,
  fastcmd:[
    {
      name:'nick',
      len:1,
    }
  ]
};
