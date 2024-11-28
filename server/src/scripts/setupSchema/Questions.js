/**
  * This object contains Prompt ( https://www.npmjs.com/package/prompt ) style
  * questions that the SetupWizard will require an answer to. Questions are asked
  * in the order they are specified here.
  *
  * The resulting config.json file will be used by the server, accessed by the
  * name specified. IE, a valid use is; config.adminName
  *
  */

const Questions = {
  properties: {
    tripSalt: {
      description: '盐值（留空则使用默认值或随机生成）',
      type: 'string',
      hidden: true,
      replace: '*',
      before: (value) => {
        salt = value;
        return value;
      },
    },

    trip: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: '您的密码',
      message: '你必须输入一个密码',
      before: (value) => {
        const crypto = require('crypto');
        const sha = crypto.createHash('sha256');
        sha.update(value + salt);
        return sha.digest('base64').substr(0, 6);
      },
    },

    websocketPort: {
      type: 'integer',
      message: '端口号必须是一个整数',
      description: 'WebSocket端口号',
      default: '6060',
    },

    email: {
      type: 'string',
      message: '请输入您的电子邮箱地址 因为 MrZhang365 不想管你的聊天室',
      description: '电子邮箱',
      default: '(quq 站长懒得写电子邮箱)',
    }
  },
};

module.exports = Questions;
