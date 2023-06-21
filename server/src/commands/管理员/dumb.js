/*
 * Description: Make a user (spammer) dumb (mute)
 * Author: simple
 */

import * as UAC from '../utility/UAC/_info';
const moment = require('moment')

export function isMuted(core, ip){
  if (!core.mutedIP.has(ip)) return false
  const time = core.mutedIP.get(ip)
  if (time <= Date.now()) {
    core.mutedIP.delete(ip)
    return false
  }
  return time
}

export function init(core) {
  if (typeof core.mutedIP !== 'object') {
    core.mutedIP = new Map()
  }
  core.isMuted = isMuted
}


// module main
export async function run(core, server, socket, data) {
  // find target user
  let badClient = server.findSockets({ channel: socket.channel, nick: data.nick });
  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '不能在聊天室找到该用户',
    }, socket);
  }

  [badClient] = badClient;

  //自相残杀很刺激，但是也很危险，你说呢？
  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '你不知道不能禁言同级别或级别更高的用户么？',
    }, socket);
  }

  if (server.findSockets({
    address: badClient.address,
    level: (l) => l >= socket.level,
  }).length > 0){    //防止封禁其他管理员开的小号
    return server.reply({
      cmd: 'warn',
      text: `你的某位同事和 @${badClient.nick} 使用了同一个IP地址，如果你把 @${badClient.nick} 禁言了，那么你的同事也会遭殃的！`,
    }, socket);
  }

  //用户已经受伤了，别再捅刀了……
  if (isMuted(core, badClient.address)) return server.replyWarn('目标用户已经被禁言了，无需重复操作', socket)
  
  const time = Number.parseFloat(data.time)
  core.mutedIP.set(badClient.address, Date.now() + time * 60 * 1000)
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 在 ?${socket.channel} 禁言了 ${badClient.nick} ${time} 分钟，被禁言的用户的IP为：${badClient.address}`,
  }, { level: UAC.isModerator });
  server.broadcast({
    cmd:'info',
    text:`${badClient.nick} 被禁言 ${time} 分钟`
  }, { level: (level) => level < UAC.levels.moderator });

  core.logger.logAction(socket,[],'dumb',data,`被禁言的用户的IP为：${badClient.address}，识别码为：${badClient.trip || '<null>'}，用户等级为：${badClient.level}`)
  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.AreYouMute.bind(this), 10);
  server.registerHook('in', 'invite', this.AreYouMute.bind(this), 10);
  server.registerHook('in', 'whisper', this.AreYouMute.bind(this), 10);
  server.registerHook('in', 'emote', this.AreYouMute.bind(this), 10);
  //server.registerHook('in', 'chat', this.dumbCheck.bind(this));
}
export function AreYouMute(core,server,socket,payload){
  if (isMuted(core, socket.address)){
    const time = moment(isMuted(core, socket.address)).format('YYYY-MM-DD HH:mm:ss')
    server.replyWarn(`很抱歉，你已经被禁言，禁言将在 ${time} 自动解除，请耐心等待，==不要进进出出==。`)
    return false
  }else{
    return payload
  }
}

export const info = {
  name: 'dumb',
  description: '禁言某个用户',
  usage: `
    API: { cmd: 'dumb', nick: '<目标用户的昵称>', time: 禁言时长（单位：分钟）（类型：数字）}
    文本：以聊天形式发送 /dumb 目标昵称 禁言时长（单位：分钟）`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick,
      required: true
    },
    {
      name: 'time',
      verify: (time) => {
        const num = Number.parseFloat(time)
        if (isNaN(num)) return false
        return num > 0
      },
      required: true,
      errorMessage: '时间必须为数字，并且大于0',
    }
  ],
  level: UAC.levels.moderator,
};
info.aliases = ['muzzle', 'mute'];