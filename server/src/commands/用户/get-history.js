export async function run(core,server,socket,data){
  if (server.police.frisk(socket.address, 3)) {
    return server.reply({
      cmd: 'warn',
      text: '你获取聊天记录的速度过快，请稍后再试',
    }, socket);
  }
  const sql = `select nick, trip, head, content, ctime from chat where channel ='${socket.channel}' and show=1 order by id desc limit 20;`;
  await core.chatDB.awaitQueryData(sql).then(ret=>{
    var i = 0
    var historyTag = []
    for (i = ret.length - 1; i >= 0; i -= 1){
      historyTag.push({
        nick: ret[i].nick,
        trip: (ret[i].trip === '无识别码' ? '' : ret[i].trip) || '',
        head: ret[i].head,
        text: ret[i].content,
        time: ret[i].ctime,
      })
    }
    server.reply({
        cmd: 'history',
        history: historyTag,
    }, socket);
  });
}

// module meta
export const info = {
  name: 'get-history',
  description: '获取20条聊天历史记录',
  usage: `
    API: { cmd: 'get-history' }`,
  dataRules: [],
};