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
  if (!data.name || typeof data.name !== 'string' || !data.key || typeof data.key !== 'string'){
    return server.reply({
      cmd:'warn',
      text:'数据无效！'
    },socket)
  }

  if (core.config.clients.filter((c) => c.key.toLowerCase() === data.key.toLowerCase()).length || core.config.clients.filter((c) => c.name.toLowerCase() === data.name.toLowerCase()).length){
    return server.reply({
      cmd:'warn',
      text:'您要添加的客户端已经存在了'
    },socket)
  }

  core.config.clients.push({
    name:data.name,
    key:data.key
  })

  server.reply({
    cmd:'info',
    text:`您添加了一个客户端，详细信息如下：\n名称：${data.name}\n密钥：${data.key}\n记得执行saveconfig来保存配置！`
  },socket)

  return true;
}

export const requiredData = ['name','key'];
export const info = {
  name: 'addclient',
  description: '添加一个客户端',
  usage: `
    API: { cmd: 'addclient', name: '<client name>', key: '<client key>' }
    文本：以聊天形式发送 /addclient 客户端名称 客户端key`,
  fastcmd:[    //fastcmd支持
    {
      name:'name',
      len:1
    },
    {
      name:'key',
      len:1
    }
  ]
};
