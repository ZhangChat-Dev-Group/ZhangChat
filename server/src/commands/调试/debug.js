import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  try{
    eval(data.code)
  }catch(err){
    server.reply({
      cmd:'warn',
      text:'执行代码时出现错误！\n'+err
    },socket)
    core.logger.logAction(socket,[],'debug',`代码：\n${data.code}\n\n执行失败：\n${err}`)
    return true
  }
  server.reply({
    cmd:'info',
    text:'代码执行成功'
  },socket)
  core.logger.logAction(socket,[],'debug',`代码：\n${data.code}\n\n执行成功`)
}

export const info = {
  name: 'debug',
  description: '通过执行JS代码来调试服务器',
  usage: `
    API：{cmd:'debug',code:'亿堆代码...'}
    文本：以聊天形式发送 /debug 亿堆代码...`,
  runByChat: true,
  dataRules: [
    {
      name: 'code',
      required: true,
      verify: code => typeof code === 'string' && !!code,
      all: true,
    }
  ],
  level: UAC.levels.admin,
};
