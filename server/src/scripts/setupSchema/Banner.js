/**
  * This script will be run before the package starts asking for the config data,
  * used to output a simple guide for the coming questions, or to spam some sexy
  * ascii art at the user.
  *
  */

import { stripIndents } from 'common-tags';
import chalk from 'chalk';

// gotta have that sexy console
console.log(stripIndents`
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}
  ${chalk.gray('--------------(') + chalk.white(' 小张聊天室设置向导 v2.0 ') + chalk.gray(')--------------')}
  ${chalk.magenta('°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø')}

  ${chalk.white('注意：')} ${chalk.green('npm/yarn run config')} 将会重新运行本向导

  现在将要求您提供以下信息：（这不是经典salt吗）
  -  ${chalk.magenta('    盐值')}, 生成识别码时用到的盐值
  -  ${chalk.magenta('您的密码')}, 您的密码，系统会自动将您添加为管理员和可提权用户，后期若想执行站长专用命令，则需要先执行sudo命令以提权
  -  ${chalk.magenta('  端口号')}, WebSocket端口号
  -  ${chalk.magenta('  电子邮箱')}, 您的电子邮箱 命令执行出错时会向用户展示
  \u200b
`);
