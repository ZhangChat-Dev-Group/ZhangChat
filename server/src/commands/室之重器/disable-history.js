import * as UAC from '../utility/UAC/_info';
export async function init(core) {
  if (core.disabledHistory === undefined){
    core.disabledHistory = []
  }
}

// module main
export async function run(core, server, socket,data) {
  const disabled = core.disabledHistory.includes(socket.channel)
  var mode = disabled ? '启用' : '停用'

  if (disabled) {
    core.disabledHistory = core.disabledHistory.filter((channel) => channel !== socket.channel)    //启用
  } else {
    core.disabledHistory.push(socket.channel)    // 停用
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode}了 ?${socket.channel} 的历史记录功能`
  }, { level: UAC.isModerator })    // 通知管理员

  server.broadcast({
    cmd: 'info',
    text: `已${mode}该频道的历史记录功能`
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })    // 通知本频道内的非管理员

  core.logger.logAction(socket,[],'disable-history',data, '方法：'+mode)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out', 'history', this.joinCheck.bind(this),5);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function joinCheck(core, server, socket, payload) {
  if (!core.disabledHistory.includes(payload.channel)) return payload
  const userInfo = { level: payload.level }
  if (UAC.isModerator(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此频道已被停用历史记录功能。如果情况稳定，那么请启用它。"
    },socket)
    return payload
  }else if (UAC.isTrustedUser(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此频道已被停用历史记录功能，如果情况稳定，那么请联系管理员将其启用。"
    },socket)
    return payload
  }else{
    server.reply({
      cmd:"warn",
      text: '出于保密需要，此频道已被停用历史记录功能，即您对历史记录的调取权限被限',
    },socket)
    return false
  }
}

// module meta
export const info = {
  name: 'disable-history',
  runByChat: true,
  description: '禁用本频道的历史记录功能，即禁止等级低于信任用户的人调取历史记录。',
  usage: `
    API: { cmd: 'disable-history' }
    文本：以聊天形式发送 /disable-history`,
  dataRules: [],
  level: UAC.levels.moderator
};
