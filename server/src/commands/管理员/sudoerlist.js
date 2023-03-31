/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  var sudoers = ''

  core.config.sudoers.forEach(trip => {
    sudoers += `\`${trip}\`\n`
  });

  server.reply({
    cmd: 'info',
    text: sudoers
  }, socket);

  return true;
}

export const info = {
  name: 'sudoerlist',
  description: '查看所有可提权用户',
  usage: `
    API: { cmd: 'sudoerlist' }
    文本：以聊天形式发送 /sudoerlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
