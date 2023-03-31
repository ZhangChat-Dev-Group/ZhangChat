import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  server.reply({
    cmd:'info',
    text:'目前封禁了以下IP地址：\n'+server.bannedIPs.join('\n')
  },socket)
}


export const info = {
  name: 'bannedlist',
  description: '查看所有被封禁的IP',
  usage: `
    API: { cmd: 'bannedlist' }
    文本：以聊天形式发送 /bannedlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
