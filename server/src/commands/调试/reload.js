/*
  Description: Clears and resets the command modules, outputting any errors
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // do command reload and store results
  let loadResult = core.dynamicImports.reloadDirCache();
  loadResult += core.commands.loadCommands();

  // clear and rebuild all module hooks
  server.loadHooks();

  // build reply based on reload results
  if (loadResult === '') {
    loadResult = `重新加载了 ${core.commands.commands.length} 个命令, 没有报错`;
  } else {
    loadResult = `重新加载了 ${core.commands.commands.length} 个命令, 下面是一些错误信息:
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

  core.logger.logAction(socket,[],'reload',data,loadResult)

  return true;
}

export const info = {
  name: 'reload',
  description: '热重载服务器',
  usage: `
    API: { cmd: 'reload', reason: '<optional reason append>' }
    文本：以聊天形式发送 /reload 可选的原因`,
  runByChat: true,
  dataRules: [
    {
      name: 'reason',
      verify: reason => typeof reason === 'string' && !!reason,
      all: true,
    },
  ],
  level: UAC.levels.admin,
};
