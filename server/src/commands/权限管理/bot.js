import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.bots){
    core.config.bots = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (typeof data.trip !== 'string') {
    // 没有提供识别码，则显示列表
    let txt = '机器人列表：\n'
    core.config.bots.forEach((trip) => {
      txt += `\`${trip}\`\n`
    })
    return server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
  }

  var mode = true    // 模式：添加；false为删除
  const trip = data.trip

  if (core.config.bots.includes(trip)) {
    mode = false    // 模式：删除
    core.config.bots = core.config.bots.filter((t) => t !== trip)    // 删除
  }else {
    core.config.bots.push(trip)    // 添加
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了机器人：${trip}`
  }, { level: UAC.isModerator })

  server.broadcast({
    cmd: 'info',
    text: `您被${mode ? '允许' : '禁止'}开发机器人`
  }, { trip: trip })

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存配置失败，请检查日志。',
    }, {level:UAC.isModerator});
  }
}

export function initHooks(server){
  server.registerHook('in','join',this.addTokenToSocket.bind(this),1)
  server.registerHook('out','chat',this.addIsBotToChatPayload.bind(this),1)
}

export function addTokenToSocket(core,server,socket,payload){
  var maybeBot = false    // 可能是bot
  if (payload.token || payload.bot) {
    // 提供了token（兼容旧版机器人）或明确说明自己是bot
    maybeBot = true
  }
  if (!maybeBot){
    return payload    // 不可能是bot，跳过
  }

  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);    // 提取用户信息

  if (!userInfo.trip) {
    // 自己说自己是bot却没有识别码，很明显是糊弄我呢
    server.reply({
      cmd: 'warn',
      text: '认证错误：您以机器人身份加入聊天室却没有识别码，请加好密码后再试。'
    }, socket)
    socket.terminate()
    return false
  }
  if (!core.config.bots.includes(userInfo.trip)) {
    // 不在列表内
    server.reply({
      cmd: 'warn',
      text: '认证错误：您无权以机器人身份加入聊天室，请确认您被授权且密码正确。'
    }, socket)
    socket.terminate()
    return false
  }
  socket.isBot = true
  return payload
}

export function addIsBotToChatPayload(core,server,socket,payload){
  if (payload.added === true){
    return payload
  }
  var senders = server.findSockets({
    channel:socket.channel,
    nick:payload.nick
  })
  if (senders.length === 0){
    return payload
  }
  var sender = senders[0]
  payload.isBot = sender.isBot || false
  payload.added = true
  return payload
}

export const info = {
  name: 'bot',
  description: '显示、添加或删除机器人的识别码',
  usage: `
    API: { cmd: 'bot', trip: '<机器人的识别码（不填则显示列表）>' }
    文本：以聊天形式发送 /bot 机器人的识别码（不填则显示列表）`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    }
  ],
  level: UAC.levels.moderator,
};
