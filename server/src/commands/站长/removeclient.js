import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.clients){
    core.config.clients = []
  }
}

// module main
export async function run(core, server, socket, data) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }
  if (!data.key || typeof data.key !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }

  if (core.config.clients.filter((c) => c.key === data.key) === 0){
    return server.reply({
      cmd:'warn',
      text:'找不到您要删除的客户端'
    },socket)
  }

  core.config.clients = core.config.clients.filter((c) => c.key !== data.key)

  server.reply({
    cmd:'info',
    text:`您删除了一个客户端，其密钥为：${data.key}\n记得执行saveconfig来保存配置！`
  },socket)

  core.logger.logAction(socket,[],'removeclient',data)

  return true;
}

export const requiredData = ['key'];
export const info = {
  name: 'removeclient',
  description: '删除一个客户端',
  usage: `
    API: { cmd: 'removeclient', key: '<client key>' }
    文本：以聊天形式发送 /removeclient 客户端key`,
  fastcmd:[    //fastcmd支持
    {
      name:'key',
      len:1
    }
  ]
};
