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
  if (!UAC.isChannelOwner(socket.level)){
    return server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
  }
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您设置视频的速度太快了，请稍后再试'
    },socket)
  }
  if (typeof payload.url !== 'string' || !payload.url){
    return server.reply({
      cmd:'warn',
      text:'数据无效'
    },socket)
  }
  if (payload.url === 'nothing'){
    core.videos[socket.channel] = undefined
    return server.broadcast({
      cmd:'info',
      text:`${socket.nick} 清除了本房间的公共视频`
    },{channel:socket.channel})
  }
  
  core.videos[socket.channel] = payload.url
  return server.broadcast({
    cmd:'info',
    text:`${socket.nick} 更新了本房间的公共视频，点击[此处](${payload.url})即可在新的标签页里打开视频`
  },{channel:socket.channel})
}

export const requiredData = ['url'];
export const info = {
  name: 'set-video',
  description: '更改您所在的房间的公共视频。要删除视频，请将视频链接设置为 `nothing`',
  usage: `
    API: { cmd: 'set-video', url: 'your-video-url' }
    文本：以聊天形式发送 /set-video 视频文件链接
    其他方法：（仅小张聊天室网页版有效）在侧边栏中点击“设置公共视频”按钮`,
  fastcmd:[
    {
      name:'url',
      len:0
    }
  ]
};
