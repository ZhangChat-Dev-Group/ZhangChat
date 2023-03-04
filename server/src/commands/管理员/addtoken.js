/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.tokens){
    core.config.tokens = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }
  
  if (typeof data.token !== 'string' || !data.token || !data.trip || typeof data.trip !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }

  if (core.config.tokens.filter((i) => i.token.toLowerCase() === data.token.toLowerCase()).length !== 0){
    return server.reply({
      cmd:'warn',
      text:'该token已经存在了'
    },socket)
  } 

  core.config.tokens.push({
    trip:data.trip,
    token:data.token
  })

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 添加了一个token：${data.token}\n该token绑定识别码：${data.trip}`,
  }, { level: UAC.isModerator });

  // 存为档案
  core.logger.logAction(socket,[],'addtoken',data)

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
  if (!payload.token){    //如果没有提供token
    socket.isBot = false
    socket.token = ''
    return payload
  }
  var targetTokens = core.config.tokens.filter((i) => i.token === payload.token)
  if (targetTokens.length === 0){
    server.reply({
      cmd:'warn',
      text:'您提供的token无效，请联系小张聊天室管理员获取你的token，谢谢合作。'
    },socket)
    socket.terminate()
    return false
  }
  const targetToken = targetTokens[0]
  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);

  if (typeof userInfo === 'string'){
    return payload
  }

  if (userInfo.trip !== targetToken.trip){
    server.reply({
      cmd:'warn',
      text:'您的识别码和您提供的token所绑定的识别码不一致，请确保你的密码正确。'
    },socket)
    socket.terminate()
    return false
  }
  socket.isBot = true
  socket.token = payload.token
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

export const requiredData = ['token','trip'];
export const info = {
  name: 'addtoken',
  description: '添加一个给机器人使用的token',
  usage: `
    API: { cmd: 'addtoken', trip: '<机器人的识别码>', token: '<the token you want to add>' }
    文本：以聊天形式发送 /addtoken token 机器人识别码`,
  fastcmd:[    //fastcmd支持
    {
      name:'token',
      len:1
    },
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};
