export async function run(core, server, socket, data) {

  return true;
}

export function initHooks(server){
    server.registerHook('in', 'join', this.banCheck.bind(this),4);
}

export function banCheck(core,server,socket,payload){
  if (core.config.bannedMurmurs.indexOf(socket.murmur) !== -1){
    server.reply({
      cmd:'warn',
      text:'您已被精准封禁'
    },socket)
    socket.terminate()
    return false
  }
  return payload
}

export const info = {
  name: 'other-ban-check',
  description: '高模块用于检测用户是否被其他的封禁规则限制',
  usage: `
    服务器内部调用，如果你调用了，就说明你不是人 ;)`,
};
