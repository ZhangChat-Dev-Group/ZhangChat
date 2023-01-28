/*
  Description: Emmits a server-wide message as `info`
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }

  // send text to all channels
  server.broadcast({
    cmd: 'info',
    text: `站长通知：${data.text}`,
  }, {});

  return true;
}

export const requiredData = ['text'];
export const info = {
  name: 'shout',
  description: '向所有在线用户发送一条消息',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    文本：以聊天形式发送 /shout 信息`,
  fastcmd:[
    {
      name:'text',
      len:0
    }
  ]
};
