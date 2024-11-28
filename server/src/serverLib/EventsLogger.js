import dateFormat from 'dateformat';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import { resolve, join } from 'path';

/**
  * 这个是事件记录器，用于保存服务器的错误记录，还用来保存操作记录（因为保存到数据库里有点麻烦）
  * @property {String} base - Base path that all imports are required in from
  * @author MrZhang365
  * @version v1.0.0
  * @license MIT
  */
class EventsLogger {
  /**
    * Create a `EventsLogger` instance for managing application settings
    * @param {String} basePath executing directory name; __dirname
    */
  constructor(basePath = __dirname) {
    /**
      * 日志位置的完整路径
      * @type {String}
      */
    this.logsPath = resolve(basePath, 'logs');

    this.checkDir()
  }

  /**
    * 检查应该有的目录是否存在，如果没有则创建
    * @public
    * @author MrZhang365
    * @return {void}
    */
  checkDir() {
    if (!existsSync(this.logsPath)) {    //日志路径
      mkdirSync(this.logsPath);
    }

    if (!existsSync(join(this.logsPath,'error'))) {    //错误日志路径
      mkdirSync(join(this.logsPath,'error'));
    }

    if (!existsSync(join(this.logsPath,'action'))) {    //用户操作档案路径
      mkdirSync(join(this.logsPath,'action'));
    }
  }

  /**
    * 生成随机的事件ID
    * @public
    * @author MrZhang365
    * @return {String} 事件ID，格式为  'xxxx-xxxx-xxxx-xxxx'
    */
  randomID() {
    var IDs = []
    for (let i = 0; i < 4; i++){
      IDs.push(Math.random().toString(36).substr(2, 4))
    }
    return IDs.join('-');
  }

  /**
   * 将用户的信息格式化
   * @public
   * @author MrZhang365
   * @param {Object} socket 用户（socket）对象
   * @param {Array} moreInfo 自定义要额外收集的用户信息
   * @return {String} 
   */
  formatSocket(socket,moreInfo = []) {
    const socketInfo = ['address','murmur','nick','trip','hash','color','channel','uType','level' /* 默认属性 */].concat(moreInfo /* 加上自定义属性 */)    //定义要格式化的属性

    var formatStr = ''

    socketInfo.forEach((a) => {
      let data = socket[a]    //获取属性
      let str = ''    //临时储存

      if (typeof data === 'object'){    //如果类型是对象，则使用JSON格式化
        str = '\n' + JSON.stringify(data,undefined,2)    //格式化
      }else if (data === undefined /* 如果未定义 */){
        str = '<undefined>'
      }else{    //其他
        str = String(data)    //强制转换为字符串
      }

      formatStr += `${a}：${str}\n`    //添加数据
    })

    return formatStr
  }

  /**
   * 生成错误日志内容
   * @public
   * @param {String} err 错误信息
   * @param {String} type 错误类型，可以为 加载模块（这个是指发生在ImportsManager.js里面的错误）/初始化模块（包括验证模块和执行init函数）/执行命令/执行Hook/其他
   * @param {Object} socket 用户（socket）对象
   * @param {Array} moreUserInfo 自定义要额外收集的用户信息
   * @return {Object} text是错误内容，ID是事件ID
   * @author MrZhang365
   */

  makeErrorLog(err,type,socket,moreUserInfo){
    const timeString = dateFormat('yyyy-mm-dd HH:MM:ss')    //格式化时间

    const ID = this.randomID()

    //添加内容
    var text = `-----小张聊天室错误日志-----\n`
    text += `-----基本信息-----\n`
    text += `错误ID：${ID}\n时间：${timeString}\n类型：${type}\n`
    text += `-----操作员信息-----\n`
    text += `${typeof socket === 'object' ? this.formatSocket(socket,moreUserInfo) : '<无用户执行>\n'}`
    text += `-----错误信息-----\n`
    text += `${err}\n`

    return {
      text,
      ID,
    }
  }

  /**
    * 生成错误日志并保存
    * @public
    * @param {String} err 错误信息
    * @param {String} type 错误类型，可以为 加载模块（这个是指发生在ImportsManager.js里面的错误）/初始化模块（包括验证模块和执行init函数）/执行命令/执行Hook/其他
    * @param {Object} socket 用户（socket）对象
    * @param {Array} moreUserInfo 自定义要额外收集的用户信息
    * @param {String} text 备注
    * @author MrZhang365
    * @return {String} 错误ID
    */
  logError(err,type,socket,moreUserInfo) {
    const log = this.makeErrorLog(err,type,socket,moreUserInfo)    //生成日志内容

    const text = log.text
    const ID = log.ID

    console.error(text)    //打印
    writeFileSync(resolve(this.logsPath,'error',`${ID}.log`),text)    //写入日志

    return ID    //返回ID
  }

  /**
    * 生成操作日志内容
    * @public
    * @param {Object} socket 用户（socket）对象
    * @param {Array} moreUserInfo 自定义要额外收集的用户信息
    * @param {String} action 操作名称（命令名称）
    * @param {Object} data 用户传入的数据
    * @param {String} text 备注
    * @return {String} 日志内容
    * @author MrZhang365
    */

  makeActionLog(socket,moreUserInfo,action,data,text){
    const timeString = dateFormat('yyyy-mm-dd HH:MM:ss')    //格式化时间

    //添加内容
    var content = `-----小张聊天室操作档案-----\n`
    content += `-----基本信息-----\n`
    content += `时间：${timeString}\n操作：${action}\n`
    content += `-----传入数据-----\n`
    content += JSON.stringify(data,undefined,2) + '\n'
    content += `-----操作员信息-----\n`
    content += `${this.formatSocket(socket,moreUserInfo)}`
    content += `-----备注-----\n`
    content += `${text}\n`

    return content
  }

  /**
   * 这个用来把用户的某个操作保存为档案
   * @param {Object} socket 用户
   * @param {Array} moreUserInfo 自定义要额外收集的用户信息
   * @param {String} action 操作名称（命令名称）
   * @param {Object} data 用户传入的数据
   * @param {String} text 备注
   */

  logAction(socket,moreUserInfo,action,data,text = '') {
    const fileName = dateFormat('yyyy-mm-dd_HH-MM-ss') + `_${action}.log`    //文件名称

    const content = this.makeActionLog(socket,moreUserInfo,action,data,text)    //生成日志内容

    writeFileSync(resolve(this.logsPath,'action',fileName),content)    //写入日志
  }
}

export default EventsLogger;
