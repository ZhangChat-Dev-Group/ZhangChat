import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (typeof core.config.bannedMurmurs !== 'object'){
    core.config.bannedMurmurs = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // check user input
  if (typeof data.murmur !== 'string') {
    return true;
  }

  // find target user
  const targetMurmur = data.murmur;
  let badClient = server.findSockets({ murmur: targetMurmur });

  var i = 0;
  for (i in badClient){
    if (badClient[i].level >= socket.level){
      return server.reply({
        cmd:'warn',
        text:'不能封禁同级别或级别更高的用户的指纹'
      },socket)
    }
  }
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 封禁了指纹为 ${targetMurmur} 的用户`,
  }, { level: UAC.isModerator });

  if (core.config.bannedMurmurs.indexOf(targetMurmur) === -1){
    core.config.bannedMurmurs.push(targetMurmur)
  }

  for (i in badClient){
    server.reply({
      cmd:'info',
      text:'您已被精准封禁'
    },badClient[i])
    badClient[i].terminate()
  }
  core.logger.logAction(socket,[],'banmurmur',data)
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
  name: 'banmurmur',
  description: '根据浏览器指纹封禁一名用户',
  usage: `
    API: { cmd: 'banmurmur', murmur: '<target murmur>' }
    文本：以聊天形式发送 /banmurmur 目标浏览器指纹`,
  fastcmd:[
    {
      name:'murmur',
      len:1,
      check: /^[a-z0-9]{32}$/
    }
  ],
  level: UAC.levels.moderator,
};
