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

  if (!text) {
    // lets not send objects or empty text, yea?
    return server.police.frisk(socket.address, 8);
  }

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

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.emoteCheck.bind(this), 100);
}

// hooks chat commands checking for /me
export function emoteCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (payload.text.startsWith('/me ')) {
    const input = payload.text.split(' ');

    // If there is no emote target parameter
    if (input[1] === undefined) {
      server.reply({
        cmd: 'warn',
        text: '请发送 `/help emote` 来查看帮助',
      }, socket);

      return false;
    }

    input.splice(0, 1);
    const actionText = input.join(' ');

    this.run(core, server, socket, {
      cmd: 'emote',
      text: actionText,
    });

    return false;
  }

  return payload;
}

export const requiredData = ['text'];
export const info = {
  name: 'emote',
  description: '以第三人称形式发送文本',
  usage: `
    API: { cmd: 'emote', text: '<text>' }
    文本：以聊天形式发送 /me 信息`,
};
