/*
  Description: Allows calling client to change their current nickname
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 6)) {
    return server.reply({
      cmd: 'warn',
      text: '你换昵称的速度太快了，请稍后再试',
    }, socket);
  }

  const previousNick = socket.nick;

  // make sure requested nickname meets standards
  const newNick = data.nick.trim();

  if (newNick == previousNick) {
    return server.reply({
      cmd: 'warn',
      text: '这个昵称与你现有的昵称相同',
    }, socket);
  }

  // find any sockets that have the same nickname
  const userExists = server.findSockets({
    channel: socket.channel,
    nick: (targetNick) => targetNick.toLowerCase() === newNick.toLowerCase() &&
      // Allow them to rename themselves to a different case
      targetNick != previousNick,
  });

  // return error if found
  if (userExists.length > 0) {
    if ((((userExists[0].trip && socket.trip /* 都有识别码 */) && (!userExists[0].passwordWarning && !socket.passwordWarning /* 不是弱密码 */ ) && (userExists[0].trip === socket.trip)) || (socket.address === userExists[0].address /* 同IP地址 */)) && userExists.length === 1 /* 以防万一，虽然这有点多余 */){
      server.broadcast({
        cmd:'info',
        text: `${userExists[0].nick} 可能是僵尸号，已被自动踢出聊天室`
      },{channel:socket.channel})

      userExists[0].channel = ''    //去掉channel，防止disconnect.js再次广播onlineRemove
      
      server.broadcast({    //广播用户离开通知，如果直接用terminate会出现异步的问题
        cmd:'onlineRemove',
        nick: userExists[0].nick
      },{channel:socket.channel})
      
      userExists[0].terminate()    //关闭连接
    }else{
      // That nickname is already in that channel
      return server.reply({
        cmd: 'warn',
        text: '昵称重复',
      }, socket);
    }
  }
  
  /*
  // build join and leave notices
  // TODO: this is a legacy client holdover, name changes in the future will
  //       have thieir own event
  const leaveNotice = {
    cmd: 'onlineRemove',
    nick: socket.nick,
  };

  const joinNotice = {
    cmd: 'onlineAdd',
    nick: newNick,
    trip: socket.trip || '',
    hash: socket.hash,
  };

  // broadcast remove event and join event with new name, this is to support legacy clients and bots
  server.broadcast(leaveNotice, { channel: socket.channel });
  server.broadcast(joinNotice, { channel: socket.channel });
  */

  // notify channel that the user has changed their name
  server.broadcast({
    cmd: 'changeNick',
    nick: socket.nick,
    text: newNick,
  }, { channel: socket.channel });

  // commit change to nickname
  socket.nick = newNick;

  return true;
}

export const info = {
  name: 'changenick',
  description: '用于修改你的昵称',
  usage: `
    API: { cmd: 'changenick', nick: '<new nickname>' }
    文本：以聊天形式发送 /changenick 新昵称 或 /nick 新昵称`,
  aliases: ['nick'],
  dataRules: [
    {
      name: 'nick',
      verify: (nick) => typeof nick === 'string' && UAC.verifyNickname(nick.replace(/@/g, '').trim()),
      errorMessage: UAC.nameLimit.nick,
      required: true,
    }
  ],
  runByChat: true,
};
