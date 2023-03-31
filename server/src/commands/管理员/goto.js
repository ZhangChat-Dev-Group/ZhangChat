import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.goto === undefined){
    core.goto = {}
  }
}

// module main
export async function run(core, server, socket,data) {
  if (!data.to || typeof data.to !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }
  
  if (data.to === '*'){
    core.goto[socket.channel] = false

    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 已删除 ?${socket.channel} 的重定向规则`
    },{level:UAC.isModerator})
  
    server.broadcast({
      cmd:'info',
      text:'已删除该房间的重定向规则'
    },{level:(l) => l < UAC.levels.moderator})

    return true
  }

  core.goto[socket.channel] = data.to

  server.broadcast({
    cmd:'info',
    text:`${socket.nick} 已设置把加入 ?${socket.channel} 的用户重定向到 ?${data.to}`
  },{level:UAC.isModerator})

  server.broadcast({
    cmd:'info',
    text:'所有加入该房间的非管理员用户都会被重定向到 ?'+data.to
  },{level:(l) => l < UAC.levels.moderator})

  core.logger.logAction(socket,[],'goto',data)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'join', this.ChangeChannel.bind(this),-1);
  // TODO: add whisper hook, need hook priorities todo finished first
}
export function ChangeChannel(core, server, socket, payload) {
  if (socket.changed){
    return payload
  }
  if (payload.channel===undefined || !payload.channel){
    return payload
  }
  if (typeof core.goto[payload.channel] !== 'string'){
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
      text:`此房间已被设置重定向到 ?${core.goto[payload.channel]} ，但由于您被信任，因此您可以正常加入 ?${payload.channel}`
    },socket)
    return payload
  }else{
    payload.channel = core.goto[payload.channel]
    socket.changed = true
    server.reply({
      cmd:"info",
      text:`由于某些原因，您被重定向到 ?${payload.channel}`
    },socket)
    return payload
  }
}

// module meta
export const requiredData = ['to'];
export const info = {
  name: 'goto',
  description: '给你所在的房间设置重定向规则，只有管理员才不受该规则的限制，如果要使此规则失效，请将目标聊天室设置为 `*`',
  usage: `
    API: { cmd: 'goto',to:'<新的房间>' }
    文本：以聊天形式发送 /goto <新的房间>`,
  fastcmd:[
    {
      name:'to',
      len:1
    }
  ],
  level: UAC.levels.moderator,
};
