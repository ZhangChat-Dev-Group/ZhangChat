/*
  Description: Emmits a server-wide message as `info`
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // send text to all channels
  server.broadcast({
    cmd: 'info',
    text: `来自 [\`${socket.trip}\`] \`${socket.nick}\` 的全站通知：\n${data.text}`,
  }, {});

  core.logger.logAction(socket,[],'shout',data)

  return true;
}

export const info = {
  name: 'shout',
  description: '发布一条全站通知，所有用户都能看到',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    文本：以聊天形式发送 /shout 信息`,
  dataRules:[
    {
      name:'text',
      all: true,
      required: true,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator
};
