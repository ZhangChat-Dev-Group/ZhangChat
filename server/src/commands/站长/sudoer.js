/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (!data.trip) {
    let mods = Object.keys(core.config.powerfulUsers).filter((t) => core.config.powerfulUsers[t] === UAC.levels.admin)
    server.replyInfo(`全体可提权用户：\`${mods.join('`\n`')}\``, socket)
    return 
  }
  const currentLevel = core.config.powerfulUsers[data.trip] || UAC.levels.default    // 当前等级
  const mode = (currentLevel === UAC.levels.admin) ? false : true

  if (!mode) {
    core.config.powerfulUsers[data.trip] = UAC.levels.moderator
  }else {
    core.config.powerfulUsers[data.trip] = UAC.levels.admin
  }

  server.broadcast({
    cmd: 'info',
    text: `您已成为${mode ? '站长' : '管理员'}`
  }, { trip: data.trip })

  server.broadcast({
    cmd: 'info',
    text: `已${mode ? '添加' : '删除'}站长：${data.trip}`
  }, { level: UAC.isModerator })

  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig命令来保存配置`,
  }, socket);

  core.logger.logAction(socket,[],'mode',data, mode ? '添加' : '删除')

  return true;
}

export const info = {
  name: 'sudoer',
  description: '添加或删除一个可提权用户（站长）',
  usage: `
    API: { cmd: 'mod', trip: '<target trip>' }
    文本：以聊天形式发送 /mod 目标识别码`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    }
  ],
  level: UAC.levels.admin,
};