import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您分享GS音乐的速度太快了，请稍后再试'
    },socket)
  }

  const parsedNumber = Number.parseInt(data.id)
  const id = parsedNumber

  const payload = {
    cmd: 'html',
    nick: socket.nick,
    text: `<iframe frameborder="0" style="width:400px;height:145px;" src="https://music.zzcm.fun/ply.html?${id}"></iframe>`,
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
  core.logger.logAction(socket,[],'musicgs',payload)
}

export const info = {
  name: 'musicgs',
  runByChat: true,
  description: '分享一个GS音乐，以外联播放器的形式展示给大家',
  usage: `
    API: { cmd: 'musicgs', id: 'GS音乐ID' }
    文本：以聊天形式发送 /musicgs GS音乐ID`,
  dataRules: [
    {
      name: 'id',
      required: true,
      verify: (id) => {
        const parsedNumber = Number.parseInt(id)
        if (isNaN(parsedNumber)) return '您尚未提供有效的GS音乐ID'
        if (parsedNumber < 1000000000 || parsedNumber > 9999999999) return 'GS音乐ID无效'
        return true
      }
    }
  ],
};
