export async function run(core, server, socket, payload) {}
// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.location.bind(this));
}

export function location(core,server,socket,payload){
  if (!socket.headers['cf-ipcountry']) return payload
  socket.country = socket.headers['cf-ipcountry']
  if (socket.country.toLowerCase() !== 'CN') {
    server.replyWarn(`很抱歉，我们检测到您不在中华人民共和国境内，所以拒绝了您的访问请求。请到中华人民共和国境内访问本网站，感谢您对我们的支持。\nSorry, we have detected that you are not in the PRC, so we have refused your request for visit. Please visit this website in the PRC and thank you for your support.`, socket)
    socket.terminate()
    return false
  }
  return payload
}

export const info = {
  name: 'cloudflare',
  description: '通过Cloudflare代理添加的请求头为服务器提供额外的功能==***（警告：如果服务器没有Cloudflare代理，则请不要使用本模块，这可能会造成安全漏洞）***==',
  usage: `服务器内部自动调用，如果你想用，就说明你不是人。`,
};
