/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  const currentLevel = core.config.powerfulUsers[data.trip] || UAC.levels.default    // 当前等级
  if (currentLevel > UAC.levels.moderator) return server.replyWarn('目标用户的等级比管理员高，请先将其降级到管理员后再操作', socket)
  const mode = (currentLevel === UAC.levels.moderator) ? false : true

  if (!mode) {
    core.config.powerfulUsers[data.trip] = UAC.levels.trustedUser
  }else {
    core.config.powerfulUsers[data.trip] = UAC.levels.moderator
  }

  server.findSockets({
    trip: data.trip
  }).forEach((s) => {
    s.level = core.config.powerfulUsers[data.trip]
    s.uType = mode ? 'mod' : 'trusted'
    server.replyInfo(`已更新您的等级为：${mode ? '管理员' : '信任用户'}`, s)
  })

  server.broadcast({
    cmd: 'info',
    text: `已${mode ? '添加' : '删除'}管理员：${data.trip}`
  }, { level: UAC.isModerator })

  server.reply({
    cmd: 'info',
    text: `记得去运行saveconfig命令来保存配置`,
  }, socket);

  core.logger.logAction(socket,[],'mod',data, mode ? '添加' : '删除')

  return true;
}

export const info = {
  name: 'mod',
  description: '添加或删除一个管理员，并立刻更新其等级',
  usage: `
    API: { cmd: 'mod', trip: '<target trip>' }
    文本：以聊天形式发送 /mod 目标识别码`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
      required: true
    }
  ],
  level: UAC.levels.admin,
};
