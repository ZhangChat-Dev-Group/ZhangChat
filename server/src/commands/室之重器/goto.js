import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.goto === undefined){
    core.goto = new Map()
  }
}

// module main
export async function run(core, server, socket,data) {
  var mode = true
  if (data.to === '*' || data.to === socket.channel) {
    mode = false
  }else if (!UAC.verifyChannel(data.to)) {
    return server.reply({
      cmd: 'warn',
      text: UAC.nameLimit.channel
    },socket)
  }

  if (mode === false && !core.goto.has(socket.channel)) {
    return server.reply({
      cmd: 'warn',
      text: '该频道尚未设置重定向规则'
    },socket)
  }
  if (mode === false) {
    core.goto.delete(socket.channel)
    server.broadcast({
      cmd: 'info',
      text: `[${socket.trip}] ${socket.nick} 为 ?${socket.channel} 删除了重定向规则`
    }, { level: UAC.isModerator })
    server.broadcast({
      cmd: 'info',
      text: `已删除重定向规则`
    }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  }else {
    core.goto.set(socket.channel, data.to)
    server.broadcast({
      cmd: 'info',
      text: `[${socket.trip}] ${socket.nick} 为 ?${socket.channel} 设置重定向规则: ?${data.to}`
    }, { level: UAC.isModerator })
    server.broadcast({
      cmd: 'info',
      text: `已设置重定向规则: ?${data.to}`
    }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  }
  
  core.logger.logAction(socket,[],'goto',data)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.ChangeChannel.bind(this), -1);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function ChangeChannel(core, server, socket, payload) {
  if (payload.channel===undefined || !payload.channel){
    return payload
  }
  if (!core.goto.has(payload.channel)){
    return payload
  }
  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);
  if (typeof userInfo === "string"){
    return payload
  }
  if (UAC.isTrustedUser(userInfo.level)){
    server.reply({
      cmd:"info",
      text:`此房间已被设置重定向到 ?${core.goto.get(payload.channel)} ，但由于您被信任，因此您可以正常加入 ?${payload.channel}`
    },socket)
    return payload
  }else{
    payload.channel = core.goto.get(payload.channel)
    server.reply({
      cmd:"info",
      text:`由于某些原因，您被重定向到 ?${payload.channel}`
    },socket)
    return payload
  }
}

// module meta
export const info = {
  name: 'goto',
  description: '给你所在的频道设置重定向规则，只有信任用户或更高等级的用户才不受该规则的限制，如果要使此规则失效，请将目标聊天室设置为 `*`',
  usage: `
    API: { cmd: 'goto',to:'<新的房间>' }
    文本：以聊天形式发送 /goto <新的房间>`,
  dataRules:[
    {
      name:'to',
      verify: channel => UAC.verifyChannel(channel) || channel === '*',
      errorMessage: UAC.nameLimit.channel,
      required: true,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator,
};
