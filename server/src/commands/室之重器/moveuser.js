/*
  Description: Removes the target socket from the current channel and forces a join event in another
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (data.channel === socket.channel) {
    // moving them into the same channel? y u do this?
    server.reply({
      cmd: 'warn',
      text: '不能把目标用户移动到相同的频道里',
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
      text: '不能移动该用户，因为目标频道内已经有人使用了他昵称了',
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


  if (!data.quiet) server.reply({
    cmd: 'onlineSet',
    nicks,
    users,
  }, badClient);

  if (!data.quiet) badClient.channel = data.channel;    // 非静默模式，立刻改变频道以让目标用户收到频道被更改的通知
  server.broadcast({
    cmd: 'info',
    text: `${badClient.nick} 被管理员移入 ?${data.channel}`,
  }, { channel: data.channel, level: (l) => l < UAC.levels.moderator });
  server.broadcast({
    cmd: 'info',
    text: `${badClient.nick} 被 ${socket.nick} 从 ?${socket.channel} 移入 ?${data.channel} 静默模式状态：${data.quiet ? '开' : '关'}`,
  }, { channel: data.channel, level: UAC.isModerator });
  if (data.quiet) badClient.channel = data.channel;    // 静默模式，广播完毕后再修改频道
  server.broadcast({
    cmd: 'info',
    text:`${badClient.nick} 被移出该频道`
  },{ channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  server.broadcast({
    cmd:'info',
    text:`${badClient.nick} 被 ${socket.nick} 移入 ?${data.channel} 静默模式状态：${data.quiet ? '开' : '关'}`
  },{ channel: socket.channel, level: UAC.isModerator })
  server.broadcast({
    cmd: 'onlineRemove',
    nick: badClient.nick
  }, { channel: socket.channel });

  core.logger.logAction(socket,[],'moveuser',data)
  
  return true;
}

export const requiredData = ['nick', 'channel'];
export const info = {
  name: 'moveuser',
  description: '将目标用户正常移动到指定的频道，可选择开启静默模式，即不告知目标用户被移动',
  usage: `
    API: { cmd: 'moveuser', nick: '<target nick>', channel: '<new channel>', quiet: true || false }
    文本：以聊天形式发送 /moveuser 目标昵称 目标频道 （如果在目标频道后面加一个空格，再加上随机的字符串，则开启静默模式）`,
  runByChat: true,
  dataRules: [
    {
      name:'nick',
      required: true,
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick,
    },
    {
      name:'channel',
      required: true,
      verify: UAC.verifyChannel,
      errorMessage: UAC.nameLimit.channel,
    },
    {
      name: 'quiet',
    }
  ],
  level: UAC.levels.moderator,
};
