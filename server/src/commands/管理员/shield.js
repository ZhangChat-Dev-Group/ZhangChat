import * as UAC from '../utility/UAC/_info';

export function shieldCheck(core,text) {
  const txt = text.trim().toLowerCase()
  for (let i = 0; i < core.config.shield.length; i++) {
    if (txt.includes(core.config.shield[i])) {
      return true
    }
  }
  return false
}

export function init(core){
  if (!core.config.shield){
    core.config.shield = []
  }

  core.shieldCheck = shieldCheck
}

// module main
export async function run(core, server, socket, data) {
  if (typeof data.text !== 'string') {
    let txt = '目前的屏蔽词：\n'
    core.config.shield.forEach((s) => {
      txt += `\`${s}\`\n`
    })
    return server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
  }
  const text = data.text.trim().toLowerCase()    // 预处理

  var mode = true    // 模式，如果是添加则是true，移除则是false

  if (core.config.shield.includes(text)) {
    // 如果包含
    mode = false
    core.config.shield = core.config.shield.filter((t) => t !== text)
  }else {
    core.config.shield.push(text)
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了屏蔽内容：\n${text}`
  }, { level: UAC.isModerator })

  server.broadcast({
    cmd: 'info',
    text: `已${mode ? '添加' : '删除'}屏蔽内容：\n${text}`
  }, { level: (level) => level < UAC.levels.moderator })

  core.logger.logAction(socket,[],'shield',data, `[${socket.trip}] ${socket.nick} ${mode ? '添加' : '删除'}了屏蔽内容：\n${text}`)
  
  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }
  return true;
}

export const info = {
  name: 'shield',
  description: '添加或删除屏蔽内容',
  usage: `
    API: { cmd: 'shield', text: '<内容>' }
    文本：以聊天形式发送 /shield 内容`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      verify: (text) => {
        return typeof text === 'string' && !!text.trim()
      },
      all: true,
      errorMessage: '内容无效',
      required: false,
    }
  ],
  level: UAC.levels.moderator,
};
