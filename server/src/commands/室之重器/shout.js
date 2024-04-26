import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
  if (core.shieldCheck(core, data.text)) return server.replyWarn(`>宫中府中，俱为一体，陟罚臧否，不宜异同。若有作奸犯科及为忠善者，宜付有司论其刑赏，以昭陛下平明之理，不宜偏私，使内外异法也。\n>——《出师表》\n\n不要发布包含屏蔽词的全站通知哦`, socket)
  server.broadcast({
    cmd: 'info',
    text: `来自 [\`${socket.trip}\`] \`${socket.nick}\` 的全站通知：\n${data.text}`,
  }, {});

  core.logger.logAction(socket,[],'shout',data)

  return true;
}

export const info = {
  name: 'shout',
  description: '发布一条全站通知，所有用户都能看到',
  usage: `
    API: { cmd: 'shout', text: '<shout text>' }
    文本：以聊天形式发送 /shout 信息`,
  dataRules:[
    {
      name:'text',
      verify: text => typeof text === 'string' && !!text,
      all: true,
      required: true,
    }
  ],
  runByChat: true,
  level: UAC.levels.moderator
};
