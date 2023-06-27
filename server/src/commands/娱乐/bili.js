import * as UAC from '../utility/UAC/_info';

export async function getBilibiliPlayerLink(videoId) {
  // 构建请求链接
  const apiUrl = `https://api.bilibili.com/x/player/playurl?bvid=${videoId}`;

  // 发送异步请求
  const response = await fetch(apiUrl);
  const data = await response.json();

  // 检查响应状态
  if (data.code !== 0) {
    throw new Error(`请求错误：${data.message}`);
  }

  // 提取外链播放器链接
  const playerUrl = data.data.durl[0].url;

  return playerUrl;
}

// module main
export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您分享哔哩哔哩视频的速度太快了，请稍后再试'
    },socket)
  }

  try{
    const url = getBilibiliPlayerLink(data.id)
  } catch(e) {
    return server.replyWarn(`获取哔哩哔哩外链播放器链接失败，请将此问题上报给管理员或开发人员，谢谢合作`, socket)
  }

  const payload = {
    cmd: 'html',
    nick: socket.nick,
    text: `<iframe src="${url}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`,
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
  core.logger.logAction(socket,[],'bili',payload)
}

export const info = {
  name: 'bili',
  runByChat: true,
  description: '分享一个哔哩哔哩视频，以外联播放器的形式展示给大家',
  usage: `
    API: { cmd: 'bili', id: '哔哩哔哩视频ID' }
    文本：以聊天形式发送 /bili 哔哩哔哩视频ID`,
  dataRules: [
    {
      name: 'id',
      required: true,
      verify: (id) => typeof id === 'string' && !!id,
    }
  ],
};
