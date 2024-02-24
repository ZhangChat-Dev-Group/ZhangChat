import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.nsfw === undefined){
    core.nsfw = []
  }
}

// module main
export async function run(core, server, socket,data) {
  const isNsfw = core.nsfw.includes(socket.channel)
  var mode = isNsfw ? '解除标记' : '标记'

  if (isNsfw) {
    core.nsfw = core.nsfw.filter((channel) => channel !== socket.channel)    // 解锁
  } else {
    core.nsfw.push(socket.channel)    // 锁定
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} 将 ?${socket.channel} ${mode}为NSFW频道\n建议执行 disable-history 来禁用历史记录功能`
  }, { level: UAC.isModerator })    // 通知管理员

  server.broadcast({
    cmd: 'info',
    text: `已将该频道${mode}为NSFW频道`
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })    // 通知本频道内的非管理员

  core.logger.logAction(socket,[],'nsfw',data, '方法：'+mode)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this),2000);
  server.registerHook('in', 'chat', this.joinNsfw.bind(this),50);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function joinCheck(core, server, socket, payload) {
  if (socket.nsfw) return payload
  if (payload.channel===undefined || !payload.channel){
    return payload
  }
  
  if (!core.nsfw.includes(payload.channel)){
    return payload
  }

  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);
  if (typeof userInfo === "string"){
    return payload
  }

  socket.nsfw = true
  socket.nsfwPayload = payload
  server.replyWarn('# ！警告！\n该频道已被标记为NSFW频道，可能包含成人内容\n如果您已经成年，请发送 `nsfw` 来继续加入\n否则请退出', socket)

  return false
}

export function joinNsfw(core, server, socket, payload) {
  if (payload.text === 'nsfw' && socket.nsfw) {
    if (socket.channel) return payload
    server.handleData(socket, JSON.stringify(socket.nsfwPayload))
    return false
  }

  return payload
}

// module meta
export const info = {
  name: 'nsfw',
  runByChat: true,
  description: '将当前频道标记或取消标记为NSFW频道',
  usage: `
    API: { cmd: 'nsfw' }
    文本：以聊天形式发送 /nsfw`,
  dataRules: [],
  level: UAC.levels.moderator
};
