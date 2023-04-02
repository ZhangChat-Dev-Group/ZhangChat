/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.bots){
    core.config.bots = []
  }
}

// module main
export async function run(core, server, socket, data) {
  var toSend = '目前有以下机器人：\n'
  var i = 0
  for (i in core.config.bots){
    toSend += `[\`${core.config.bots[i]}\`]\n`
  }
  server.reply({
    cmd:'info',
    text:toSend
  },socket)
}


export const info = {
  name: 'botlist',
  description: '查看所有机器人',
  usage: `
    API: { cmd: 'botlist' }
    文本：以聊天形式发送 /botlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
