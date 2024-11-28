export async function run(core, server, socket, data) {}

export function init(core) {
  if (typeof core.autoCloseTaskId === 'number') clearInterval(core.autoCloseTaskId)
  core.autoCloseTaskId = setInterval(() => {
    const clients = core.server.clients
    const threshold = 50
    const dontWait = clients.lenght > threshold    // 当连接数量超过风险阈值时，不必检测是否一定时间内没有加入频道，直接关闭空闲的连接
    if (dontWait) core.logger.logAction({}, [], 'auto-close-connection', {}, `警告：当前连接数量（${clients.lenght}）已经超过风险阈值（${threshold}），现在将强行关闭所有空闲连接`)

    for (let client of clients) {
      if (client.channel) continue
      if (dontWait) client.terminate()    // 无需等待，直接关闭
      else if (Date.now() - client.connectTime >= 2 * 60 * 1000) client.terminate()    // 两分钟内没有加入频道，强行关闭连接
    }
  }, 1 * 60 * 1000)    // 每分钟执行一次
}

export const info = {
  name: 'auto-close-connection',
  usage: '服务器内部专用。~~如果你用就说明你不是人。~~',
  description: '自动关闭无用的连接',
  dataRules: []
};
