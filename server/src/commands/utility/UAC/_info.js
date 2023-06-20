/**
  * User Account Control information containing level constants
  * and simple helper functions related to users
  * @property {Object} levels - Defines labels for default permission ranges
  * @author MinusGix ( https://github.com/MinusGix )
  * @version v1.0.0
  * @license WTFPL ( http://www.wtfpl.net/txt/copying/ )
  */

/**
  * Object defining labels for default permission ranges
  * @typedef {Object} levels
  * @property {number} admin Global administrator range
  * @property {number} moderator Global moderator range
  * @property {number} channelOwner Local administrator range
  * @property {number} channelModerator Local moderator range
  * @property {number} channelTrusted Local (non-public) channel trusted
  * @property {number} trustedUser Public channel trusted
  * @property {number} default Default user level
  */
export const levels = {
  admin: 9999999,
  moderator: 999999,

  channelOwner: 99999,
  channelModerator: 9999,
  channelTrusted: 8999,

  trustedUser: 500,
  default: 100,
};

/**
  * Returns true if target level is equal or greater than the global admin level
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isAdmin(level) {
  return level >= levels.admin;
}

/**
  * Returns true if target level is equal or greater than the global moderator level
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isModerator(level) {
  return level >= levels.moderator;
}

/**
  * Returns true if target level is equal or greater than the channel owner level
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isChannelOwner(level) {
  return level >= levels.channelOwner;
}

/**
  * Returns true if target level is equal or greater than the channel moderator level
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isChannelModerator(level) {
  return level >= levels.channelModerator;
}

/**
  * Returns true if target level is equal or greater than the channel trust level
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isChannelTrusted(level) {
  return level >= levels.channelTrusted;
}

/**
  * Returns true if target level is equal or greater than a trusted user
  * @public
  * @param {number} level Level to verify
  * @return {boolean}
  */
export function isTrustedUser(level) {
  return level >= levels.trustedUser;
}

/**
  * Return an object containing public information about the socket
  * @public
  * @param {WebSocket} socket Target client
  * @return {Object}
  */
export function getUserDetails(socket) {
  return {
    uType: socket.uType,
    nick: socket.nick,
    trip: socket.trip || 'null',
    hash: socket.hash,
    level: socket.level,
    userid: socket.userid,
    client: socket.client || '未知客户端',
    isBot: socket.isBot || false,
  };
}

/**
  * 名称的限制
  * @typedef {Object} nameLimit
  * @property {string} nick 昵称的要求
  * @property {string} channel 频道名称的要求
  */
export const nameLimit = {
  nick: '昵称只能由中文、字母、数字和下划线组成，且不能超过24个字符',
  channel: '频道名称只能由中文、字母、数字、下划线和连接符（`-`）组成，且不能超过30个字符',
  trip: '识别码只能由大小写英文字母、数字、`/` 和 `+` 组成，且长度必须为6位',
};

/**
  * Returns true if the nickname is valid
  * @public
  * @param {string} nick Nickname to verify
  * @return {boolean}
  */
export function verifyNickname(nick) {
  return /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,24}$/.test(nick);
}

/**
  * Returns true if the channel is valid
  * @public
  * @param {string} channel Channel to verify
  * @return {boolean}
  */
export function verifyChannel(channel) {
  return /^[\u4e00-\u9fa5_a-zA-Z0-9\-]{1,30}$/.test(channel);
}

/**
  * Returns true if the trip is valid
  * @public
  * @param {string} trip Trip to verify
  * @return {boolean}
  */
export function verifyTrip(trip) {
  return /^[a-zA-Z0-9/\+]{6}$/.test(trip);
}
