/*
  Description: Outputs the current command module list or command categories
*/

// module main
export async function run(core, server, socket, payload) {
  // check for spam
  if (server.police.frisk(socket.address, 2)) {
    return server.reply({
      cmd: 'warn',
      text: '你的操作速度太快了，请稍等一下再试',
    }, socket);
  }

  let reply = '';
  if (typeof payload.command === 'undefined') {
    reply += '# 所有命令:\n|类别:|名称:|\n|---:|---|\n';

    const categories = core.commands.categoriesList.sort();
    for (let i = 0, j = categories.length; i < j; i += 1) {
      reply += `|${categories[i].replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}:|`;
      const catCommands = core.commands.all(categories[i]).sort((a, b) => a.info.name.localeCompare(b.info.name));
      reply += `${catCommands.map((c) => `${c.info.name}`).join(', ')}|\n`;
    }

    reply += '---\n要获取指定命令的帮助，请使用：\n文本：以聊天形式发送 `/help <命令名称>`\nAPI: `{cmd: \'help\', command: \'<command name>\'}`';
  } else {
    const command = core.commands.get(payload.command);

    if (typeof command === 'undefined') {
      reply += '未知命令';
    } else {
      reply += `# ${command.info.name} 命令：\n| | |\n|---:|---|\n`;
      reply += `|**名称：**|${command.info.name}|\n`;
      reply += `|**别名：**|${typeof command.info.aliases !== 'undefined' ? command.info.aliases.join('、') : '¯\\\\\\_(ツ)\\_/¯'}|\n`;
      reply += `|**分类：**|${command.info.category.replace('../src/commands/', '').replace(/^\w/, (c) => c.toUpperCase())}|\n`;
      reply += `|**权限是否足够：**|${typeof command.info.level !== 'number' ? '是' : (socket.level >= command.info.level ? '是' : '否')}|\n`;
      reply += `|**必要参数：**|${command.requiredData || '¯\\\\\\_(ツ)\\_/¯'}|\n`;
      reply += `|**描述：**|${command.info.description || '¯\\\\\\_(ツ)\\_/¯'}|\n\n`;
      reply += `**使用方法：** ${command.info.usage || '¯\\\\\\_(ツ)\\_/¯'}`;
    }
  }

  // output reply
  server.reply({
    cmd: 'info',
    text: reply,
  }, socket);

  return true;
}

export const info = {
  name: 'help',
  description: '显示现有命令或指定命令的用法',
  usage: `
    API: { cmd: 'help', command: '<optional command name>' }
    文本：以聊天形式发送 /help <需要查询的命令名称>`,
  dataRules: [
    {
      name: 'command',
      verify: command => typeof command === 'string' && !!command,
      errorMessage: '命令名称无效'
    },
  ],
  runByChat: true,
};
