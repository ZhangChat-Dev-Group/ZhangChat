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
      description: '盐值（留空则使用默认）',
      type: 'string',
      hidden: true,
      replace: '*',
      before: (value) => {
        salt = value;
        return value;
      },
    },

    adminPassword: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: '站长密码',
      message: '你必须输入一个密码',
    },

    websocketPort: {
      type: 'integer',
      message: '端口号必须是一个整数',
      description: 'WebSocket端口号',
      default: '6060',
    },
  },
};

module.exports = Questions;
