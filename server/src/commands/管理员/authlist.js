/*
  本模块用于查看所有客户端密钥。
  本模块由小张软件总程序员Mr_Zhang编写
  本模块是XChat专用的，所以不建议其他聊天室使用。
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
    var content = ''
    for (var i = 0; i < core.config.auth.length; i++) {
        content = content + `识别码：${core.config.auth[i].trip}｜认证信息：${core.config.auth[i].info}\n`
    }

    server.reply({
        cmd: 'info',
        text: content,
    }, socket);

    return true;
}

export const info = {
    name: 'authlist',
    description: '查看所有认证信息',
    usage: `
    API: { cmd: 'authlist' }
    文本：发送 /authlist`,
    fastcmd:[],
    level: UAC.levels.moderator,
};
