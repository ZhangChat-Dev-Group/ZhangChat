import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.clients){
    core.config.clients = []
  }
}

// module main
export async function run(core, server, socket, data) {
  var toSend = '目前有以下客户端：\n'
  var i = 0

  for (i in core.config.clients){
    toSend += `${core.config.clients[i].name} | ${core.config.clients[i].key}\n`
  }

  server.reply({
    cmd:'info',
    text:toSend
  },socket)

  return true;
}

export const info = {
  name: 'clientlist',
  description: '显示所有客户端',
  usage: `
    API: { cmd: 'clientlist' }
    文本：以聊天形式发送 /clientlist`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.admin,
};
