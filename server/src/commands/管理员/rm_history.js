import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }
  var querySql = `update chat set show = 0 where channel='${socket.channel}';`;
  core.chatDB.queryData(querySql, (ret)=>{
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick} 已清除 ?${socket.channel} 的历史记录`,
    }, { level: UAC.isModerator });
    
  });
  return true;
}

//export const requiredData = ['channel'];
export const info = {
  name: 'rm_history',
  description: '删除你所在的房间地所有历史记录',
  usage: `
    API: { cmd: 'rm_history' }
    文本：以聊天形式发送 /rm_history`,
  fastcmd:[]
};
