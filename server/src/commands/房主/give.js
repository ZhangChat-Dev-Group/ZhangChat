/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

import * as UAC from '../utility/UAC/_info';

export function init (core){
  if (typeof core.channelOwners !== 'object'){
    core.channelOwners = {}
    /*
      格式：
      {
        channel1: trip1
      }
    */
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (socket.level !== UAC.levels.channelOwner) {
    return server.reply({
      cmd:'warn',
      text:'只有房主才能执行此操作'
    },socket)
  }
  if (!data.nick || typeof data.nick !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  var targetSockets = server.findSockets({
    channel:socket.channel,
    nick:data.nick
  })
  if (targetSockets.length === 0){
    return server.reply({
      cmd:'warn',
      text:'找不到目标用户'
    },socket)
  }
  var target = targetSockets[0]
  if (target.level >= socket.level){
    return server.reply({
      cmd:'warn',
      text:'TA的等级和你相同或比你高'
    },socket)
  }
  if (!target.trip){
    return server.reply({
      cmd:'warn',
      text:'有识别码是成为房主的先决条件，TA目前没有识别码'
    },socket)
  }
  var i = 0
  var mySockets = server.findSockets({channel:socket.channel,trip:socket.trip})
  for (i in mySockets){
    mySockets[i].level = UAC.levels.default
    mySockets[i].uType = 'user'
    core.config.trusted.forEach((trip) => {
      if (mySockets[i].trip === trip) {
        mySockets[i].uType = 'trusted'; /* @legacy */
        mySockets[i].level = UAC.levels.trustedUser;
      }
    });
  }
  
  core.channelOwners[socket.channel] = target.trip
  var i = 0
  var mySockets = server.findSockets({channel:socket.channel,trip:target.trip})
  for (i in mySockets){
    mySockets[i].level = UAC.levels.channelOwner
    mySockets[i].uType = 'channelOwner'
  }
  server.broadcast({
    cmd:'info',
    text:`${target.nick} 成为新房主，识别码为 ${target.trip}`
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
