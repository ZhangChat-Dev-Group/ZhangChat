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
      text:'您打开视频的速度太快了，请稍后再试'
    },socket)
  }
  if (typeof core.videos[socket.channel] === 'string'){
    return server.reply({
      cmd:'set-video',
      url: core.videos[socket.channel]
    },socket)
  }else{
    return server.reply({
      cmd:'warn',
      text:'抱歉，您所在的房间没有设置公共视频，您可以联系房主或管理员设置'
    },socket)
  }
}

export const info = {
  name: 'get-video',
  description: '获取您所在的房间的公共视频。',
  usage: `
    API: { cmd: 'get-video' }
    文本：以聊天形式发送 /get-video
    其他方法：（仅小张聊天室网页版有效）在侧边栏中点击“一起看视频”按钮
    服务器返回数据：
    当有公共视频时：{ cmd: 'set-video', url: 'video-url' }
    当没有公共视频时：{ cmd: 'warn', text: '抱歉，您所在的房间没有设置公共视频，您可以联系房主或管理员设置' }`,
  fastcmd:[]
};
