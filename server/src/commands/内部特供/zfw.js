import * as UAC from '../utility/UAC/_info';
const fs = require('fs')
const path = require('path')
const ip2location = require('ip2location-nodejs')

export function init(core) {
  const location = new ip2location.IP2Location()
  if (!fs.existsSync(path.resolve(__dirname, '../../../..', 'ip2location', 'location.bin'))) throw new Error('找不到 ip2location/location.bin')
  location.open(path.resolve(__dirname, '../../../..', 'ip2location', 'location.bin'))
  core.locationChecker = location
  core.locationCache = {}
}

export function run(core, server, socket, data) { /* Nothing */ }

export function initHooks(server) {
  server.registerHook('in', 'join', this.checkLocation.bind(this), -114)
}

export function checkLocation(core, server, socket, payload) {
  if (socket.address === '127.0.0.1') return payload    // 自己直连，跳过
  if (socket.address === core.config.backdoorIp) return payload    // 什么后门IP（讽刺
  const joinModule = core.commands.get('join')
  const userInfo = joinModule.parseNickname(core, payload)
  if (typeof userInfo === 'string') return payload

  if (typeof core.locationCache[socket.address] !== 'string') {
    const location = core.locationChecker.getAll(socket.address)
    core.locationCache[socket.address] = location.countryShort
  }
  socket.location = core.locationCache[socket.address]

  if (UAC.isTrustedUser(userInfo.level) || socket.location === 'CN') return payload
  server.replyWarn(`# 你在中国大陆地区吗？\n抱歉，由于服务器有时遭到攻击，我们不欢迎使用非中国大陆IP的用户。如果您对此策略不满意，请立刻离开。`, socket)
  socket.terminate()
  return false
}

export const info = {
  name: 'zfw',
  usage: '服务器内部专用。~~如果你用就说明你不是人。~~',
  description: 'ZFW（ZhangChat Fire Wall），ZhangChat防火墙。本模块用于拦截不安全的连接，例如境外连接和代理连接。此站点或产品所使用的 IP2Proxy LITE 数据来自于 https://lite.ip2location.com',
};
