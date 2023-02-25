export function init(core){
  if (typeof core.afk !== 'object'){
    core.afk = {}
    /*
      {
        channel1:{
          nick1:trip1
        }
      }
    */
  }
}

export function isArray(myArray) {
  return myArray.constructor.toString().indexOf("Array") > -1;
}

export async function run(core, server, socket, data) {
  if (!core.afk[socket.channel]){
    core.afk[socket.channel] = {}
  }
  if (core.afk[socket.channel][socket.nick.toLowerCase()] !== undefined){
    return server.reply({
      cmd:'warn',
      text:'您已经在挂机了'
    },socket)
  }
  if (!socket.trip){
    return server.reply({
      cmd:'warn',
      text:'若要挂机，则必须设置识别码！您可以刷新并在输入昵称时输入：昵称#密码'
    },socket)
  }
  core.afk[socket.channel][socket.nick.toLowerCase()] = socket.trip

  server.broadcast({
    cmd:'info',
    text:socket.nick + ' 进入了挂机状态'
  },{channel:socket.channel})

  //祖传注释：stats are fun
  core.stats.increment('users-afk');

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.fastAFK.bind(this));
  server.registerHook('in', 'chat', this.exitAFK.bind(this),99999999999999);
}

export function fastAFK(core,server,socket,payload){
  if (payload.text === 'afk'){
    this.run(core,server,socket,{
      cmd:'afk'
    })
    return false
  }
  return payload
}

export function exitAFK(core,server,socket,payload){
  if (core.afk[socket.channel] === undefined){
    core.afk[socket.channel] = {}
    return payload    //前人铺路
  }
  if (core.afk[socket.channel][socket.nick.toLowerCase()] !== undefined){
    core.afk[socket.channel][socket.nick.toLowerCase()] = undefined
    core.stats.decrement('users-afk')
    server.broadcast({
      cmd:'info',
      text:socket.nick+' 退出了挂机状态'
    },{channel:socket.channel})
  }
  return payload
}

export const info = {
  name: 'afk',
  description: '让自己进入挂机状态（AFK）',
  usage: `
    API: { cmd: 'afk'}
    文本：以聊天形式发送 /afk
    快速操作：以聊天形式发送 afk`,
  fastcmd: []
};
