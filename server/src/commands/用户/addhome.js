import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.home){
    core.home = {}
    var i = 0
    const sql = `select * from home;`
    core.chatDB.awaitQueryData(sql).then(ret => {
      var i = 0
      for (i in ret){
        core.home[ret[i].trip] = ret[i].content
      }
    })
  }
}

export async function run(core, server, socket, data) {
  if (server.police.frisk(socket.address, 2)){
    return server.reply({
      cmd:'warn',
      text:'您更新个人空间的速度太快了，请稍后再试'
    },socket)
  }
  // increase rate limit chance and ignore if not admin
  var homes = core.home
  if (!socket.trip){
    return server.reply({
      cmd:'warn',
      text:'要注册个人空间，就必须拥有一个识别码。'
    },socket)
  }
  
  if (!data.text){
    core.chatDB.queryData(`delete from home where trip = '${socket.trip}';`,ret=>{
      delete core.home[socket.trip]
      server.reply({
        cmd:'info',
        text:'已删除您的个人空间'
      },socket)
    })
  }else{
    //回调地狱？？？函数瀑布？？？？？？
    core.chatDB.queryData(`delete from home where trip = '${socket.trip}';`,ret=>{
      homes[socket.trip] = data.text
      var tileData = [[socket.trip,data.text]]
      var insertTileSql = "insert into home(trip,content) values(?,?)"
      core.chatDB.insertData(insertTileSql, tileData);
      server.reply({
        cmd:'info',
        text:'成功更新个人空间！'
      },socket)
      server.broadcast({
        cmd:'info',
        text:`识别码为 ${socket.trip} 的用户更新了他的个人空间，请及时查看！`
      },{level:UAC.isModerator})
    })
  }
}
export const info = {
  name: 'addhome',
  description: '此命令用于修改你的个人空间（支持Markdown和LaTeX）',
  usage: `
    API: {cmd: 'addhome', text: '<个人空间内容，不填则为删除>'}
    文本：以聊天形式发送 /addhome <个人空间内容，不填则为删除>`,
  fastcmd:[
    {
      name:'text',
      len:0
    }
  ]
};
