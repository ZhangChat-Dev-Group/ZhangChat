/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.tokens){
    core.config.tokens = []
  }
}

// module main
export async function run(core, server, socket, data) {
  var toSend = '目前有以下token：\n'
  var i = 0
  for (i in core.config.tokens){
    toSend += `[\`${core.config.tokens[i].trip}\`] \`${core.config.tokens[i].token}\`\n`
  }
  server.reply({
    cmd:'info',
    text:toSend
  },socket)
}


export const info = {
  name: 'tokenlist',
  description: '查看所有token',
  usage: `
    API: { cmd: 'tokenlist' }
    文本：以聊天形式发送 /tokenlist`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
