import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (data.ip === '*') {
    server.unbanall()
    server.broadcast({
      cmd:'info',
      text:`[${socket.trip}] ${socket.nick} 已解除封禁所有IP地址`
    },{level:UAC.isModerator})
    console.log(`[${socket.trip}] ${socket.nick} 已解除封禁所有IP地址`)
    core.logger.logAction(socket,[],'unban',data)
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

  core.logger.logAction(socket,[],'unban',data)

  return true;
}

export const info = {
  name: 'unban',
  description: '解除封禁目标IP地址，如需解封所有IP，请将ip填写为 `*`',
  usage: `
    API: { cmd: 'unban', ip: '<target ip>' }
    文本：以聊天形式发送 /unban 目标IP地址`,
  dataRules:[
    {
      name:'ip',
      required: true,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator,
};
