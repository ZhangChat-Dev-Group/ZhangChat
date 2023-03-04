import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 10);
  }

  // check user input
  if (typeof data.nick !== 'string') {
    return true;
  }

  // find target user
  const targetNick = data.nick;
  let badClient = server.findSockets({ channel: socket.channel, nick: targetNick });

  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '找不到目标用户',
    }, socket);
  }

  [badClient] = badClient;

  // i guess banning mods or admins isn't the best idea?
  if (badClient.level >= socket.level) {
    return server.reply({
      cmd: 'warn',
      text: '不能封禁你的同事，这是很粗鲁的',
    }, socket);
  }

  if (server.findSockets({
    address: badClient.address,
    level: (l) => l >= socket.level,
  }).length > 0){    //防止封禁其他管理员开的小号
    return server.reply({
      cmd: 'warn',
      text: `你的某位同事和 @${badClient.nick} 使用了同一个IP地址，如果你把 @${badClient.nick} 封禁了，那么你的同事也会遭殃的！`,
    }, socket);
  }

  var otherUsers = server.ban(badClient.address)

  var formated = {}

  otherUsers.forEach((user) => {
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

  // stats are fun
  core.stats.increment('users-banned');

  core.logger.logAction(socket,[],'ban',data,`[${socket.trip}] ${socket.nick} 封禁了 ?${socket.channel} 的 ${targetNick}。\n波及用户：\n${strUsersList} \n${targetNick} IP地址为：${badClient.address}`)

  return true;
}

export const requiredData = ['nick'];
export const info = {
  name: 'ban',
  description: '封禁一名用户',
  usage: `
    API: { cmd: 'ban', nick: '<target nickname>' }
    文本：以聊天形式发送 /ban 目标昵称`,
  fastcmd:[
    {
      name:'nick',
      len:1,
      check: UAC.verifyNickname
    }
  ]
};
