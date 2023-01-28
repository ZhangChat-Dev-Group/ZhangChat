/*
  这个命令用于显示所有信任用户
  这个命令由小张软件总程序员Mr_Zhang编写
  这些代码是开源的，除十字街外，其他聊天室都可以使用
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
    if (!core.config.trusted){
      core.config.trusted = []
    }
  }

// module main
export async function run(core, server, socket, data) {
    // increase rate limit chance and ignore if not admin
    if (!UAC.isModerator(socket.level)) {
        server.reply({
            cmd:'warn',
            text:'抱歉，您的权限不足，无法执行此操作。'
        },socket)
        return server.police.frisk(socket.address, 20);
    }
    var content = '以下是所有信任用户：\n'
    for (var i = 0; i < core.config.trusted.length; i++) {
        content = content+`${core.config.trusted[i]}\n`
    }

    server.reply({
        cmd: 'info',
        text: content,
    }, socket);

    return true;
}

export const info = {
    name: 'trustedlist',
    description: '查看所有信任用户',
    usage: `
    API: { cmd: 'trustedlist' }
    文本：以聊天形式发送 /trustedlist`,
    fastcmd:[]
};
