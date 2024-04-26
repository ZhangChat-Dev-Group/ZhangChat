import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (!Array.isArray(core.config.xxs)){
    core.config.xxs = []
  }
}

// module main
export async function run(core, server, socket,data) {
  if (!data.nick) {
    let txt = `XXS列表：\n`
    core.config.xxs.forEach((sb) => {
      txt += `\`${sb}\`\n`
    })
    return server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
  }

  const nick = data.nick.toLowerCase().trim()
  const mode = core.config.xxs.includes(nick) ? false : true

  if (mode) core.config.xxs.push(nick)
  else core.config.xxs = core.config.xxs.filter(n => n !== nick)
  if (!core.configManager.save()) {
    server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了昵称关键字：${nick}`
  }, { level: UAC.isModerator })
  core.logger.logAction(socket,[],'xxs',data, '方法：'+mode)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this), -111);    // 很高的优先级
}

export function joinCheck(core, server, socket, payload) {
  const joinModule = core.commands.get('join')
  const userInfo = joinModule.parseNickname(core, payload)

  for (let i of core.config.xxs) {
    if (userInfo.nick.toLowerCase().includes(i) && !UAC.isTrustedUser(userInfo.level)) {
      server.replyWarn('# : ( 出错了！\n服务异常（错误码 0xE57），请稍后再试。', socket)
      socket.terminate()
      server.ban(socket.address)
      core.logger.logAction(socket, [], 'xxs-ban', { message: '不能记录join数据' }, `用户使用昵称：${userInfo.nick}\n触发XXS昵称关键字：${i}`)
      server.broadcast({
        cmd: 'info',
        text: '已自动封禁IP地址：' + socket.address + `\n用户使用昵称：${userInfo.nick}\n触发XXS昵称关键字：${i}`
      }, { level: UAC.isModerator })
      return false
    }
  }

  return payload
}

// module meta
export const info = {
  name: 'xxs',
  runByChat: true,
  description: '添加、删除或列出xxs（非年龄意义上的），如果用户使用包含列表内关键字的昵称，就会被自动封禁',
  usage: `
    API: { cmd: 'xxs', nick: '昵称关键字（不填则显示列表）' }
    文本：以聊天形式发送 /xxs 关键字（不填则显示列表）`,
  dataRules: [
    {
      name: 'nick',
      verify: UAC.verifyNickname,
      errorMessage: UAC.nameLimit.nick,
    }
  ],
  level: UAC.levels.moderator
};
