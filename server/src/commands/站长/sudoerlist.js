/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20);
  }

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
  name: 'addsudoer',
  description: '查看所有可提权用户',
  usage: `
    API: { cmd: 'sudoerlist' }
    文本：以聊天形式发送 /sudoerlist`,
  fastcmd:[]
};
