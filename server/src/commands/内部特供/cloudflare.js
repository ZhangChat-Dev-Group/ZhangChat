export async function run(core, server, socket, payload) {}
// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.location.bind(this));
}

export function location(core,server,socket,payload){
  if (!socket.headers['cf-ipcountry']) return payload
  socket.country = socket.headers['cf-ipcountry']
  return payload
}

export const info = {
  name: 'cloudflare',
  description: '通过Cloudflare代理添加的请求头为服务器提供额外的功能==***（警告：如果服务器没有Cloudflare代理，则请不要使用本模块，这可能会造成安全漏洞）***==',
  usage: `服务器内部自动调用，如果你想用，就说明你不是人。`,
};
