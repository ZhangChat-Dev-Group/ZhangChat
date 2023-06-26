import * as UAC from '../utility/UAC/_info';

export function init(core) {
  if (typeof core.config.channelOwners !== 'object') {
    core.config.channelOwners = {}
  }
}

// module main
export async function run(core, server, socket, data) {
  if (socket.level !== UAC.levels.channelOwner) {
    return server.replyWarn('只有房主才能执行此操作', socket)
  }
  const target = server.findSocket({
    channel: socket.channel,
    nick: data.nick,
  })
  if (!target) {
    return server.replyWarn('找不到目标用户', socket)
  }
  if (target.level >= socket.level){
    return server.replyWarn('TA的等级和你相同或比你高', socket)
  }
  if (!target.trip){
    return server.replyWarn('有识别码是成为房主的先决条件，TA还没有识别码，快去提醒他添加吧', socket)
  }
  
  server.findSockets({
    channel: socket.channel,
    trip: socket.trip,
  }).forEach((s) => {
    if (core.config.powerfulUsers[s.trip] === UAC.levels.trustedUser) {
      s.level = UAC.levels.trustedUser
      s.uType = 'trusted'
    }else {
      s.level = UAC.levels.default
      s.uType = 'user'
    }
  })

  server.findSockets({
    channel: socket.channel,
    trip: target.trip,
  }).forEach((s) => {
    s.level = UAC.levels.channelOwner
    s.uType = 'channelOwner'
  })
  core.config.channelOwners[socket.channel] = target.trip
  core.configManager.set('channelOwners', core.config.channelOwners)
  server.broadcast({
    cmd:'info',
    text:`恭喜 ${target.nick} 被 ${socket.nick} 任命为新房主，识别码为 ${target.trip}`
  },{channel:socket.channel})
}

export const info = {
  name: 'give',
  runByChat: true,
  description: '将您的房主权限转让给他人',
  usage: `
    API: { cmd: 'give', nick: '<target nick>' }
    文本：以聊天形式发送 /give 昵称`,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick
    }
  ]
};
