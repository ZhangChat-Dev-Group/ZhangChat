export async function run(core,server,socket,data){
  if (server.police.frisk(socket.address, 2)) {
    return server.reply({
      cmd: 'warn',
      text: '你获取曾用名的速度过快，请稍后再试',
    }, socket);
  }
  if (!data.nick || typeof data.nick !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }
  var targetSockets = server.findSockets({channel:socket.channel,nick:data.nick.replace('@','')})
  if (targetSockets.length === 0){
    return server.reply({
      cmd:'warn',
      text:'找不到您指定的用户'
    },socket)
  }
  var targetIP = targetSockets[0].address.replace('::ffff:','')
  const sql = `select nick from user_join where ip = '${targetIP}';`;
  await core.chatDB.awaitQueryData(sql).then(ret=>{
    var nicks = []
    var i = 0
    for (i in ret){
      if (nicks.indexOf(ret[i].nick) === -1){
        nicks.push(ret[i].nick)
      }
    }
    server.reply({
      cmd:'info',
      text:`${data.nick.replace('@','')} 的曾用名有：${nicks.join('、')}`
    },socket)
  })
}

// module meta
export const requiredData = ['nick'];
export const info = {
  name: 'oldnick',
  description: '获取某人的曾用名',
  usage: `
    API: { cmd: 'oldnick', nick: '<target nick>' }
    文本：以聊天形式发送 /oldnick 目标昵称`,
  fastcmd:[
    {
      name:'nick',
      len:1
    }
  ]
};