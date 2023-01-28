/*
  Description: Clears and resets the command modules, outputting any errors
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }

  // do command reload and store results
  let loadResult = core.dynamicImports.reloadDirCache();
  loadResult += core.commands.loadCommands();

  // clear and rebuild all module hooks
  server.loadHooks();

  // build reply based on reload results
  if (loadResult === '') {
    loadResult = `重新加载了 ${core.commands.commands.length} 个命令, 没有报错`;
  } else {
    loadResult = `重新加载了 ${core.commands.commands.length} 个命令, 下面是一些报错:
      ${loadResult}`;
  }

  if (typeof data.reason !== 'undefined') {
    loadResult += `\n原因：${data.reason}`;
  }

  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: loadResult,
  }, { level: UAC.isModerator });

  return true;
}

export const info = {
  name: 'reload',
  description: '热重载命令，并输出报错',
  usage: `
    API: { cmd: 'reload', reason: '<optional reason append>' }
    文本：以聊天形式发送 /reload 可选的原因`,
  fastcmd:[
    {
      name:'reason',
      len:0
    }
  ]
};
