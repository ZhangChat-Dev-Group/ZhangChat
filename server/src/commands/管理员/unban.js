import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // check user input
  if (typeof data.ip !== 'string') {
    return server.reply({
      cmd: 'warn',
      text: "您提供的数据无效，您必须提供IP",
    }, socket);
  }

  var result = server.unban(data.ip)

  if (!result){
    return server.reply({
      cmd:'warn',
      text:'该IP地址没有被封禁'
    },socket)
  }

  server.broadcast({
    cmd:'info',
    text:`[${socket.trip}] ${socket.nick} 已解除封禁IP地址：${data.ip}`
  },{level:UAC.isModerator})

  console.log(`[${socket.trip}] ${socket.nick} 已解除封禁IP地址：${data.ip}`)

  // stats are fun
  core.stats.decrement('users-banned');

  core.logger.logAction(socket,[],'unban',data)

  return true;
}

export const info = {
  name: 'unban',
  description: '解除封禁目标IP地址',
  usage: `
    API: { cmd: 'unban', ip: '<target ip>' }
    文本：以聊天形式发送 /unban 目标IP地址`,
  fastcmd:[
    {
      name:'ip',
      len:1,
    }
  ],
  level: UAC.levels.moderator,
};
