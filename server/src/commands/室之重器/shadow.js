import * as UAC from '../utility/UAC/_info';

export function init(core) {
  if (typeof core.shadow !== 'object') core.shadow = {}
}

export async function run(core,server,socket,payload) {
  if (socket.channel === payload.channel) return server.replyWarn('影子频道不能为当前所在频道，否则环路')
  if (payload.channel) {
    core.shadow[socket.channel] = payload.channel
    server.broadcastInfo(`${socket.nick} 将 ?${payload.channel} 设置为 ?${socket.channel} 的影子频道`, { level: UAC.isModerator })
  } else {
    delete core.shadow[socket.channel]
    server.broadcastInfo(`${socket.nick} 删除了 ?${socket.channel} 的影子频道`, { level: UAC.isModerator })
  }

  core.logger.logAction(socket, [], 'shadow', payload)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out', 'chat', this.forward.bind(this),99999);
}

export function forward(core,server,socket,payload) {
  if (payload.forwarded) return payload
  payload.forwarded = true

  const target = core.shadow[socket.channel]
  if (!target) return payload

  server.broadcast(payload, { channel: target })
  return payload
}

export const info = {
  name: 'shadow',
  description: '为当前频道创建影子频道，主频道的消息自动转发到影子频道，影子频道内的消息不转发到主频道',
  usage: `
    API: { cmd: 'shadow', channel: '主频道（不填则删除影子频道）' }
    文本：以聊天形式发送 /shadow 主频道（不填则删除影子频道）`,
  dataRules: [
    {
      name: 'channel',
      verify: UAC.verifyChannel,
      errorMessage: UAC.nameLimit.channel,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator
};
