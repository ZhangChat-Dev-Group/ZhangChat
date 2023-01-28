/*
  Description: This module will be directly called by the server event handler
               when a socket connection is closed or lost.
*/

// module main
export async function run(core, server, socket, data) {
  if (data.cmdKey !== server.cmdKey) {
    // internal command attempt by client, increase rate limit chance and ignore
    return server.police.frisk(socket.address, 20);
  }

  // send leave notice to client peers
  if (socket.channel) {
    server.broadcast({
      cmd: 'onlineRemove',
      nick: socket.nick,
    }, { channel: socket.channel });
  }

  // commit close just in case
  socket.terminate();

  return true;
}

export const requiredData = ['cmdKey'];
export const info = {
  name: 'disconnect',
  usage: '服务器内部专用。~~如果你用就说明你不是人。~~',
  description: '发送用户离开聊天室通知',
};
