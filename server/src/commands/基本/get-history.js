import * as UAC from '../utility/UAC/_info'

export async function run(core,server,socket,data){
  if (server.police.frisk(socket.address, 3)) {
    return server.reply({
      cmd: 'warn',
      text: '你获取聊天记录的速度过快，请稍后再试',
    }, socket);
  }

  var channel
  if (data.channel) {
    // 如果提供了channel参数，那么就必须验证cmdKey以确认是服务器自己调用
    if (data.cmdKey !== server.cmdKey) return server.replyWarn('只有服务器自身才能指定channel参数')
    channel = data.channel
  } else channel = socket.channel
  // channel的格式已经被严格限制，不可能出现SQL注入
  const sql = `select nick, trip, head, content, ctime from chat where channel ='${channel}' and show=1 order by id desc limit 20;`;
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
  return true
}

export const info = {
  name: 'get-history',
  description: '获取20条聊天历史记录',
  usage: `
    API: { cmd: 'get-history' }`,
  dataRules: [
    {
      name: 'channel',
      verify: UAC.verifyChannel,
      errorMessage: UAC.nameLimit.channel,
    },
    {
      name: 'cmdKey',
      verify: key => typeof key === 'string' && !!key,
    }
  ],
};
