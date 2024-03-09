import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.ws === undefined){
    core.ws = new Map()
  }
}

// module main
export async function run(core, server, socket,data) {
  var mode = true
  if (data.ws === '*') {
    mode = false
  }

  if (mode === false && !core.ws.has(socket.channel)) {
    return server.reply({
      cmd: 'warn',
      text: '该频道尚未设置新的连接线路'
    },socket)
  }
  if (mode === false) {
    core.ws.delete(socket.channel)
    server.broadcast({
      cmd: 'info',
      text: `[${socket.trip}] ${socket.nick} 为 ?${socket.channel} 删除了新线路`
    }, { level: UAC.isModerator })
    server.broadcast({
      cmd: 'info',
      text: `已删除新线路`
    }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  }else {
    core.ws.set(socket.channel, data.ws)
    server.broadcast({
      cmd: 'info',
      text: `[${socket.trip}] ${socket.nick} 为 ?${socket.channel} 设置新连接线路: ?${data.ws}`
    }, { level: UAC.isModerator })
    server.broadcast({
      cmd: 'info',
      text: `已设置新连接线路: ?${data.ws}`
    }, { channel: socket.channel, level: (level) => level < UAC.levels.moderator })
  }
  
  core.logger.logAction(socket,[],'ws',data)
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
  if (!core.ws.has(payload.channel)){
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
      text:`此房间已被设置新线路到 ${core.ws.get(payload.channel)} ，但由于您被信任，因此您可以正常加入 ?${payload.channel}`
    },socket)
    return payload
  }else{
    server.reply({
      cmd:"ws",
      ws: core.ws.get(payload.channel)
    },socket)
    return false
  }
}

// module meta
export const info = {
  name: 'ws',
  description: '给你所在的频道设置新连接线路，只有信任用户或更高等级的用户才不受该规则的限制，如果要使此规则失效，请将目标线路设置为 `*`',
  usage: `
    API: { cmd: 'ws',ws:'<新的地址>' }
    文本：以聊天形式发送 /ws <新的地址>`,
  dataRules:[
    {
      name:'ws',
      required: true,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator,
};
