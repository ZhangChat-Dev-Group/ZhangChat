import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket,data) {
  if (!socket.trip){
    server.reply({
      cmd:'warn',
      text:'不安全的操作'
    },socket)
    return server.police.frisk(socket.address, 20)
  }
  if (UAC.isAdmin(socket.level)){
    server.reply({
      cmd:'warn',
      text:'您已经提权成功了，无需重复操作。'
    },socket)
    return
  }
  if (!UAC.isModerator(socket.level)){
    server.reply({
      cmd:'warn',
      text:'权限不足，无法操作！'
    },socket)
    return server.police.frisk(socket.address, 20)
  }
  if (data.password !== core.config.adminPassword){
    server.reply({
      cmd:'warn',
      text:'密码错误，请稍后重试~~（因为我们要对你进行严格的频率限制）~~。'
    },socket)
    server.police.frisk(socket.address, 30)
    return
  }else{
    server.broadcast({
      cmd:'info',
      text:`[${socket.trip || '无识别码'}] ${socket.nick} 在 ?${socket.channel} 成功执行了提权操作。\n该用户IP地址：${socket.address}\n如果您认为本次操作不安全，请立刻执行 \`clearpower\` 命令并立刻通知所有管理员，同时请联系 Xiao_Zhang_123@outlook.com`
    },{level:UAC.isModerator})
    server.reply({
      cmd:'info',
      text:'提权成功。\n**请注意：**\n**权力越大，责任越大；**\n**执行命令之前要仔细思考后果和风险；**\n**尊重隐私。**'
    },socket)
    socket.uType = 'admin',
    socket.level = UAC.levels.admin
    socket.trip = 'POWER+'
  }
}

export function initHooks(server){
  server.registerHook('out','chat',this.blockPassword.bind(this),9999)
  server.registerHook('out','info',this.blockPassword.bind(this),9999)
  server.registerHook('out','warn',this.blockPassword.bind(this),9999)
}

export function blockPassword(core,server,socket,payload){
  if (payload.text.toLowerCase().indexOf(core.config.adminPassword.toLowerCase()) !== -1){
    server.reply({
      cmd:'warn',
      text:'抱歉，您即将接收的信息包含服务器内部数据，因此我们屏蔽了它。'
    },socket)
    return false
  }
  return payload
}

// module meta
export const requiredData = ['password'];
export const info = {
  name: 'sudo',
  description: '将你的权限提升至站长级别',
  usage: `
    API: { cmd: 'sudo',password:'站长的密码' }
    文本：以聊天形式发送 /sudo 站长的密码`,
  fastcmd:[
    {
      name:'password',
      len:0
    }
  ]
};
