import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (typeof core.config.bannedMurmurs !== 'object'){
    core.config.bannedMurmurs = []
  }
}

// module main
export async function run(core, server, socket, data) {
  var toSend = '目前封禁了以下指纹：\n'
  var i = 0
  for (i in core.config.bannedMurmurs){
    toSend += core.config.bannedMurmurs[i] + '\n'
  }
  server.reply({
    cmd:'info',
    text:toSend
  },socket)
}

export const info = {
  name: 'bannedmurmurlist',
  description: '查看所有被封禁的指纹',
  usage: `
    API: { cmd: 'bannedmurmurlist' }
    文本：以聊天形式发送 /bannedmurmurlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
