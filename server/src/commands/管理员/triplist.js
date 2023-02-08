import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.config.trips===undefined){
    core.config.trips=[]
  }
}
// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作。'
    },socket)
    return server.police.frisk(socket.address, 20);
  }
  var new_list=''
  var i
  for (i in core.config.trips) {
    new_list+=`${i} 被替换为：${core.config.trips[i]}\n`
  }
  server.reply({
    cmd:'info',
    text:new_list
  },socket)
  return true;
}
/*
export function initHooks(server) {
  server.registerHook('in', 'chat', this.triplistCheck.bind(this));
}
*/
export function triplistCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
      return false;
  }

  if (payload.text.startsWith('/triplist')) {
      const input = payload.text.split(' ');
      this.run(core, server, socket, {
          cmd: 'triplist',
      });

      return false;
  }

  return payload;
}
export const requiredData = [];
export const info = {
  name: 'triplist',
  description: '查看替换的识别码',
  usage: `
    API: { cmd: 'triplist' }
    文本：以聊天形式发送 /triplist`,
  fastcmd:[]
};
