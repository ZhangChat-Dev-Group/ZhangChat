const xss = require('xss')    //yo

export async function run(core, server, socket, payload) {
  //啥都没有
  return true    //这不还是有吗？
}
// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.inCommingData.bind(this));
  server.registerHook('out', 'chat', this.outGoingData.bind(this));
  server.registerHook('out', 'html', this.outGoingData.bind(this));
}

export function inCommingData(core,server,socket,payload){
  socket.head = xss(payload.head) /* XXS别给我XSS */ || 'imgs/head.png'
  return payload
}

export function outGoingData(core,server,socket,payload){
  var sender = server.findSockets({
    channel:socket.channel,
    nick:payload.nick
  })[0]
  var head = 'imgs/head.png'
  if (sender){
    head = sender.head || 'imgs/head.png'
  }
  payload.head = head
  return payload
}


export const info = {
  name: 'head',
  description: '给用户添加头像',
  usage: `服务器内部自动调用，如果你想用，就说明你不是人。`,
};
