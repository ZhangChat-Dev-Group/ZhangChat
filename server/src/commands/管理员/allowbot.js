import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.bots){
    core.config.bots = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (!data.trip || typeof data.trip !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }

  var mode = '添加'
  if (core.config.bots.includes(data.trip)) {
    mode = '删除'
    core.config.bots = core.config.bots.filter((trip) => trip !== data.trip)
  }else{
    core.config.bot.push(data.trip)
  }

  server.broadcast({
    cmd: 'info',
    text: `[\`${socket.trip}\`] \`${socket.nick}\` ${mode}了机器人识别码：${data.trip}`
  }, { level: UAC.isModerator })

  server.broadcast({
    cmd: 'info',
    text: `已为此识别码${mode}放置机器人权限`
  }, { trip: data.trip })

  // 存为档案
  core.logger.logAction(socket,[],'allowbot',data,'操作模式：'+mode)

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  return true;
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

export const requiredData = ['trip'];
export const info = {
  name: 'allowbot',
  description: '添加或删除机器人的识别码',
  usage: `
    API: { cmd: 'allowbot', trip: '<机器人的识别码>' }
    文本：以聊天形式发送 /allowbot 机器人的识别码`,
  fastcmd:[    //fastcmd支持
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ],
  level: UAC.levels.moderator,
};
