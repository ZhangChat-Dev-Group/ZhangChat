# 小张聊天室  

## 简介  
这是一个黑客风格的匿名聊天室，基于开源项目 HackChat 编写。  
里面的所有功能都是以“命令”的形式存在。  

## 安装和部署  
### 先决条件  
- Node.JS 10.15.1 或更高版本  
- NPM 6.7.0 或更高版本  

### 部署  
1.  克隆此仓库  
2.  在仓库根目录下执行 npm install  
3.  按照向导的提示配置服务器  
4.  把 `chat.db.bak` 重命名为 `chat.db`  
5.  修改 client/client.js 的第 348 行代码，填写你的服务器的 WebSocket 地址
6.  执行 npm start（请注意防火墙放行相关端口）  

## 开发背景  
>这个聊天室原本是[MelonFish](https://gitee.com/XChatFish)交给[MrZhang365](https://blog.mrzhang365.cf)开发的XChat聊天室，但是由于某些原因，它被开发者魔改成了现在的小张聊天室。  

XChat基于[HackChat](https://hack.chat/)，HackChat的GitHub仓库地址为：https://github.com/hack-chat/main  
小张聊天室源代码：https://github.com/ZhangChat-Dev-Group/ZhangChat

## 贡献者  
- [HackChat](https://github.com/Hack-Chat) 编写底层代码  
- [MrZhang365](https://blog.mrzhang365.cf) 汉化前端与后端，并在前后端上编写了许多新功能  
- [纸片君ee](https://paperee.guru) 为前端编写CSS
