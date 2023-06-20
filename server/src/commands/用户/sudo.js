import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket,data) {
  if (!socket.trip){
    server.reply({
      cmd:'warn',
      text:'无识别码用户不能提权'
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
  if (core.config.powerfulUsers[socket.trip] !== UAC.levels.admin){
    server.reply({
      cmd:'warn',
      text:'您不是可提权用户，请稍后重试~~（因为我们要对你进行严格的频率限制）~~。'
    },socket)
    server.police.frisk(socket.address, 30)
    core.logger.logAction(socket,[],'sudo',data,'提权失败')
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
    //socket.trip = 'POWER+'    //这段代码应该弃用
    core.logger.logAction(socket,[],'sudo',data,'提权成功')
  }
}

// module meta
export const info = {
  name: 'sudo',
  description: '将你的权限提升至站长级别，仅可提权用户可用',
  usage: `
    API: { cmd: 'sudo' }
    文本：以聊天形式发送 /sudo`,
  dataRules:[],
  runByChat: true,
};
