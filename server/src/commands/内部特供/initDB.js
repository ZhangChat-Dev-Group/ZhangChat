var SqliteDB = require('../utility/sqlite/_sqlite.js').SqliteDB;

export function init(core){
  if (typeof core.chatDB !== 'object'){
    core.chatDB = new SqliteDB('chat.db')
  }
}

export async function run(core, server, socket, payload) {
  //nothing
  return true;
}

// module meta
export const info = {
  name: 'initDB',
  description: '该命令用于在启动服务器的时候初始化数据库连接',
  usage: `
    服务器内部调用，如果你用就说明你不是人`,
};
