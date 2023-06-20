/*
  这个命令用于显示所有mod
  这个命令由小张软件总程序员Mr_Zhang编写
  这些代码是开源的，除十字街外，其他聊天室都可以使用
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
    var content = '以下是所有管理员：\n'
    for (var i = 0; i < core.config.mods.length; i++) {
        content += `\`${core.config.mods[i].trip}\`\n`
    }

    server.reply({
        cmd: 'info',
        text: content,
    }, socket);

    return true;
}

export const info = {
    name: 'modlist',
    description: '查看所有管理员',
    usage: `
    API: { cmd: 'modlist' }
    文本：以聊天形式发送 /modlist`,
    runByChat: true,
    dataRules: [],
    level: UAC.levels.moderator,
};
