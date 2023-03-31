import * as UAC from '../utility/UAC/_info';
const sqlString = require('sqlstring')

// module main
export async function run(core, server, socket, data) {
  var querySql = sqlString.format('update chat set show = 0 where channel = ?',[socket.channel])
  core.chatDB.queryData(querySql, (ret)=>{
    server.broadcast({
      cmd: 'info',
      text: `${socket.nick} 已清除 ?${socket.channel} 的历史记录`,
    }, { level: UAC.isModerator });

    core.logger.logAction(socket,[],'rm-history',data)
    
  });
  return true;
}

//export const requiredData = ['channel'];
export const info = {
  name: 'rm-history',
  description: '清除你所在的频道的历史记录（被清除的记录会保存在数据库中，但对他人不可见）',
  usage: `
    API: { cmd: 'rm-history' }
    文本：以聊天形式发送 /rm-history`,
  fastcmd:[],
  level: UAC.levels.moderator,
};
