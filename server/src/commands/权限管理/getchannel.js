import * as UAC from '../utility/UAC/_info';

export function init(core) {
  if (typeof core.config.channelOwners !== 'object') {
    core.config.channelOwners = {}
  }
}

// module main
export async function run(core, server, socket, payload) {
  if (UAC.isChannelOwner(socket.level)){
    return server.reply({
      cmd:'warn',
      text:'您已经是房主了，或者等级比房主高'
    },socket)    //你现在就是房主
  }

  if (!socket.trip){
    return server.reply({
      cmd:'warn',
      text:'抱歉，有识别码是成为房主的先决条件，您目前没有识别码'
    },socket)
  }

  if (core.config.channelOwners[socket.channel]) {
    if (server.findSocket({
      channel: socket.channel,
      trip: core.config.channelOwners[socket.channel]
    })) return server.replyWarn('当前频道的房主在线，你无法成为房主', socket)
  }

  core.config.channelOwners[socket.channel] = socket.trip
  server.findSockets({
    channel: socket.channel,
    trip: socket.trip,
  }).forEach((s) => {
    s.level = UAC.levels.channelOwner
    s.uType = 'channelOwner'
  })
  server.broadcast({
    cmd: 'info',
    text: `恭喜 ${socket.nick} 成为房主，识别码为 ${socket.trip}`
  }, { channel: socket.channel })
  core.configManager.save()
}

export const info = {
  name: 'getchannel',
  description: '获取您所在的频道的所有权，即成为房主',
  usage: `
    API: { cmd: 'getchannel' }
    文本：以聊天形式发送 /getchannel`,
  dataRules: [],
  runByChat: true,
};
