/*
 * Description: Make a user (spammer) dumb (mute)
 * Author: simple
 */

import * as UAC from '../utility/UAC/_info';

// module constructor
export function init(core) {
  if (typeof core.mute === 'undefined') {
    core.mute = {};
  }
}
function get_time_text(str){  
  var oDate = new Date(str),  
  oYear = oDate.getFullYear(),  
  oMonth = oDate.getMonth()+1,  
  oDay = oDate.getDate(),  
  oHour = oDate.getHours(),  
  oMin = oDate.getMinutes(),  
  oSen = oDate.getSeconds(),  
  oTime = oYear +' 年 '+ getzf(oMonth) +' 月 '+ getzf(oDay) +' 日 '+ getzf(oHour) +' 时 '+ getzf(oMin) +' 分 '+getzf(oSen)+' 秒';//最后拼接时间  
  return oTime;  
};  
//补0操作  
function getzf(num){  
  if(parseInt(num) < 10){  
      num = '0'+num;  
  }  
  return num;  
}  
function isMute(core,hash){
  if (core.mute[hash] === undefined){
    return false
  }else{
    if (core.mute[hash].time == 0 || core.mute[hash].time === undefined){
      return '你已被永久禁言，请等待管理员手动为你解除禁言。'
    }else{
      if (Date.now() >= core.mute[hash].time){
        core.mute[hash] = undefined
        return false
      }else{
        return '你已被禁言，禁言将在 '+get_time_text(core.mute[hash].time) +' 解除'
      }
    }
  }
}
// module main
export async function run(core, server, socket, data) {
  // 我认为让普通用户禁言别人很糟糕，你觉得呢？
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法执行此操作。'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    return true;
  }

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
  if (core.mute[badClient.hash] !== undefined){
    return server.reply({
      cmd:'warn',
      text:'该用户已被禁言，无需重复操作'
    },socket)
  }
  var time_text = '0 分钟（永久禁言，直到管理员手动解除）'
  data.time = Number(data.time)
  if (data.time < 0 || isNaN(data.time)){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  if (typeof data.time === 'number' && !isNaN(data.time) && data.time >0){
    core.mute[badClient.hash] = {
      time : Date.now() + (data.time * 60000)
    }
    time_text = data.time.toString()+' 分钟'
  }else if (data.time == 0){
    core.mute[badClient.hash] = {
      time : 0
    }
  }
  if (data.time == 0){
    time_text = '0 分钟（永久禁言，直到管理员手动解除）'
  }
  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick} 已在 ?${socket.channel} 禁言 ${badClient.nick}，被禁言的用户的hash为：${badClient.hash}\n禁言时长：${time_text}`,
  }, { level: UAC.isModerator });
  server.broadcast({
    cmd:'info',
    text:`${badClient.nick} 被禁言 ${time_text}`
  }, { level: (level) => level < UAC.levels.moderator });
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
  if (!socket.hash){
    return payload  //推给别人
  }
  if (typeof isMute(core,socket.hash) === 'string'){
    server.reply({
      cmd:'warn',
      text:isMute(core,socket.hash)
    },socket)
    return false
  }else{
    return payload
  }
}
export const requiredData = ['nick','time'];
export const info = {
  name: 'dumb',
  description: '禁言某个用户',
  usage: `
    API: { cmd: 'dumb', nick: '<目标用户的昵称>', time: 禁言时长（单位：分钟）（0为永久禁言）（类型：数字）}
    文本：以聊天形式发送 /dumb 目标昵称 禁言时长（单位：分钟）（0为永久禁言）`,
  fastcmd:[
    {
      name:'nick',
      len:1,
      check: UAC.verifyNickname
    },
    {
      name:'time',
      len:1,
      check: (text) => {
        var num = Number(text)
        return (!isNaN(num) && num >= 0)
      }
    }
  ]
};
info.aliases = ['muzzle', 'mute'];