/*
  Description: 修改颜色
*/

export function init(core){
  if (typeof core.colors !== 'object'){
    core.colors = {}
    /*
    格式：
    {
      trip1: color1
    }
    */
  }
}

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 2)) {
    return server.reply({
      cmd: 'warn',
      text: '你修改颜色的速度太快，请稍后再试',
    }, socket);
  }
  if(typeof data.color !== 'string'){
    return true;
  }
  if (!data.color){
    return true
  }
  if (data.color === 'reset'){
    socket.color = false
    server.reply({
      cmd:'info',
      text:'昵称颜色已重置'
    },socket)
  }else{
    socket.color = data.color.replace(/#/g, '');
  }
  if (socket.trip){
    if (data.color === 'reset'){
      delete core.colors[socket.trip]
    }else{
      core.colors[socket.trip] = socket.color
    }
  }
}

// module hook functions
export function initHooks(server) {
  server.registerHook('out','chat',this.addcolor.bind(this),9999)
  server.registerHook('in','join',this.autoChangeColor.bind(this),999)
}

export function autoChangeColor(core,server,socket,payload){
  if (!payload.nick){
    return payload    //报错就直接交给系统
  }
  const joinModule = core.commands.get('join');
  const userInfo = joinModule.parseNickname(core, payload);
  if (typeof userInfo === "string"){
    return payload
  }
  if (!userInfo.trip){
    return payload
  }
  if (!core.colors[userInfo.trip]){
    return payload
  }
  socket.color = core.colors[userInfo.trip]
  return payload
}

export function addcolor(core,server,socket,payload){
  var senders = server.findSockets({channel:socket.channel,nick:payload.nick})
  if (senders.length === 0){return payload}    //这个代码是为虚拟人物“机娘”准备的
  var sender = senders[0]
  if (!sender.color){
    return payload
  }
  var color = sender.color.replace(/#/g, '');
  payload.color = color
  return payload
}

export const info = {
  name: 'changecolor',
  aliases: ['color'],
  description: '修改你的昵称的颜色',
  usage: `
    API: { cmd: 'changecolor', color: '<十六进制的颜色>' }
    文本：以聊天形式发送 /color 十六进制的颜色`,
  dataRules: [
    {
      name: 'color',
      verify: (text) => {
        return /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(text.replace(/#/g,'')) || text.toLowerCase() === 'reset'
      },
      errorMessage: '无效的颜色，颜色必须是16进制代码或者 `reset`（重置颜色）',
      required: true,
    }
  ],
  runByChat: true,
};
