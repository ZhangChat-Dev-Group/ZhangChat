/*
  Description: Broadcasts an emote to the current channel
*/

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
export async function run(core, server, socket, payload) {
  // check user input
  let text = parseText(payload.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      text: '你发了太多信息，请稍后再试\n您可以点击上下键来恢复发送过的消息',
    }, socket);
  }

  if (!text.startsWith("'")) {
    text = ` ${text}`;
  }

  if (core.shieldCheck(core, text)) return server.replyWarn(`信息包含屏蔽内容，已被拒绝发送`, socket)

  const newPayload = {
    cmd: 'info',
    type: 'emote',
    nick: socket.nick,
    text: `@${socket.nick}${text}`,
  };
  if (socket.trip) {
    newPayload.trip = socket.trip;
  }

  if ((text.match(/[\n]/g) || '').length > 5 || text.length > 250){
    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 即将在 1 秒后发送一条比较长的信息`
    },{channel:socket.channel})
    await sleep(1000)
  }

  //记录信息
  var tileData = [[socket.nick, socket.channel, socket.address.replace('::ffff:', ''), socket.trip || '无识别码', socket.murmur || '无指纹', socket.location || '定位失败', String(socket.level), socket.token || '无token', `@${socket.nick}${text}`]]
  var insertTileSql = "insert into emote(nick, channel, ip, trip, murmur, city, level, token, content) values(?, ?, ?, ?, ?, ?, ?, ?,? )"
  core.chatDB.insertData(insertTileSql, tileData);

  // broadcast to channel peers
  server.broadcast(newPayload, { channel: socket.channel });

  return true;
}

export const info = {
  aliases: ['me'],
  name: 'emote',
  description: '以第三人称形式发送文本',
  usage: `
    API: { cmd: 'emote', text: '<text>' }
    文本：以聊天形式发送 /me 信息`,
  dataRules: [
    {
      name: 'text',
      all: true,
      verify: (text) => typeof text === 'string' && !!parseText(text),
      errorMessage: '大哥，别用无效的信息玩我，OK？',
      required: true
    },
  ],
  runByChat: true,
};
