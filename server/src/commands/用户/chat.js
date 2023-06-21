/*
  Description: Rebroadcasts any `text` to all clients in a `channel`
*/

import * as UAC from '../utility/UAC/_info';

// module support functions
const parseText = (text) => {
  // verifies user input is text
  if (typeof text !== 'string') {
    return false;
  }

  let sanitizedText = text;

  // strip newlines from beginning and end
  sanitizedText = sanitizedText.replace(/^\s*\n|^\s+$|\n\s*$/g, '');
  // replace 3+ newlines with just 2 newlines
  sanitizedText = sanitizedText.replace(/\n{3,}/g, '\n\n');

  return sanitizedText;
};

const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

// module main
export async function run(core, server, socket, data) {
  // check user input
  const text = parseText(data.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '你发了太多信息，请稍后再试\n您可以点击上下键来恢复发送过的消息',
    }, socket);
  }

  // build chat payload
  const payload = {
    cmd: 'chat',
    nick: socket.nick,
    text,
    level: socket.level,
  };

  if (UAC.isAdmin(socket.level)) {
    payload.admin = true;
  } else if (UAC.isModerator(socket.level)) {
    payload.mod = true;
  } else if (UAC.isChannelOwner(socket.level)) {
    payload.channelOwner = true
  } else if (UAC.isTrustedUser(socket.level)) {
    payload.trusted = true;
  }

  if (socket.trip) {
    payload.trip = socket.trip;
  }

  if ((text.match(/[\n]/g) || '').length > 5 || text.length > 250){
    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 即将在 1 秒后发送一条比较长的信息`
    },{channel:socket.channel})
    await sleep(1000)
  }
  
  //记录信息
  var tileData = [[socket.channel, socket.nick, text, 'chat', 1, socket.head || '/imgs/head.png', socket.address.replace('::ffff:', ''), socket.trip || '无识别码', socket.murmur || '无指纹', socket.location || '定位失败', String(socket.level), socket.token || '无token']]
  var insertTileSql = "insert into chat(channel, nick, content, cmd, show, head, ip, trip, murmur, city, level, token) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  core.chatDB.insertData(insertTileSql, tileData);

  // broadcast to channel peers
  server.broadcast(payload, { channel: socket.channel });

  // stats are fun
  core.stats.increment('messages-sent');

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.commandCheckIn.bind(this), 20);
  server.registerHook('in', 'chat', this.finalCmdCheck.bind(this), 254);
}

// checks for miscellaneous '/' based commands
export function commandCheckIn(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/myhash')) {
    server.reply({
      cmd: 'info',
      text: `你的hash是：${socket.hash}`,
    }, socket);

    return false;
  }else if (payload.text.startsWith('/shrug')){
    payload.text = '¯\\\\\\_(ツ)\\_/¯'
  }

  return payload;
}

export function finalCmdCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (!payload.text.startsWith('/')) {
    return payload;
  }

  if (payload.text.startsWith('//')) {
    payload.text = payload.text.substr(1);
    return payload;
  }

  const cmd = payload.text.split(' ')[0].slice(1)
  const command = core.commands.get(cmd)

  if (!command) {
    core.commands.handleFail(server, socket, { cmd })
    return false
  }

  if (command.info.runByChat) {
    if (Array.isArray(command.info.dataRules)) {
      const data = core.commands.parseText(command.info.dataRules, payload.text)
      core.commands.handleCommand(server, socket, data)
      return false
    }
  }

  core.commands.handleFail(server, socket, { cmd })

  return false;
}

export const info = {
  name: 'chat',
  description: '发送信息。如果您不想制作客户端，就忽略我吧！',
  usage: `
    API: { cmd: 'chat', text: '<text to send>' }
    文本：直接在输入框输入内容并按“Enter”来发送。\n
    隐藏的命令:
    /myhash
    /shrug`,
  dataRules: [
    {
      name: 'text',
      verify: (text) => typeof text === 'string' && !!parseText(text),
      all: true,
      errorMessage: '大哥，别用无效的信息玩我，OK？',
      required: true,
    }
  ],
};
