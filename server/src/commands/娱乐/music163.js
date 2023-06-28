import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您分享网易云音乐的速度太快了，请稍后再试'
    },socket)
  }

  const parsedNumber = Number.parseInt(data.id)
  const id = parsedNumber

  const payload = {
    cmd: 'html',
    nick: socket.nick,
    text: `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=66"></iframe>`,
    level: socket.level,
  }

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

  server.broadcast(payload, { channel: socket.channel })

  // 保存为档案
  core.logger.logAction(socket,[],'music163',payload)
}

export const info = {
  name: 'music163',
  runByChat: true,
  description: '分享一个网易云音乐，以外联播放器的形式展示给大家',
  usage: `
    API: { cmd: 'music163', id: '网易云音乐ID' }
    文本：以聊天形式发送 /music163 网易云音乐ID`,
  dataRules: [
    {
      name: 'id',
      required: true,
      verify: (id) => {
        const parsedNumber = Number.parseInt(id)
        if (isNaN(parsedNumber)) return '您尚未提供有效的网易云音乐ID'
        if (parsedNumber <= 0) return '音乐ID无效'
        return true
      }
    }
  ],
};
