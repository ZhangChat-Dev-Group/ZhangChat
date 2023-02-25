import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  var power=false;
  if (!UAC.isModerator(socket.level)) {
    server.police.frisk(socket.address, 10);
    return server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
  }
  
  if (!data.nick){
    data.nick = socket.nick
  }

  let badClient = server.findSockets({ channel: socket.channel, nick: data.nick });

  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '老娘找不到那个人。。。',
    }, socket);
  }

  [badClient] = badClient;
  server.reply({
    cmd:"info",
    text:`${badClient.nick} 的浏览器指纹为：${badClient.murmur || '获取失败'}`,
  },socket);
  return true;
}

//export const requiredData = [];
export const info = {
  name: 'murmur',
  description: '获取某人的浏览器指纹',
  usage: `
    API: { cmd: 'murmur', nick: '<目标用户的昵称，如果查自己的，可以为空>' }
    文本：以聊天形式发送 /murmur <目标用户的昵称，如果查自己的，可以为空>`,
  fastcmd:[
    {
      name:'nick',
      len:1
    }
  ]
};
