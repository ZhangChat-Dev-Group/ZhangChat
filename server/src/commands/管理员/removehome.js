import * as UAC from '../utility/UAC/_info'

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
  if (!UAC.isModerator(socket.level)){
    server.police.frisk(socket.address, 10);
    return server.reply({
      cmd:'warn',
      text:'随随便便删除别人的个人空间是不道德的。~~（夺笋啊！）~~'
    },socket)
  }
  var home = core.home
  if (typeof home[data.trip] != 'string'){
    return server.reply({
      cmd:'warn',
      text:'# 404 Not Found\n### 抱歉，您要删除的个人空间不存在！'
    },socket)
  }
  const sql = `delete from home where trip = '${data.trip}';`    //一般情况下，正常的识别码是不会导致SQL注入的，前面的代码用于检查识别码是否存在（识别码是否正常）
  delete core.home[data.trip]
  core.chatDB.queryData(sql, (ret)=>{
    server.broadcast({
      cmd:'info',
      text:'您的个人空间已被管理员删除'
    },{trip:data.trip})
    server.broadcast({
      cmd:'info',
      text:`${socket.nick} 删除了识别码为 ${data.trip} 的用户的个人空间`
    },{level:UAC.isModerator})
  })

  core.logger.logAction(socket,[],'removehome',data)
}

export const info = {
  name: 'removehome',
  description: '删除某人的个人空间',
  usage: `
    API: {cmd: 'removehome', trip: '<target trip>'}
    文本：以聊天形式发送 /removehome 目标识别码`,
  fastcmd:[
    {
      name:'trip',
      len:1,
      check: /^[a-zA-Z0-9/\+]{6}$/
    }
  ]
};
