import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.captcha === undefined){
    core.captcha = []
  }

  core.enabledCaptcha = c => typeof c.config.sitekey === 'string' && !!c.config.sitekey && typeof c.config.secret === 'string' && !!c.config.secret
}

// module main
export async function run(core, server, socket, data) {
  if (!core.enabledCaptcha(core)) return server.replyWarn(`当前，站长尚未配置人机验证，故无法启用。\n如果您是站长，请在 config.json 里添加 \`sitekey\` 和 \`secret\`，它们分别对应着 Cloudflare Turnstile 验证码的站点密钥和密钥，添加完成后需要重启网站程序以重新加载配置文件。`, socket)
  const mode = !core.captcha.includes(socket.channel)

  if (mode) core.captcha.push(socket.channel)
  else core.captcha = core.captcha.filter(c => c !== socket.channel)

  server.broadcastInfo(`${socket.nick}#${socket.trip} 为 ?${socket.channel} ${mode ? '开启' : '关闭'}了人机验证`, { level: UAC.isModerator })
  server.broadcastInfo(`已${mode ? '开启' : '关闭'}人机验证`, { level: (l) => l < UAC.levels.moderator })

  core.logger.logAction(socket, [], 'captcha', data, '方法：' + mode ? '开启' : '关闭')
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this), 6);
}

export function joinCheck(core, server, socket, payload) {
  if (typeof payload.channel !== 'string' || !payload.channel){
    return payload
  }

  if (!core.captcha.includes(payload.channel)) return payload

  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);

  if (typeof userInfo === "string"){
    return payload
  }

  if (UAC.isModerator(userInfo.level)) {
    server.replyInfo(`当前频道已开启人机验证，如果情况稳定，则请关闭它`, socket)
    return payload
  }else if (UAC.isTrustedUser(userInfo.level)) {
    server.replyInfo(`当前频道已开启人机验证，如果情况稳定，则请联系管理员关闭它`, socket)
    return payload
  }else {
    // 不是mod，也不是信任用户，那么就是普通用户
    if (typeof payload.captcha === 'string' && !!payload.captcha) return payload    // 提供了验证码token，则继续交给join.js处理，验证token是否有效的代码，在 join.js
    server.reply({
      cmd: 'captcha',
      sitekey: core.config.sitekey    // 返回captcha命令，要求输入验证码
    }, socket)
    return false    // 丢弃当前数据包
  }
}

// module meta
export const info = {
  name: 'captcha',
  runByChat: true,
  description: '为你所在的频道开启或关闭人机验证（优先级低于lockroom和locksite）',
  usage: `
    API: { cmd: 'captcha' }
    文本：以聊天形式发送 /captcha`,
  dataRules: [],
  level: UAC.levels.moderator
};
