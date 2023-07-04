import * as UAC from '../utility/UAC/_info';

export async function init(core) {
  if (core.lockedrooms === undefined){
    core.lockedrooms = []
  }
}

// module main
export async function run(core, server, socket,data) {
  const mode = !core.lockedrooms.includes('*')

  if (mode) core.lockedrooms.push('*')
  else core.lockedrooms = core.lockedrooms.filter(c => c !== '*')

  server.broadcastInfo(`${socket.nick}#${socket.trip} 执行了全站${mode ? '锁定' : '解锁'}操作`, { level: UAC.isModerator })
  server.broadcastInfo(`已执行全站${mode ? '锁定' : '解锁'}操作`, { level: (l) => l < UAC.levels.moderator })

  core.logger.logAction(socket,[],'locksite',data, '方法：' + mode ? '锁定' : '解锁')

}

// Hook代码请看 lockroom.js

// module meta
export const info = {
  name: 'locksite',
  runByChat: true,
  description: '执行全站锁定（或解锁）操作',
  usage: `
    API: { cmd: 'locksite' }
    文本：以聊天形式发送 /locksite`,
  dataRules: [],
  level: UAC.levels.moderator
};
