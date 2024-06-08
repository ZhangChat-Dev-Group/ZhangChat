import * as UAC from '../utility/UAC/_info';
const checkIPv4 = require('net').isIPv4

class CIDRChecker {
  constructor(bannedList = []) {
    this.bannedList = bannedList
  }

  check(ip) {
    if (!checkIPv4(ip)) throw new TypeError('传入的参数不是 IPv4 地址')
    for (let cidr of this.bannedList) {
      const [ i, len ] = cidr.split('/')
      const prefix = i.split('.').slice(0, Number.parseInt(len) / 8).join('.') + '.'
      if (ip.startsWith(prefix)) return true
      else return false
    }
  }
}

export async function init(core) {
  if (!Array.isArray(core.config.cidr)){
    core.config.cidr = []
  }
}

// module main
export async function run(core, server, socket, data) {
  if (!data.cidr) {
    let txt = `当前封禁的CIDR列表：\n`
    core.config.cidr.forEach((sb) => {
      txt += `\`${sb}\`\n`
    })
    return server.reply({
      cmd: 'info',
      text: txt,
    }, socket)
  }

  const cidr = data.cidr.toLowerCase().trim()
  const mode = core.config.cidr.includes(cidr) ? false : true

  if (function (c) {
    let splited = c.split('/')
    if (splited.lenght != 2) return false

    if (!checkIPv4(splited[0])) return false
    if (Number(splited[1]) % 8 === 0 && Number(splited[1]) <= 32) return true
    else return false
  }(cidr)) return server.replyWarn('抱歉，因技术问题，当前只接受 IPv4 CIDR', socket)

  if (mode) core.config.cidr.push(cidr)
  else core.config.cidr = core.config.cidr.filter(c => c !== cidr)
  if (!core.configManager.save()) {
    server.broadcast({
      cmd: 'warn',
      text: '保存文件失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode ? '封禁' : '解除封禁'}了 CIDR：${cidr}`
  }, { level: UAC.isModerator })
  core.logger.logAction(socket,[],'cidr',data, '方法：'+mode)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this), -112);    // 很高的优先级
}

export function joinCheck(core, server, socket, payload) {
  if (!checkIPv4(socket.address)) return payload
  const joinModule = core.commands.get('join')
  const userInfo = joinModule.parseNickname(core, payload)

  if (UAC.isTrustedUser(userInfo.level)) return payload
  const checker = new CIDRChecker(core.config.cidr)
  if (checker.check(socket.address)) {
    server.replyWarn(`# 您已被 ZhangChat 风控系统屏蔽\n您的IP地址具有非常严重的安全风险，已被屏蔽。\n您可以向管理员提供以下信息：\nIP：${socket.address}`, socket)
    socket.terminate()
    return false
  }

  return payload
}

// module meta
export const info = {
  name: 'cidr',
  runByChat: true,
  description: '添加、删除或列出被禁止的CIDR',
  usage: `
    API: { cmd: 'cidr', cidr: 'IPv4 CIDR' }
    文本：以聊天形式发送 /cidr <IPv4 CIDR>`,
  dataRules: [
    {
      name: 'cidr',
    }
  ],
  level: UAC.levels.moderator
};
