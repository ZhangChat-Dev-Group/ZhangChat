import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, payload) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您执行此命令的速度太快了，请稍后再试'
    },socket)
  }
  server.broadcast({
    cmd:'info',
    text:`被召唤的 ${payload.nick} 飞进了聊天室\nTA正在使用 ${socket.nick}`
  },{channel:socket.channel})
}

export const info = {
  name: 'summon',
  runByChat: true,
  description: '召唤用户，即向所有人发送一个假的加入提示',
  usage: `
    API: { cmd: 'summon', nick: 'your-nick' }
    文本：以聊天形式发送 /summon 昵称`,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: UAC.verifyNick,
      errorMessage: UAC.nameLimit.nick,
    },
  ],
};
