/*
  Description: Initial entry point, applies `channel` and `nick` to the calling socket
*/

import * as UAC from '../utility/UAC/_info';

// module support functions
const crypto = require('crypto');

const hash = (password) => {
  const sha = crypto.createHash('sha256');
  sha.update(password);
  return sha.digest('base64').substr(0, 6);
};

// exposed "login" function to allow hooks to verify user join events
// returns object containing user info or string if error
export function parseNickname(core, data) {
  const userInfo = {
    nick: '',
    uType: 'user', /* @legacy */
    trip: '',
    level: UAC.levels.default,
    client: '未知客户端',
  };

  // seperate nick from password
  const nickArray = data.nick.split('#', 2);
  userInfo.nick = nickArray[0].trim();

  if (!UAC.verifyNickname(userInfo.nick)) {
    // return error as string
    return '昵称只能由中文、字母、数字、下划线组成，且不能超过24个字符';
  }

  let password = undefined;
  // prioritize hash in nick for password over password field
  if (typeof nickArray[1] === 'string') {
    password = nickArray[1];
  } else if (typeof data.password === 'string') {
    password = data.password;
  }

  if (password){
    const passwordCheck = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/    //给密码加点料
    if (!passwordCheck.test(password)){
      userInfo.passwordWarning = true    //弱密码警告
    }

    const trip = hash(password + core.config.tripSalt)
    userInfo.trip= core.config.trips[trip] || trip
    userInfo.password = password
  }else{
    userInfo.trip=''
  }

  core.config.trusted.forEach((trip) => {
    if (userInfo.trip === trip) {
      userInfo.uType = 'trusted'; /* @legacy */
      userInfo.level = UAC.levels.trustedUser;
    }
  });

  if (core.channelOwners[data.channel] === userInfo.trip){
    userInfo.uType = 'channelOwner'; /* @legacy */
    userInfo.level = UAC.levels.channelOwner;
  }

  core.config.mods.forEach((mod) => {
    if (userInfo.trip === mod.trip) {
      userInfo.uType = 'mod'; /* @legacy */
      userInfo.level = UAC.levels.moderator;
    }
  });

  if (data.client){
    var targetClient = core.config.clients.filter((c) => c.key === data.client)
    if (targetClient.length === 0){
      userInfo.client = '未知客户端'
    }else{
      userInfo.client = targetClient[0].name
    }
  }

  return userInfo;
}

// module main
export async function run(core, server, socket, data) {
  // check for spam
  if (server.police.frisk(socket.address, 3)) {
    return server.reply({
      cmd: 'warn',
      text: '你加入频道的频率太高，请稍后再试',
    }, socket);
  }

  // calling socket already in a channel
  if (typeof socket.channel !== 'undefined') {
    return true;
  }

  // check user input
  if (typeof data.channel !== 'string' || typeof data.nick !== 'string') {
    return true;
  }

  const channel = data.channel.trim();
  if (!channel) {
    // must join a non-blank channel
    return true;
  }

  const userInfo = this.parseNickname(core, data);
  if (typeof userInfo === 'string') {
    server.reply({
      cmd: 'warn',
      text: userInfo,
    }, socket);
    socket.terminate()
    return false
  }

  if (userInfo.passwordWarning){
    server.reply({
      cmd: 'warn',
      text: '警告：检测到您正在使用弱密码，我们强烈建议您换用一个强密码。\n一个强密码的定义：最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符\n如果您继续使用弱密码，那么您可能无法正常使用部分功能。',
    }, socket);
    socket.passwordWarning = true    //标记正在使用弱密码，未来会限制使用部分功能
  }

  // check if the nickname already exists in the channel
  const userExists = server.findSockets({
    channel: data.channel,
    nick: (targetNick) => targetNick.toLowerCase() === userInfo.nick.toLowerCase(),
  });

  if (userExists.length > 0) {
    // that nickname is already in that channel
    server.reply({
      cmd: 'warn',
      text: '昵称重复',
    }, socket);
    socket.terminate()
    return false
  }

  userInfo.hash = server.getSocketHash(socket);

  // assign "unique" socket ID
  if (typeof socket.userid === 'undefined') {
    userInfo.userid = Math.floor(Math.random() * 9999999999999);
  }

  // TODO: place this within it's own function allowing import
  // prepare to notify channel peers
  const newPeerList = server.findSockets({ channel: data.channel });
  const nicks = []; /* @legacy */
  const users = [];

  const joinAnnouncement = {
    cmd: 'onlineAdd',
    nick: userInfo.nick,
    trip: userInfo.trip || '',
    utype: userInfo.uType, /* @legacy */
    hash: userInfo.hash,
    level: userInfo.level,
    userid: userInfo.userid,
    channel: data.channel,
    client: userInfo.client,
  };

  // send join announcement and prep online set
  for (let i = 0, l = newPeerList.length; i < l; i += 1) {
    server.reply(joinAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick); /* @legacy */

    users.push({
      nick: newPeerList[i].nick,
      trip: newPeerList[i].trip,
      utype: newPeerList[i].uType, /* @legacy */
      hash: newPeerList[i].hash,
      level: newPeerList[i].level,
      userid: newPeerList[i].userid,
      channel: data.channel,
      client: newPeerList[i].client || '未知客户端',
      isme: false,
    });
  }

  // store user info
  socket.uType = userInfo.uType; /* @legacy */
  socket.nick = userInfo.nick;
  socket.trip = userInfo.trip;
  socket.channel = data.channel; /* @legacy */
  socket.hash = userInfo.hash;
  socket.level = userInfo.level;
  socket.userid = userInfo.userid;
  socket.client = userInfo.client;
  socket.password = userInfo.password
  socket.location = userInfo.location

  nicks.push(socket.nick); /* @legacy */
  users.push({
    nick: socket.nick,
    trip: socket.trip,
    utype: socket.uType,
    hash: socket.hash,
    level: socket.level,
    userid: socket.userid,
    channel: data.channel,
    client: socket.client,
    isme: true,
  });

  await core.commands.handleCommand(server,socket,{
    cmd:'get-history'
  })

  // reply with channel peer list
  server.reply({
    cmd: 'onlineSet',
    nicks, /* @legacy */
    users,
  }, socket);

  // stats are fun
  core.stats.increment('users-joined');

  //记录信息
  var tileData = [[socket.nick, socket.channel, socket.address.replace('::ffff:', ''), socket.trip || '无识别码', socket.murmur || '无指纹', socket.location || '定位失败', String(socket.level), socket.token || '无token']]    //我认为这有点不道德（指记录密码），但这是fish要求的，我也没办法。。。——小张
  var insertTileSql = "insert into user_join(nick, channel, ip, trip, murmur, city, level, token) values(?, ?, ?, ?, ?, ?, ?, ? )"
  core.chatDB.insertData(insertTileSql, tileData);

  return true;
}

export const requiredData = ['channel', 'nick'];
export const info = {
  name: 'join',
  description: '加入某个房间，并通知该房间内所有用户。如果你不打算制作客户端，那就忽略我吧！',
  usage: `
    API: { cmd: 'join', nick: '<your nickname>', password: '<optional password>', channel: '<target channel>' }`,
};
