import dateFormat from 'dateformat';

export async function run(core,server,socket,payload) {
  return
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out', 'chat', this.time.bind(this),114514);
}

export function time(core,server,socket,payload) {
  if (typeof socket.lastRecvTime !== 'number') {
    // 如果没有上次收到信息的时间记录，则创建
    socket.lastRecvTime = Date.now()
    return payload    // 懂得都懂
  }

  if (Date.now() - socket.lastRecvTime >= 3 * 60 * 1000) {
    // 如果3分钟内没有收到信息，则显示当前时间
    server.reply({
      cmd: 'info',
      text: dateFormat('HH:MM:ss'),
      trip: 'Server'
    },socket)
  }
  socket.lastRecvTime = Date.now()    // 更新时间
  return payload
}

export const info = {
  name: 'auto-show-time',
  description: '自动显示时间',
  usage: `
    服务器专用`,
};
