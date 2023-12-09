# 小张聊天室  

## 成品  
https://chat.zhangsoft.link/  

## 简介  
这是一个黑客风格的匿名聊天室，基于开源项目 HackChat 编写。  
里面的所有功能都是以“命令”的形式存在。  

## 重要内容  
### 关于许可证和开源的问题  
我们的软件是开源的，但这并不代表您可以不遵守许可证要求而干任何事情。开源是一种精神，但许可证是底线，以开源的名义而不遵守许可证的不良开发者，是无法成大器的。这里引用ice（light）的一句话：“你应该尊重开发者！”  
### 关于静默移动用户的问题  
ZhangChat在开发之初，将原有的kick的功能从静默移动改成了断开连接，并且把moveuser的提示完善了一下，其目的是让聊天室“讲道德”。然而，近日部分用户频繁到本聊天室闹事，作为开发者的我（MrZhang365）收到了很多管理员提出的关于把以前的kick功能加回来的请求。但本人比较宽宏大量，于是就只告诉他们加强管理，而不是同意。但在他们再次闹事的今天，我觉得，我已经足够宽容，既然他们不讲道德，就休怪我无情了。  

## 安装和部署  
### 先决条件  
- Node.JS 10.15.1 或更高版本  
- NPM 6.7.0 或更高版本  

### 部署  
1.  克隆此仓库  
2.  在仓库根目录下执行 npm install  
3.  按照向导的提示配置服务器  
4.  把 `chat.db.bak` 重命名为 `chat.db`  
5.  修改 client/client.js 的join函数，把与URL相关的代码按照实际情况进行修改
6.  执行 npm start（请注意防火墙放行相关端口）  

## 开发背景  
> 这个聊天室原本是[MelonFish](https://gitee.com/XChatFish)交给[MrZhang365](https://blog.mrzhang365.cf)开发的XChat聊天室。  
> 但是由于某些原因，它被开发者魔改成了现在的小张聊天室。

XChat基于HackChat，HackChat的GitHub仓库地址为：https://github.com/hack-chat/main  
小张聊天室的仓库地址为：https://github.com/ZhangChat-Dev-Group/ZhangChat

## 贡献者  
- [HackChat](https://github.com/Hack-Chat) 编写底层代码  
- [MrZhang365](https://blog.mrzhang365.cf) 汉化前端与后端，并在前后端上编写了许多新功能  
- [paperee](https://paperee.guru) 为前端编写部分主题和功能
- [Dr0](https://github.com/redble) 为前端编写部分功能，编写油猴脚本
