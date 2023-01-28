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
  // increase rate limit chance and ignore if not admin
  var home = core.home
  if (typeof data.trip !== 'string'){
    var allhomes = ''
    var i;
    for (i in home){
        allhomes += `${i}\n`
    }
    server.reply({
        cmd:'info',
        text:`以下用户（识别码）注册了XChat个人空间：\n${allhomes}您可以发送 \`/home <识别码>\` 来参观他们的个人空间哦~`
    },socket)
    return true
  }else{
    if (typeof home[data.trip] != 'string'){
        return server.reply({
            cmd:'warn',
            text:'# 404 Not Found\n### 抱歉，您访问的个人空间不存在！'
        },socket)
    }
    return server.reply({
        cmd:'info',
        text:home[data.trip]
    },socket)
  }
}

export const info = {
  name: 'home',
  description: '此命令用于参观XChat个人空间',
  usage: `
    API: {cmd: 'home', trip: '<可选的识别码，不填则显示所有注册了XChat空间的用户>'}
    文本：以聊天形式发送 /home <可选的识别码，不填则显示所有注册了XChat空间的用户>`,
  fastcmd:[
    {
      name:'trip',
      len:1
    }
  ]
};
