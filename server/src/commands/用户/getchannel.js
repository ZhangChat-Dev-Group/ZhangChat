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

  if (core.channelOwners[socket.channel]){
    if (server.findSockets({channel:socket.channel,trip:core.channelOwners[socket.channel]}).length !== 0){
      return server.reply({
        cmd:'warn',
        text:'抱歉，目前本房间的房主在线，您不能成为房主'
      },socket)
    }
    core.channelOwners[socket.channel] = socket.trip
    var i = 0
    var mySockets = server.findSockets({channel:socket.channel,trip:socket.trip})
    for (i in mySockets){
      mySockets[i].level = UAC.levels.channelOwner
      mySockets[i].uType = 'channelOwner'
    }
    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 成为新房主，识别码为 ${socket.trip}`
    },{channel:socket.channel})
  }else{
    core.channelOwners[socket.channel] = socket.trip
    var i = 0
    var mySockets = server.findSockets({channel:socket.channel,trip:socket.trip})
    for (i in mySockets){
      mySockets[i].level = UAC.levels.channelOwner
      mySockets[i].uType = 'channelOwner'
    }
    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 成为新房主，识别码为 ${socket.trip}`
    },{channel:socket.channel})
  }
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
