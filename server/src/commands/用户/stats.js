/*
  Description: Outputs more info than the legacy stats command
*/

// module support functions
const { stripIndents } = require('common-tags');

const formatTime = (time) => {
  let seconds = time[0] + time[1] / 1e9;

  let minutes = Math.floor(seconds / 60);
  seconds %= 60;

  let hours = Math.floor(minutes / 60);
  minutes %= 60;

  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days.toFixed(0)}天 ${hours.toFixed(0)}小时 ${minutes.toFixed(0)}分钟 ${seconds.toFixed(0)}秒`;
};

// module main
export async function run(core, server, socket) {
  // gather connection and channel count
  let ips = {};
  let channels = {};
  // for (const client of server.clients) {
  server.clients.forEach((client) => {
    if (client.channel) {
      channels[client.channel] = true;
      ips[client.address] = true;
    }
  });

  const uniqueClientCount = Object.keys(ips).length;
  const uniqueChannels = Object.keys(channels).length;

  ips = null;
  channels = null;

  // dispatch info
  server.reply({
    cmd: 'info',
    text: stripIndents`# 小张聊天室统计信息
                       -----
                       实时统计：
                       在线用户数量：${uniqueClientCount}
                       活跃聊天室数量：${uniqueChannels}
                       -----
                       以下是从本次服务器启动时的统计信息：
                       用户加入次数：${(core.stats.get('users-joined') || 0)}
                       邀请信息发送次数：${(core.stats.get('invites-sent') || 0)}
                       信息发送次数：${(core.stats.get('messages-sent') || 0)}
                       封禁用户数量：${(core.stats.get('users-banned') || 0)}
                       踢出用户数量：${(core.stats.get('users-kicked') || 0)}
                       请求服务器状态次数：${(core.stats.get('stats-requested') || 0)}
                       服务器稳定运行时间：${formatTime(process.hrtime(core.stats.get('start-time')))}
                       ---
                       我们以匠心，铸造优秀的匿名聊天室；以标杆，赢得广大用户！
                       准备充足，才能面对风雨；制定计划，才能稳步向前；组中有人才，才能走向明天！
                       我们拥有经验丰富的前后端程序员，拥有能力强大的CSS设计师，共同打造优秀的匿名聊天室！
                       最后，一首《风雨彩虹铿锵玫瑰》送给所有走过那时候的同志们！点击[此处](https://music.163.com/#/song?id=293769)播放。
                       ###### 小张聊天室开发组 2023-01-28`,
  }, socket);

  // stats are fun
  core.stats.increment('stats-requested');
}

export const info = {
  name: 'stats',
  description: '查看服务器详细信息',
  usage: `
    API: { cmd: 'stats' }
    文本：以聊天形式发送 /stats`,
  fastcmd:[]
};
