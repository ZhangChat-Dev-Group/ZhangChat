import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (!Array.isArray(core.config.forbiddenReferer)){
    core.config.forbiddenReferer = []
  }
}

// module main
export async function run(core, server, socket,data) {
  if (!data.text) {
    let txt = `被禁止的referer列表：\n`
    core.config.forbiddenReferer.forEach((sb) => {
      txt += `\`${sb}\`\n`
    })
    return server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
  }

  const ref = data.text.toLowerCase().trim()
  const mode = core.config.forbiddenReferer.includes(ref) ? false : true

  if (mode) core.config.forbiddenReferer.push(ref)
  else core.config.forbiddenReferer = core.config.forbiddenReferer.filter(n => n !== ref)
  if (!core.configManager.save()) {
    server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了被禁referer：${ref}`
  }, { level: UAC.isModerator })
  core.logger.logAction(socket,[],'referer',data, '方法：'+mode)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out', 'home', this.editHome.bind(this));
  server.registerHook('out', 'onlineSet', this.editHome.bind(this));
}

export function editHome(core, server, socket, payload) {
  payload.forbiddenReferer = core.config.forbiddenReferer
  return payload
}

// module meta
export const info = {
  name: 'referer',
  runByChat: true,
  description: '添加、删除或列出被禁referer',
  usage: `
    API: { cmd: 'referer', text: 'referer（不填则显示列表）' }
    文本：以聊天形式发送 /referer referer（不填则显示列表）`,
  dataRules: [
	  { name: 'text' }
  ],
  level: UAC.levels.moderator
};
