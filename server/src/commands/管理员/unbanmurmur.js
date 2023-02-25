import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (typeof core.config.bannedMurmurs !== 'object'){
    core.config.bannedMurmurs = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.murmur !== 'string') {
    return true;
  }

  const targetMurmur = data.murmur

  if (core.config.bannedMurmurs.indexOf(targetMurmur) !== -1){
    core.config.bannedMurmurs = core.config.bannedMurmurs.filter((m) => m !== targetMurmur)
  }else{
    return server.reply({
      cmd:'warn',
      text:'这个指纹没有被封禁'
    },socket)
  }
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 解除封禁了指纹为 ${targetMurmur} 的用户`,
  }, { level: UAC.isModerator });

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请联系站长检查日志。',
    }, {level:UAC.isModerator});
  }

  return true;
}

export const requiredData = ['murmur'];
export const info = {
  name: 'unbanmurmur',
  description: '解封一个浏览器指纹',
  usage: `
    API: { cmd: 'unbanmurmur', murmur: '<target murmur>' }
    文本：以聊天形式发送 /unbanmurmur 目标浏览器指纹`,
  fastcmd:[
    {
      name:'murmur',
      len:1,
      check: /^[a-z0-9]{32}$/
    }
  ]
};
