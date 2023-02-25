/*
  Description: Removes the target socket from the current channel and forces a join event in another
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string' || typeof data.channel !== 'string') {
    server.reply({
      cmd: 'warn',
      text: '数据无效',
    }, socket);
    return true;
  }

  if (data.channel === socket.channel) {
    // moving them into the same channel? y u do this?
    server.reply({
      cmd: 'warn',
      text: '不能把目标用户移动到相同的房间里',
    }, socket);
    return true;
  }

  const badClients = server.findSockets({ channel: socket.channel, nick: data.nick });

  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到你指定的用户',
    }, socket);
  }

  const badClient = badClients[0];

  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '不能移动你的同事，这是非常粗鲁的',
    }, socket);
  }

  const currentNick = badClient.nick.toLowerCase();
  const userExists = server.findSockets({
    channel: data.channel,
    nick: (targetNick) => targetNick.toLowerCase() === currentNick,
  });

  if (userExists.length > 0) {
    // That nickname is already in that channel
    server.reply({
      cmd: 'warn',
      text: '不能移动该用户，因为目标房间内已经有人使用了他昵称了',
    }, socket);
    return true;
  }
  // TODO: import from join module
  const newPeerList = server.findSockets({ channel: data.channel });
  const moveAnnouncement = {
    cmd: 'onlineAdd',
    nick: badClient.nick,
    trip: badClient.trip || '',
    hash: server.getSocketHash(badClient),
  };

  const nicks = [];
  const users = []

  for (let i = 0, l = newPeerList.length; i < l; i += 1) {
    server.reply(moveAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick);
    users.push({
      nick: newPeerList[i].nick,
      trip: newPeerList[i].trip,
      utype: newPeerList[i].uType, /* @legacy */
      hash: newPeerList[i].hash,
      level: newPeerList[i].level,
      userid: newPeerList[i].userid,
      channel: newPeerList[i].channel,
      client: newPeerList[i].client || '未知客户端',
      isme: false,
    })
  }

  nicks.push(badClient.nick);
  users.push({
    nick: badClient.nick,
    trip: badClient.trip,
    utype: badClient.uType, /* @legacy */
    hash: badClient.hash,
    level: badClient.level,
    userid: badClient.userid,
    channel: badClient.channel,
    client: badClient.client || '未知客户端',
    isme: true,
  })


  server.reply({
    cmd: 'onlineSet',
    nicks,
    users,
  }, badClient);

  badClient.channel = data.channel;
  server.broadcast({
    cmd: 'info',
    text: `${badClient.nick} 被管理员移入 ?${data.channel}`,
  }, { channel: data.channel, level: (l) => l < UAC.levels.moderator });
  server.broadcast({
    cmd: 'info',
    text: `${badClient.nick} 被 ${socket.nick} 从 ?${socket.channel} 移入 ?${data.channel}`,
  }, { channel: data.channel, level: UAC.isModerator });
  server.broadcast({
    cmd: 'info',
    text:`${badClient.nick} 被移出该房间`
  },{ channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  server.broadcast({
    cmd:'info',
    text:`${badClient.nick} 被 ${socket.nick} 移入 ?${data.channel}`
  },{ channel: socket.channel, level: UAC.isModerator })
  server.broadcast({
    cmd: 'onlineRemove',
    nick: badClient.nick
  }, { channel: socket.channel });
  
  return true;
}

export const requiredData = ['nick', 'channel'];
export const info = {
  name: 'moveuser',
  description: '将目标用户正常移动到指定的房间',
  usage: `
    API: { cmd: 'moveuser', nick: '<target nick>', channel: '<new channel>' }
    文本：以聊天形式发送 /moveuser 目标昵称 目标房间`,
  fastcmd:[
    {
      name:'nick',
      len:1,
      check: UAC.verifyNickname
    },
    {
      name:'channel',
      len:1
    }
  ]
};
