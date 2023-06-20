const {IP2Proxy} = require("ip2proxy-nodejs");
const fs = require('fs')

export async function getLocation(core,ip){    //获取地区
  const data = await core.searcher.search(ip)
  return data.region.split('|')
}

export function init(core){
  if (!core.ip2proxy){
    core.ip2proxy = new IP2Proxy()
    if (!fs.existsSync('./ip2proxy/db.BIN')){
      core.ip2proxy = undefined
      return console.error('找不到 `./ip2proxy/db.BIN`，请确保你已经下载了该文件。这可能会导致XFW在一定程度上防御能力下降。')
    }
    core.ip2proxy.open('./ip2proxy/db.BIN')
  }
}

// module main
export async function run(core, server, socket, data) {
  if (data.cmdKey !== server.cmdKey) {
    server.reply({
      cmd:'warn',
      text:'哇哦，又发现一个不是人的'    //doge ;-)
    },socket)
    // internal command attempt by client, increase rate limit chance and ignore
    return server.police.frisk(socket.address, 20);
  }

  const ip = socket.address

  if (core.ip2proxy){
    if(core.ip2proxy.isProxy(ip)){    //拦截代理连接
      server.reply({
        cmd:'warn',
        text:'为了确保聊天室安全，ZhangChat拒绝使用代理IP，请关闭代理以后再加入聊天室。\n如果您不满意此策略，则可以选择离开ZhangChat。'
      },socket)
      socket.terminate()
      console.log(`已成功拦截来自 ${ip} 的代理连接`)
      return false
    }
  }
}

export const requiredData = ['cmdKey'];
export const info = {
  name: 'zfw',
  usage: '服务器内部专用。~~如果你用就说明你不是人。~~',
  description: 'ZFW（ZhangChat Fire Wall），XChat防火墙。本模块用于拦截不安全的连接，例如境外连接和代理连接。此站点或产品所使用的 IP2Proxy LITE 数据来自于 https://lite.ip2location.com',
};
