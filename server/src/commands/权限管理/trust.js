import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (typeof data.trip !== 'string') {
    // 没有提供识别码，则显示所有信任用户
    let txt = '当前信任用户有：\n'
    Object.keys(core.config.powerfulUsers).forEach((trip) => {
      if (core.config.powerfulUsers[trip] === UAC.levels.trustedUser) {
        txt += `\`${trip}\`\n`
      }
    })
    server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
    return
  }

  var mode = true    // 操作模式，true为添加，false为删除
  const target = data.trip    // 目标识别码
  const currentLevel = core.config.powerfulUsers[target] || UAC.levels.default    // 当前等级，没有则使用默认的

  if (currentLevel > UAC.levels.trustedUser) {    // 检查目标用户等级是否高于信任用户
    return server.reply({    // 越权操作不被允许
      cmd: 'warn',
      text: `识别码 ${target} 的权限高于信任用户，请先将其降级到信任用户后再操作`
    }, socket)
  }

  if (currentLevel === UAC.levels.trustedUser) {
    // 模式：删除
    mode = false
    delete core.config.powerfulUsers[target]    // 等级低于信任用户，也就是无权限者，不能占用config.json的空间
  }else {
    // 模式：添加
    core.config.powerfulUsers[target] = UAC.levels.trustedUser    // 添加
  }

  server.findSockets({ trip: target }).forEach((s) => {
    s.level = mode ? UAC.levels.trustedUser : UAC.levels.default
    s.uType = mode ? 'trusted' : 'user'

    server.reply({
      cmd: 'info',
      text: `已更新您的等级为：${mode ? '信任用户' : '普通用户'}`,
    }, s)
  })    // 修改用户等级

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了信任用户：${target}`
  }, { level: UAC.isTrustedUser })    // 开个恩罢，让信任用户也可以看管理员的这个操作

  core.logger.logAction(socket,[],'trust',data, '模式：'+mode ? '添加' : '删除')

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }
}

export const info = {
  name: 'trust',
  description: '为指定识别码添加或删除信任用户权限，不传递参数则显示所有信任用户',
  usage: `
    API: { cmd: 'trust', trip: '<target trip>' }
    文本：以聊天形式发送 /trust 目标识别码`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    }
  ],
  level: UAC.levels.moderator,
};
