import * as UAC from '../utility/UAC/_info';

export function init(core){
  if (!core.config.clients){
    core.config.clients = []
  }
}

// module main
export async function run(core, server, socket, data) {
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

  core.logger.logAction(socket,[],'addclient',data)

  return true;
}

export const info = {
  name: 'addclient',
  description: '添加一个客户端',
  usage: `
    API: { cmd: 'addclient', name: '<client name>', key: '<client key>' }
    文本：以聊天形式发送 /addclient 客户端名称 客户端key`,
  runByChat: true,
  dataRules: [
    {
      name: 'name',
      required: true,
      verify: text => typeof text === 'string' && !!text,
    },
    {
      name: 'key',
      required: true,
      verify: key => typeof key === 'string' && !!key,
    }
  ],
  level: UAC.levels.admin,
};
