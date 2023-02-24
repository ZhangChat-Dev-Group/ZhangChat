const cryptoJS = require('crypto-js')

export function init(core){
  if (typeof core.config.murmurKey !== 'string' || !core.config.murmurKey){
    core.config.murmurKey = 'NeverGonnaGiveYouUp,NeverGonnaLetYouDown,NeverGonnaRunAroundAndDesertYou,NeverGonnaMakeYouCry,NeverGonnaSayGoodbye,NeverGonnaMakeYouCry.'
  }
}

export function decode(core,text){
	const key = cryptoJS.enc.Hex.parse(core.config.murmurKey)
  var decrypted = cryptoJS.AES.decrypt(text,key,{ 
    iv: key,
    mode: cryptoJS.mode.CBC,
    padding:cryptoJS.pad.Pkcs7 
  });
  return decrypted.toString(cryptoJS.enc.Utf8);//WordArray对象转utf8字符串
};

export function run(core,server,socket,data){
  return true
}

export function initHooks(server){
  server.registerHook('in','join',this.addMurmurToSocket.bind(this),3)
}

export function addMurmurToSocket(core,server,socket,payload){
  if(socket.isBot){
    return payload
  }

  if (!payload.murmur){    //没有指纹，可能是bot或者旧版客户端
    server.reply({
      cmd:'warn',
      text:'# 哎呀！出错了！\n由于某些原因，我们无法获取你的浏览器指纹。\n这可能是因为你的浏览器上的某些插件阻止了我们，也可能是因为您使用的不是最新版本的小张聊天室网页版。\n如果您在使用第三方客户端，请确保第三方客户端适配了浏览器指纹功能！\n如果您是机器人开发者，请确保token无误！'
    },socket)
    socket.terminate()    //一路走好！
    return false
  }
  try{
    var decoded = this.decode(core,payload.murmur)    //解密被加密的数据
  }catch(err){
    console.error(`无法解密指纹，密文：${payload.murmur}\n错误信息：${err}`)    //后台输出错误
    server.reply({    //报错
      cmd:'warn',
      text:'# 哎呀！出错了！\n由于某些原因，您的某些数据无法被解密，这可能是服务器错误，也可能是您使用的客户端不是最新版，您可以尝试清除浏览器缓存。'
    },socket)
    socket.terminate()    //goodbye
    return false
  }
  if (decoded.length !== 32 || typeof decoded !== 'string' || !decoded){    //如果无法被解密（或者不符合规范），说明是非法指纹
    server.reply({
      cmd:'warn',
      text:'# 哎呀！出错了！\n由于某些原因，我们无法正确获取你的浏览器指纹。\n这可能是因为你的浏览器上的某些插件阻止了我们，也可能是因为您使用的不是最新版本的小张聊天室网页版。\n如果您在使用第三方客户端，请确保第三方客户端适配了浏览器指纹功能！'
    },socket)
    socket.terminate()    //goodbye
    return false    //中断
  }
  socket.murmur=decoded    //赋值
  return payload    //执行后续代码
}

// module meta
export const info = {
  name: 'murmur-support',
  description: '该模块用于提供指纹支持',
  usage: `
    服务器内部调用，如果你用就说明你不是人`,
};
