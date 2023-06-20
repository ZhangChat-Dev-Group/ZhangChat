import * as UAC from '../utility/UAC/_info';
export async function init(core){
  if (core.config.trips===undefined){
    core.config.trips=[]
  }
}
// module main
export async function run(core, server, socket, data) {
  var new_list=''
  var i
  for (i in core.config.trips) {
    new_list+=`\`${i}\` 被替换为：\`${core.config.trips[i]}\`\n`
  }
  server.reply({
    cmd:'info',
    text:new_list
  },socket)
  return true;
}


export const info = {
  name: 'triplist',
  description: '查看替换的识别码',
  usage: `
    API: { cmd: 'triplist' }
    文本：以聊天形式发送 /triplist`,
  runByChat: true,
  dataRules: [],
  level: UAC.levels.moderator,
};
