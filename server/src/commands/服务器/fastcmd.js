export async function run(core, server, socket, payload) {
  //啥都没有
  return true    //这不还是有吗？
}
// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.fastcmd.bind(this), 100);
}

export function isArray(myArray) {
  return myArray.constructor.toString().indexOf("Array") > -1;
}

// hooks chat commands checking for /me
export function fastcmd(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }
  const cmdlist = payload.text.split(' ')    //切分
  
  //检查是否以“/”开头
  if (!cmdlist[0].startsWith('/')){
    return payload
  }

  //是否转义
  if (cmdlist[0].startsWith('//')){
    return payload
  }

  const cmdName = cmdlist[0].slice(1);    //获取命令名称
  const command = core.commands.get(cmdName)    //找命令模块

  if (!command){    //如果找不到
    return payload
  }
  
  if (typeof command.info.fastcmd !== 'object' || !isArray(command.info.fastcmd)){
    return payload    //如果模块没有启用fastcmd支持
  }
  //声明变量
  var i = 0
  var cut = 1
  var fakePayload = {    //假的数据包
    cmd:cmdName,
  }

  for (i in command.info.fastcmd){    //构建假的数据包
    if (command.info.fastcmd[i].len === 0){    //如果要求的长度为0，则代表通吃所有内容
      var temp = cmdlist.slice(cut,cmdlist.length)
      if (temp.length === 0){
        continue
      }
      fakePayload[command.info.fastcmd[i].name] = temp.join(' ')    //给你吧
      break    //没用了，结束循环吧
    }
    var temp = cmdlist.slice(cut,cut+command.info.fastcmd[i].len)
    if (temp.length === 0){
      continue
    }
    fakePayload[command.info.fastcmd[i].name] = temp.join(' ')    //截取数组，然后join一下
    cut += command.info.fastcmd[i].len
  }
  
  if (typeof fakePayload.nick === 'string'){
    fakePayload.nick = fakePayload.nick.replace(/@/g,'')    //删掉昵称里面的 “@”
  }
  
  server.handleData(socket,JSON.stringify(fakePayload))
  return false
}


export const info = {
  name: 'fastcmd',
  description: '快速执行命令。由[小张软件](https://www.zhangsoft.cf/)倾情制作。本聊天室已购买该模块。',
  usage: `服务器内部自动调用，如果你想用，就说明你不是人。`,
};
