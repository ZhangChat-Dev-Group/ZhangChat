/*
  本模块用于查询用户的IP地址
  小张软件总程序员Mr_Zhang编写
  命令开源，除了十字街以外，其他的聊天室都能用
  开源之后请不要忘记注明是小张软件写的哈
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  var power=false;
  if (!UAC.isModerator(socket.level)) {    //康康有没有查看他人IP的权限
    power=false;
  }else{
    power=true;
  }

  if (data.nick === null || data.nick ===undefined) {    //康康参数是否为空（自定义的啊，不建议删除）
    var target=socket.nick;    //如果为空，则目标用户设为自己
  }else{
    if (power){ //如果有权限
      var target=data.nick;    //这个不必多说了哈
    }else{
      var target=socket.nick;    //如果没有权限，则查询自己
    }
  }
  if (typeof target !== 'string') {    //不敢删
    return true;
  }

  let badClient = server.findSockets({ channel: socket.channel, nick: target });

  if (badClient.length === 0) {
    return server.reply({
      cmd: 'warn',
      text: '老娘找不到那个人。。。',
    }, socket);
  }

  [badClient] = badClient;
  server.reply({
    cmd:"info",
    type:"ip",
    text:`${target} 的IP地址为：${badClient.address.replace('::ffff:', '')}`,
    ip:badClient.address.replace('::ffff:', ''),
    ip_nick:badClient.nick,
  },socket);
  return true;
}

//export const requiredData = [];
export const info = {
  name: 'ip',
  description: '查询IP地址，非管理员只能查自己的',
  usage: `
    API: { cmd: 'ip', nick: '<目标用户的昵称，如果查自己的，可以为空>' }
    文本：以聊天形式发送 /ip <目标用户的昵称，如果查自己的，可以为空>`,
  fastcmd:[
    {
      name:'nick',
      len:1
    }
  ]
};
