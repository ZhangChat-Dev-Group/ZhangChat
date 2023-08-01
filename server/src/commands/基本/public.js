import * as UAC from '../utility/UAC/_info'

export function init(core) {
  if (!Array.isArray(core.pubChannels)) {
    core.pubChannels = []
  }
}

// module main
export async function run(core, server, socket, payload) {
  var mode = !core.pubChannels.includes(socket.channel)
  
  if (mode) core.pubChannels.push(socket.channel)
  else core.pubChannels = core.pubChannels.filter(c => c !== socket.channel)
  
  server.broadcastInfo(`已设置 ?${socket.channel} 为${mode ? '' : '非'}公开频道`, { channel: socket.channel, level: level => level < UAC.levels.moderator })
  server.broadcastInfo(`${socket.nick} 设置 ?${socket.channel} 为${mode ? '' : '非'}公开频道`, { level: UAC.isModerator })
}

export function showChannels(core, server, socket, payload) {
  payload.channels = core.pubChannels
  return payload
}

export function initHooks(server) {
  server.registerHook('out', 'home', this.showChannels.bind(this))
}

export const info = {
  name: 'public',
  description: '设置当前频道为公开或非公开频道',
  usage: `
    API: { cmd: 'public' }
    以聊天形式发送 /public`,
  dataRules: [],
  runByChat: true,
  level: UAC.levels.channelOwner,
};
