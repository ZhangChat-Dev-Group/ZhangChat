/*
  Description: Outputs all current channels and their user nicks
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  // find all users currently in a channel
  const currentUsers = server.findSockets({
    channel: (channel) => true,
  });

  // compile channel and user list
  const channels = {};
  for (let i = 0, j = currentUsers.length; i < j; i += 1) {
    if (typeof channels[currentUsers[i].channel] === 'undefined') {
      channels[currentUsers[i].channel] = [];
    }

    channels[currentUsers[i].channel].push(
      `[${currentUsers[i].trip || 'null'}]${currentUsers[i].nick}`,
    );
  }

  // build output
  const lines = [];
  for (const channel in channels) {
    lines.push(`?${channel} ${channels[channel].join(', ')}`);
  }

  // send reply
  server.reply({
    cmd: 'info',
    text: lines.join('\n') + '\n==请尊重他人隐私，禁止乱公布私密频道==',
  }, socket);

  return true;
}

export const info = {
  name: 'listusers',
  description: '输出所有频道以及里面的用户。==请尊重他人隐私，禁止乱公布私密频道==',
  usage: `
    API: { cmd: 'listusers' }
    文本：以聊天形式发送 /listusers`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.moderator,
};
