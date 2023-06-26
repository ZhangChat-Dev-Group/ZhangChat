import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.auth) {
    core.config.auth = {}
  }
}

// module main
export async function run(core, server, socket, data) {
  if (typeof data.trip !== 'string') {
    // 未提供识别码，显示列表
    let text = '当前系统认证有：\n'
    Object.keys(core.config.auth).forEach((trip) => {
      text += `[\`${trip}\`] \`${core.config.auth[trip]}\`\n`
    })

    return server.reply({
      cmd: 'info',
      text,
    }, socket)
  }

  const trip = data.trip
  const auth = data.text.trim() || ''

  if (!auth) {
    // 模式：删除
    if (typeof core.config.auth[trip] !== 'string') {
      return server.reply({
        cmd: 'warn',
        text: `识别码 ${trip} 没有认证信息`
      }, socket)
    }

    delete core.config.auth[trip]    // 删除
    server.broadcast({
      cmd: 'info',
      text: `[${socket.trip}] ${socket.nick} 删除了认证信息：${trip}`
    }, { level: UAC.isModerator })
    server.broadcast({
      cmd: 'info',
      text: '您的认证信息已被删除',
    }, { trip: trip })
  }else{
    // 模式：添加/修改
    core.config.auth[trip] = auth

    server.broadcast({
      cmd: 'info',
      text: `[\`${socket.trip}\`] \`${socket.nick}\` 添加了认证信息：\n[\`${trip}\`] \`${auth}\``
    }, { level: UAC.isModerator })

    server.broadcast({
      cmd: 'info',
      text: `已添加认证信息：\n[\`${trip}\`] \`${auth}\``,
    }, { trip: trip })
  }

  core.logger.logAction(socket,[],'auth',data)

  if (!core.configManager.save()) {
    return server.broadcast({
      cmd: 'warn',
      text: '保存配置失败，请检查日志。',
    }, {level:UAC.isModerator});
  }

}

export function initHooks(server) {
  server.registerHook('out', 'onlineAdd', this.addAuthToPayload.bind(this));
}

export function addAuthToPayload(core,server,socket,payload){
  if (payload.auth){
    return payload
  }
  if (!payload.trip){
    return payload
  }
  if (core.config.auth.find((a) => a.trip === payload.trip)){
    payload.auth = core.config.auth.find((a) => a.trip === payload.trip).info
  }
  return payload
}

export const info = {
  name: 'auth',
  description: '添加、删除指定识别码的认证信息，不传递参数则显示所有认证',
  usage: `
    API: { cmd: 'addauth', trip: '<目标识别码>', text:'<认证信息>' }
    文本：以聊天形式发送 /addauth <目标识别码> <认证信息>`,
  runByChat: true,
  dataRules: [
    {
      name: 'trip',
      verify: UAC.verifyTrip,
      errorMessage: UAC.nameLimit.trip,
    },
    {
      name: 'text',
      verify: (text) => typeof text === 'string' && !!text.trim(),
      all: true,
      errorMessage: '认证信息无效，请重试。',
    }
  ],
  level: UAC.levels.moderator,
};
