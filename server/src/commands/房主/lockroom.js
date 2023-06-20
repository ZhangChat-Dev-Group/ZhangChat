import * as UAC from '../utility/UAC/_info';
export async function init(core) {
  if (core.lockedrooms === undefined){
    core.lockedrooms = []
  }
}

// module main
export async function run(core, server, socket,data) {
  const locked = core.lockedrooms.includes(socket.channel)
  var mode = locked ? '解除锁定' : '锁定'

  if (locked) {
    core.lockedrooms = core.lockedrooms.filter((channel) => channel !== socket.channel)    // 解锁
  } else {
    core.lockedrooms.push(socket.channel)    // 锁定
  }

  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} ${mode}了 ?${socket.channel}`
  }, { level: UAC.isModerator })    // 通知管理员

  server.broadcast({
    cmd: 'info',
    text: `已${mode}该频道`
  }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })    // 通知本频道内的非管理员

  core.logger.logAction(socket,[],'lockroom',data)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.joinCheck.bind(this),5);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function joinCheck(core, server, socket, payload) {
  if (payload.channel===undefined || payload.channel===""){
    return payload
  }
  if (!core.lockedrooms.includes(payload.channel)){
    return payload
  }
  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);
  if (typeof userInfo === "string"){
    return payload
  }
  if (UAC.isChannelOwner(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此频道处于锁定状态。如果情况稳定，那么请解除锁定。"
    },socket)
    return payload
  }else if (UAC.isTrustedUser(userInfo.level)){
    server.reply({
      cmd:"info",
      text:"此频道处于锁定状态，如果情况稳定，那么请联系管理员或房主解除锁定。"
    },socket)
    return payload
  }else{
    server.reply({
      cmd:"warn",
      text:"# :(\n## 此频道遇到问题，处于锁定状态。\n#### 频道会在出现非常混乱的情况时暂时锁定，也会在特殊时期时进行宵禁或暂时锁定。\n###### 有关此问题的解决方法：\n- 如果你是站长、管理员、房主或信任用户，请加好你的密码。\n- 耐心等待。"
    },socket)
    socket.terminate()
    return false
  }
}

// module meta
export const info = {
  name: 'lockroom',
  runByChat: true,
  description: '锁定你所在的频道，如果当前频道已被锁定则执行解除锁定操作',
  usage: `
    API: { cmd: 'lockroom' }
    文本：以聊天形式发送 /lockroom`,
  dataRules: [],
  level: UAC.levels.channelOwner
};
