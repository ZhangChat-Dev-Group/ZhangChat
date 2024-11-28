import * as UAC from '../utility/UAC/_info';

export function init (core){
  if (typeof core.videos !== 'object'){
    core.videos = {}
    /*
      格式：
      {
        channel1: video-url-1
      }
    */
  }
}

// module main
export async function run(core, server, socket, payload) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您设置视频的速度太快了，请稍后再试'
    },socket)
  }
  if (payload.url === 'nothing'){
    delete core.videos[socket.channel]
    return server.broadcast({
      cmd:'info',
      text:`${socket.nick} 清除了本房间的公共视频`
    },{channel:socket.channel})
  }
  const lastVideo = core.videos[socket.channel] || '<undefined>'
  core.videos[socket.channel] = payload.url
  server.broadcast({
    cmd:'info',
    text:`${socket.nick} 更新了本房间的公共视频，点击[此处](${payload.url})即可在新的标签页里打开视频，也可以在侧边栏中点击“一起看视频”按钮`
  },{channel:socket.channel})

  // 保存为档案
  core.logger.logAction(socket,[],'set-video',payload,'原视频：'+lastVideo)
}

export const info = {
  name: 'set-video',
  runByChat: true,
  description: '更改您所在的房间的公共视频。要删除视频，请将视频链接设置为 `nothing`',
  usage: `
    API: { cmd: 'set-video', url: 'your-video-url' }
    文本：以聊天形式发送 /set-video 视频文件链接
    其他方法：（仅小张聊天室网页版有效）在侧边栏中点击“设置公共视频”按钮`,
  dataRules: [
    {
      name: 'url',
      required: true,
      verify: (url) => {
        if (typeof url !== 'string') return false
        if (url.toLowerCase() === 'nothing') return true
        return /http(s)?:\/\/[\w.]+[\w\/]*[\w.]*\??[\w=&\+\%]*/is.test(url)
      }
    }
  ],
  level: UAC.levels.channelOwner
};
