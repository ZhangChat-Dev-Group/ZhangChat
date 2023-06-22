import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  const ip = data.ip
  let badClients = server.findSockets({ address: ip });

  if (badClients.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到目标用户',
    }, socket);
  }

  if (badClients.find(s => s.level >= socket.level)){    //防止封禁其他管理员开的小号
    return server.reply({
      cmd: 'warn',
      text: `此IP地址下有你的同事，如果你继续操作，那么你的同事也会遭殃的！`,
    }, socket);
  }

  var formated = {}
  badClients.forEach((user) => {
    if (typeof formated[user.channel || server.cmdKey] !== 'object'){
      formated[user.channel || server.cmdKey] = []
    }
    formated[user.channel || server.cmdKey].push(user)
  })

  var i
  var strUsersList = ''

  for (i in formated){
    let nicks = []

    strUsersList += '?'+ i + ' '

    formated[i].forEach((user) => {
      nicks.push(user.nick)
      strUsersList += `[${user.trip || null}]${user.nick} `
    })

    strUsersList += '\n'

    server.broadcast({
      cmd:'info',
      text: '已封禁 '+nicks.join('，')
    }, {channel:i,level: (level) => level < UAC.levels.moderator})

    formated[i].forEach((user) => {
      user.terminate()
    })
  }

  console.log(`[${socket.trip}] ${socket.nick} 封禁了 ?${socket.channel} 的 ${targetNick}。\n波及用户：\n${strUsersList} \n${targetNick} IP地址为：${badClient.address}`)

  // notify mods
  server.broadcast({
    cmd: 'info',
    text: `[${socket.trip}] ${socket.nick} 封禁了 ?${socket.channel} 的 ${targetNick}。\n波及用户：\n${strUsersList} \n${targetNick} IP地址为：${badClient.address}\n您可以通过上面提供的IP来解除封禁该用户`,
    channel: socket.channel,
    user: UAC.getUserDetails(badClient),
    banner: UAC.getUserDetails(socket),
  }, { level: UAC.isModerator });

  core.logger.logAction(socket,[],'ban',data,`[${socket.trip}] ${socket.nick} 封禁了 ?${socket.channel} 的 ${targetNick}。\n波及用户：\n${strUsersList} \n${targetNick} IP地址为：${badClient.address}`)
  return true;
}

export const info = {
  name: 'banip',
  description: '通过IP地址封禁一名用户',
  usage: `
    API: { cmd: 'banip', ip: '<target IP>' }
    文本：以聊天形式发送 /banip 目标IP`,
  runByChat: true,
  dataRules: [
    {
      name: 'ip',
      required: true,
    }
  ],
  level: UAC.levels.moderator,    // 指定权限
};
