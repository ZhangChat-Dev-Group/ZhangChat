import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket) {
  // increase rate limit chance and ignore if not admin or mod
  if (!UAC.isModerator(socket.level)) {
    return server.police.frisk(socket.address, 10);
  }

  server.unbanall()

  core.stats.set('users-banned', 0);

  console.log(`${socket.nick} [${socket.trip}] 解除了所有封禁`);

  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 解除了所有封禁`,
  }, { level: UAC.isModerator });

  core.logger.logAction(socket,[],'unbanall',data)

  return true;
}

export const info = {
  name: 'unbanall',
  description: '解除所有封禁',
  usage: `
    API: { cmd: 'unbanall' }
    文本：以聊天形式发送 /unbanall`,
  fastcmd:[]
};
