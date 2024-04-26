import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (typeof core.removedCommands !== 'object'){
    core.removedCommands = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (core.removedCommands.filter((cmd) => cmd.info.name === data.command).length === 0){
    return server.reply({
      cmd:'warn',
      text:'找不到您要恢复的命令！'
    },socket)
  }
  var goodCommands = core.removedCommands.filter((cmd) => cmd.info.name === data.command)
  var i = 0
  for (i in goodCommands){
    core.commands.commands.push(goodCommands[i])
  }
  core.removedCommands = core.removedCommands.filter((cmd) => cmd.info.name !== data.command)
  server.loadHooks()
  // send results to moderators (which the user using this command is higher than)
  server.broadcast({
    cmd: 'info',
    text: `已恢复 ${data.command} 命令`,
  }, {});

  core.logger.logAction(socket,[],'addcmd',data)
  return true;
}

export const requiredData = ['command'];
export const info = {
  name: 'addcmd',
  description: '恢复一个从内存中移除的命令',
  usage: `
    API: { cmd: 'addcmd', command: '<目标命令的名称>' }
    文本：以聊天形式发送 /addcmd 目标命令的名称`,
  runByChat: true,
  dataRules: [{
    name: 'command',
    required: true,
    verify: command => typeof command === 'string' && !!command,
  }],
  level: UAC.levels.admin,
};
