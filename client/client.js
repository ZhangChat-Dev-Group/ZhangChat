/*
	小张聊天室开发组：
	MrZhang365：领导者，主要编写JS、NodeJS。
	paperee：成员，主要编写HTML、CSS、JS。

	另外，感谢提供参考代码的4n0n4me和Dr0。
*/

// 在/上选择chatinput
document.addEventListener("keydown", e => {
	if (e.key === '/' && document.getElementById("chatinput") != document.activeElement) {
		e.preventDefault();
		document.getElementById("chatinput").focus();
	}
});

// 初始化Markdown
var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer: true,
	quotes: `""''`,
	doHighlight: true,
	langPrefix: 'hljs language-',
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) {
			return '';
		}

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {
				// nothing
			}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) {
			// nothing
		}

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

// 允许渲染的图片域名
var allowImages = true;
var imgHostWhitelist = [ // 这些是由小张添加的
	'i.loli.net', 's2.loli.net', // SM-MS图床
	's1.ax1x.com', 's2.ax1x.com', 'z3.ax1x.com', 's4.ax1x.com', // 路过图床
	'i.postimg.cc',	'gimg2.baidu.com', // Postimages图床 百度
	'files.catbox.moe', 'img.thz.cool', 'img.liyuv.top', 'share.lyka.pro', // 这些是ee加的（被打
	document.domain,    // 允许我自己
	'img.zhangsoft.cf',    // 小张图床
	'bed.paperee.repl.co', 'filebed.paperee.guru',    // 纸片君ee的纸床
	'imagebed.s3.bitiful.net',    //Dr0让加的
	'captcha.dr0.lol',        // Dr0's Captcha
	'img1.imgtp.com', 'imgtp.com',    // imgtp
	'api.helloos.eu.org',    // HelloOsMe's API
	'cdn.luogu.com.cn',    // luogu
];

function getDomain(link) {
	var a = document.createElement('a');
	a.href = link;
	return a.hostname;
}

function isWhiteListed(link) {
	return imgHostWhitelist.indexOf(getDomain(link)) !== -1;
}

md.renderer.rules.image = function (tokens, idx, options) {
	var src = Remarkable.utils.escapeHtml(tokens[idx].src);

	if (isWhiteListed(src) && allowImages) {
		var imgSrc = ` src="${Remarkable.utils.escapeHtml(tokens[idx].src)}"`;
		var title = tokens[idx].title ? (` title="${Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title))}"`) : '';
		var alt = ` alt="${(tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '')}"`;
		var suffix = options.xhtmlOut ? ' /' : '';
		var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
		return `<a href="${src}" target="_blank" rel="noreferrer"><img${scrollOnload}${imgSrc}${alt}${title}${suffix} class="text"></a>`;
	}

	return `<a href="${src}" target="_blank" rel="noreferrer">${Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src))}</a>`;
};

md.renderer.rules.link_open = function (tokens, idx, options) {
	var title = tokens[idx].title ? (` title="${Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title))}"`) : '';
	var target = options.linkTarget ? (` target="${options.linkTarget}"`) : '';
	return `<a rel="noreferrer" onclick="return verifyLink(this)" href="${Remarkable.utils.escapeHtml(tokens[idx].href)}"${title}${target}>`;
};

md.renderer.rules.text = function(tokens, idx) {
	tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

	if (tokens[idx].content.indexOf('?') !== -1) {
		tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
			var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
			var whiteSpace = '';

			if (match[0] !== '?') {
				whiteSpace = match[0];
			}

			return `${whiteSpace}<a href="${channelLink}" target="_blank">${channelLink}</a>`;
		});
	}

	return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
	var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));

	if (linkHref !== link.innerHTML) {
		return confirm(`等一下！你即将前往：${linkHref}`);
	}

	return true;
}

var verifyNickname = function (nick) {
	return /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,24}$/.test(nick);
}

var frontpage = [
	'# 小张聊天室',
	'---',
	'欢迎来到小张聊天室，这是一个黑客风格的聊天室。',
	'注意：在这里，我们把"房间（chatroom）"称作"频道（channel）"。',
	'公共频道（在线用户多）：[?chat](/?chat)',
	`您也可以自己创建频道，只需要按照这个格式打开网址即可：${document.URL}?房间名称`,
	`这个是为您准备的频道（只有您自己）： ?${Math.random().toString(36).substr(2, 8)}`,
	'---',
	'本聊天室依照中华人民共和国相关法律，保存并公布您的聊天记录。',
	'无论您是否在中国境内，都请自觉遵守中华人民共和国相关法律和聊天室内相关规定。',
	'您如果对本聊天室不满意或认为受到不公平对待，则可以选择向管埋员申诉或选择离开。',
	'---',
	'您知道吗？这个聊天室原本是[MelonFish](https://gitee.com/XChatFish)交给[MrZhang365](https://blog.mrzhang365.cf)开发的XChat聊天室。',
	'但是由于某些原因，它被开发者魔改成了现在的小张聊天室。',
	'XChat基于HackChat，HackChat的GitHub仓库地址为：https://github.com/hack-chat/main',
	'小张聊天室的仓库地址为：https://github.com/ZhangChat-Dev-Group/ZhangChat',
	'在此对HackChat的开发者深表感谢。',
	'---',
	'本聊天室开发者：',
	'@MrZhang365 - [小张的博客](https://blog.mrzhang365.cf/) && [小张软件](https://www.zhangsoft.cf/)',
	'@paperee - [纸片君ee的个人主页](https://paperee.guru/)',
	'---',
	'更多代码贡献者：',
	'@[4n0n4me](http://github.com/xjzh123/) - 编写了[hackchat\\+\\+客户端](https://hc.thz.cool/)',
	'@[Dr0](https://greasyfork.org/zh-CN/users/1017687-greendebug) - 编写了[ZhangChat增强脚本](https://greasyfork.org/zh-CN/scripts/458989-zhchat%E5%A2%9E%E5%BC%BA%E8%84%9A%E6%9C%AC)',
	'---',
	'友情链接：',
	'[HackChat聊天室](https://hack.chat/)',
	'[hackchat\\+\\+客户端](https://hc.thz.cool/)',
	'[TanChat聊天室](https://tanchat.fun/)',
	'[ZhangChat增强脚本](https://greasyfork.org/zh-CN/scripts/458989-zhchat%E5%A2%9E%E5%BC%BA%E8%84%9A%E6%9C%AC)',
	'---',
	'2023.02.23~2023.03.26 [小张聊天室开发组](https://github.com/ZhangChat-Dev-Group) 致',
	'**本站由[雨云](https://www.rainyun.com/MjcxMTc=_)提供计算服务**',
].join("\n");

function $(query) {
	return document.querySelector(query);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key]
	} catch (e) {
		// nothing
	}
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val
	} catch (e) {
		// nothing
	}
}

var ws;
var myMurmur = '';
var myNick = localStorageGet('my-nick') || '';
var myChannel = decodeURI(window.location.search.replace(/^\?/, ''));
var lastSent = [""];
var lastSentPos = 0;
var modCmd = null

/** 通知和本地存储 **/
var notifySwitch = document.getElementById("notify-switch")
var notifySetting = localStorageGet("notify-api")
var notifyPermissionExplained = 0; // 1 = 显示已授予的消息，-1 = 显示拒绝的消息

// 初始通知请求权限
function RequestNotifyPermission() {
	try {
		var notifyPromise = Notification.requestPermission();

		if (notifyPromise) {
			notifyPromise.then(function (result) {
				console.log(`ZhangChat桌面通知权限：${result}`);

				if (result === "granted") {
					if (notifyPermissionExplained === 0) {
						pushMessage({cmd: "chat", nick: "*", text: "已获得桌面通知权限", time: null});
						notifyPermissionExplained = 1;
					}
					return false;
				} else {
					if (notifyPermissionExplained === 0) {
						pushMessage({cmd: "chat", nick: "!", text: "桌面通知权限被拒绝，当有人@你时，你将不会收到桌面通知", time: null});
						notifyPermissionExplained = -1;
					}
					return true;
				}
			});
		}
	} catch (error) {
		pushMessage({cmd: "chat", nick: "!", text: "无法创建桌面通知", time: null});
		console.error("无法创建桌面通知，该浏览器可能不支持桌面通知，错误信息：\n")
		console.error(error)
		return false;
	}
}

// 更新本地储存的复选框值
notifySwitch.addEventListener('change', (event) => {
	if (event.target.checked) {
		RequestNotifyPermission();
	}

	localStorageSet("notify-api", notifySwitch.checked)
})

// 检查是否设置了本地存储，默认为OFF
if (notifySetting === null) {
	localStorageSet("notify-api", "false")
	notifySwitch.checked = false
}

// 配置通知开关复选框元素
if (notifySetting === "true" || notifySetting === true) {
	notifySwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	notifySwitch.checked = false
}

/** 提示音和本地存储 **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")

// 更新本地储存的复选框值
soundSwitch.addEventListener('change', (event) => {
	localStorageSet("notify-sound", soundSwitch.checked)
})

// 检查是否设置了本地存储，默认为OFF
if (notifySetting === null) {
	localStorageSet("notify-sound", "false")
	soundSwitch.checked = false
}

// 配置声音开关复选框元素
if (notifySetting === "true" || notifySetting === true) {
	soundSwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	soundSwitch.checked = false
}

// 在检查是否已授予权限后创建新通知
function spawnNotification(title, body) {
	if (!("Notification" in window)) {
		console.error("浏览器不支持桌面通知");
	} else if (Notification.permission === "granted" || (Notification.permission !== "denied" && RequestNotifyPermission())) { // 检查是否已授予通知权限
		var options = {body: body, /* icon: "/favicon-96x96.png" */ /* 图标没做好，也不能用XC的图标 */};
		var n = new Notification(title, options);
	}
}

function notify(args) {
	// 生成通知（如果已启用）
	if (notifySwitch.checked) {
		spawnNotification(`?${myChannel} - ${args.nick}`, args.text)
	}

	// 播放声音（如果已启用）
	if (soundSwitch.checked) {
		var soundPromise = document.getElementById("notify-sound").play();

		if (soundPromise) {
			soundPromise.catch(function (error) {
				console.error(`播放提示音错误：${error}`);
			});
		}
	}
}

function getNick() {
	return myNick.split('#')[0]
}
/*
function getMurmur() {
	return Fingerprint2.getPromise({}).then(components => {
		// 参数
		const values = components.map(function (component) {
			return component.value
		});
		// 指纹
		myMurmur = Fingerprint2.x64hash128(values[19].join(''), 31);
		// console.log(murmur)
	})
}
*/
/*
function tokenCallback(token) {
	// debugger
	setTimeout(() => {
		document.getElementById('captcha').innerHTML = '' // 清除验证码，防止出现BUG
	}, 1800)

	join(myChannel, token)
}
*/

function join(channel) {
/*
	如果在服务器配置期间更改了端口，请更改wsPath端口（例如：':8080'）
	如果是反向代理，请将wsPath更改为新ws地址（例如：'/chat-ws'）
*/
	var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
	var wsPath = ':6060';

	// 这个是判断域名的，如果域名是 chat.zhangsoft.cf（小张聊天室），则使用直接其ws地址，如果不是 chat.zhangsoft.cf ，则说明是自己搭建的。
	const url = ( document.domain === 'chat.zhangsoft.cf' || document.domain === 'chat.zhangsoft.eu.org' ) ? protocol + '//chat.zhangsoft.cf/ws' : `${protocol}//${document.domain}${wsPath}`
	//const url = 'ws://localhost:6060' //本地测试

	//ws = new WebSocket('wss://chat.zhangsoft.cf/ws');
	ws = new WebSocket(url);
	
	var wasConnected = false;

	ws.onopen = async function () {
		var shouldConnect = true;

		if (!wasConnected) {
			if (location.hash) {
				myNick = location.hash.substr(1);
			} else {
				var newNick = localStorageGet('my-nick') || ''; if 
				(localStorageGet('auto-login') != 'true' || newNick 
				== undefined) newNick = prompt('请输入昵称：', 
				myNick);

				if (newNick !== null) {
					myNick = newNick;
				} else { // 用户以某种方式取消了提示
					shouldConnect = false;
				}
			}
		}

		if (myNick && shouldConnect) {
			localStorageSet('my-nick', myNick);
			//await getMurmur();
			// console.log(`murmur is: ${myMurmur}`)
			//var sendMurmur = encode(myMurmur)
			send({ cmd: 'join', channel: channel, nick: myNick, client: 'ZhangChatClient', /* murmur: sendMurmur.toString() */ });
		}

		wasConnected = true;
	}

	ws.onclose = function () {
		if (wasConnected) {
			pushMessage({nick: '!', text: "哎呀，掉线了，正在重新连接..."});
		}

		window.setTimeout(function () {
			join(channel);
		}, 1800);
		
	}

	ws.onmessage = function (message) {
		var args = JSON.parse(message.data);
		var cmd = args.cmd;
		var command = COMMANDS[cmd];
		// console.log(args)
		command.call(null, args);
	}
}

var COMMANDS = {
	chat: function (args) {
		if (ignoredUsers.indexOf(args.nick) >= 0) {
			return;
		}
		pushMessage(args);
	},

	info: function (args) {
		args.nick = '*';
		pushMessage(args);
	},

	warn: function (args) {
		args.nick = '!';
		pushMessage(args);
	},

	onlineSet: function (args) {
		var users = args.users;
		usersClear();

		users.forEach(function (user) {
			userAdd(user.nick, user.trip);
		});

		pushMessage({nick: '*', text: `在线用户：${args.nicks.join(", ")}`})

		if (localStorageGet('fun-system') != 'false'){
			pushWelcomeButton("打个招呼")
		}
	},

	onlineAdd: function (args) {
		var nick = args.nick;
		userAdd(nick,args.trip);

		if ($('#joined-left').checked) {
			if (localStorageGet('fun-system') == 'false') {
				var joinNotice = `${nick} 加入了聊天室`
			} else {
				const test = ['活蹦乱跳','可爱','美丽','快乐','活泼','美味']
				const test2 = ["误入","闯入","跳进","飞进","滚进","掉进"]
				var joinNotice = `${test[Math.round(Math.random()*(test.length - 1))]}的 ${nick} ${test2[Math.round(Math.random()*(test2.length - 1))]}了聊天室`
			}

			joinNotice += args.client ? `\nTA正在使用 ${args.client}` : ''
			joinNotice += args.auth ? `\n系统认证：${args.auth}` : ''

			pushMessage({nick: '→', text: joinNotice, trip: args.trip || ''}, 'info'); // 仿Discord

			if (localStorageGet('fun-system') != 'false') {
				pushWelcomeButton("欢迎一下")
			}
		}
	},

	onlineRemove: function (args) {
		var nick = args.nick;
		userRemove(nick);

		if ($('#joined-left').checked) {
			if (localStorageGet('fun-system') == 'false') {
				var leaveNotice = `${nick} 离开了聊天室`
			} else {
				const test = ["跳出","飞出","滚出","掉出","扭出","瞬移出"]
				var leaveNotice = `${nick} ${test[Math.round(Math.random()*(test.length - 1))]}了聊天室`
			}

			pushMessage({nick: '←', text: leaveNotice}, 'info'); //仿Discord
		}
	},

	'set-video': function (args) {
		pushMessage({nick: '*', text: `<video width="100%" controls><source src="${encodeURI(args.url)}"></video>`}, "info", true)
	},

	history: function (args) {
		var i = 0;

		for (i in args.history) {
			pushMessage(args.history[i], 'history');
		}

		pushMessage({nick: '*', text: '—— 以上是历史记录 ——'})
	},

	changeNick: function (args) {
		userChange(args.nick, args.text);
		pushMessage({nick: '*', text: `${args.nick} 更名为 ${args.text}`})
	},

	html: args => {
		if (localStorageGet('allow-html') !== 'true') {
			return pushMessage({
				nick: '*',
				text: `您收到了一条来自 ${args.nick} 的 HTML信息，但是由于您不允许显示HTML信息，因此我们屏蔽了它`,
			})
		}

		pushMessage(args, undefined, true)
	}
}

function buildReplyText(user, text) {
	var replyText = `>`
	var tooLong = true
	const textList = text.split('\n')

	if (user.trip) {
		replyText += `[${user.trip}] ${user.nick}：\n`
	} else {
		replyText += `${user.nick}：\n`
	}

	for (var i = 0; i < 8; i+=1) {
		if (typeof textList[i] === 'undefined'){
			tooLong = false
			break
		}

		replyText += `>${textList[i]}\n`
	}

	if (i < textList.length && tooLong) {
		replyText += '>……\n\n'
	} else {
		replyText += '\n'
	}

	if (user.nick !== getNick()) {
		replyText += `@${user.nick} `
	}

	return replyText
}

function pushMessage(args, cls = undefined, html = false) { // cls指定messageEl添加什么classList
	// 消息容器
	var messageEl = document.createElement('div');
	
	if (args.messageID){
		messageEl.id = args.messageID
	}

	if (
		typeof (myNick) === 'string' && (
			args.text.match(new RegExp(`@${getNick()}\\b`, "gi")) ||
			((args.type === "whisper" || args.type === "invite") && args.from)
		)
	) {
		notify(args);
	}

	messageEl.classList.add('message');

	if (typeof cls === 'string') {
		messageEl.classList.add(cls);
	} else if (cls !== null) {
		if (verifyNickname(getNick()) && args.nick == getNick()) {
			messageEl.classList.add('me');
		} else if (args.nick == '!') {
			messageEl.classList.add('warn');
		} else if (args.nick == '*') {
			messageEl.classList.add('info');
		}
	}
	
	// 昵称
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);

	if (args.trip) {
		var tripEl = document.createElement('span');
		var uwuTemp

		// @MrZhang365 这段真不能删 否则没法替换- quq
		if (!cls) {
			var prefixs = []
			var prefixs2 = []

			if (args.isBot) { // 机器人标识
				prefixs.push(String.fromCodePoint(10022)) // ee：我这边大部分emoji都无法显示（悲
				prefixs2.push("Bot")
			}

			if (args.admin) { // 站长标识
				prefixs.push(String.fromCodePoint(9770))
				prefixs2.push("Admin")
			} else if (args.mod) { // 管理员标识
				prefixs.push(String.fromCodePoint(9733))
				prefixs2.push("Mod")
			} else if (args.channelOwner) { // 房主标识
				prefixs.push(String.fromCodePoint(10033))
				prefixs2.push("RoomOP") // 再缩缩（
			} else if (args.trusted) { // 信任用户标识
				prefixs.push(String.fromCodePoint(9830))
			}

			var strPrefixs = prefixs2.join('&');

			if (strPrefixs || args.trusted) { // 虽然直接插入HTML，但这是在本地运行的JS代码，根本没法做到XSS（
				strPrefixs = `√${strPrefixs}`;
				uwuTemp = `<span class="none onlyemoji">${prefixs.join(" ")}</span><span class="none onlytext">${strPrefixs}</span>`
			}
		}

		tripEl.innerHTML = `${uwuTemp || ''}<span class="uwuTrip">${args.trip}</span>`;
		tripEl.classList.add('trip');

		if (!cls) {
			let temp = localStorageGet('prefix');
			display('none', 'none', tripEl);

			if (temp && temp != 'none') {
				display(temp, 'inline', tripEl);
			}
		}

		nickSpanEl.appendChild(tripEl);
	}

	if (args.head) {
		// 头像
		var imgEl = document.createElement('img');
		imgEl.src = args.head;
		imgEl.className = 'uwuTest';

		if (localStorageGet('show-head') == 'false') {
			imgEl.style.display = "none";
		}

		nickSpanEl.appendChild(imgEl);
	}

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();

		if (args.color && /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(args.color)) {
			nickLinkEl.setAttribute('style', `color:#${args.color}!important`);
			nickLinkEl.title += ` #${args.color}`;
		}

		nickLinkEl.onclick = function() {
			insertAtCursor(`@${args.nick} `);
			$('#chatinput').focus();
		}

		nickLinkEl.oncontextmenu = function(e){
			e.preventDefault();
			var replyText = buildReplyText({nick:args.nick, trip: args.trip || ''}, args.text)
			replyText += $('#chatinput').value
			$('#chatinput').value = ''
			insertAtCursor(replyText)
			$('#chatinput').focus();
		}

		nickSpanEl.appendChild(nickLinkEl);
	}

	var textEl = document.createElement('p');

	// 文本
	if (!html) {
		textEl.innerHTML = md.render(args.text);
	} else {
		textEl = document.createElement('div');
		textEl.innerHTML = args.text;
	}

	textEl.classList.add('text');

	messageEl.appendChild(textEl)
	
	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').appendChild(messageEl);
	if (atBottom && myChannel) {
		window.scrollTo(0, document.body.scrollHeight);
	}

	unread += 1;
	updateTitle();
}

function pushWelcomeButton(text) {
	// 消息容器
	var messageEl = document.createElement('div');
	messageEl.classList.add('message');
	messageEl.classList.add('info');
	
	// 昵称
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);

	var nickLinkEl = document.createElement('a');
	nickLinkEl.textContent = '*';

	nickLinkEl.onclick = function () {
		insertAtCursor("@* ");
		$('#chatinput').focus();
	}

	var date = new Date(Date.now());
	nickLinkEl.title = date.toLocaleString();
	nickSpanEl.appendChild(nickLinkEl);

	// 文本
	var textEl = document.createElement('div');
	textEl.classList.add('text');
	
	// 按钮
	var buttonEl = document.createElement('a')
	buttonEl.textContent = text

	buttonEl.onclick = () => {
		var hiyo = 'hi y'
		var max = Math.round(Math.random()*20)

		for (var i = 0; i < max; i++) { // @ee 你想累死我啊
			hiyo += 'o' // ee：（被打
		}

		const welcomes = [hiyo, 'awa!', 'uwu!', '来了老弟~']
		var txt = welcomes[Math.round(Math.random()*(welcomes.length - 1))]
		send({cmd: 'chat', text: txt, head: localStorageGet('head') || ''})
	}

	textEl.appendChild(buttonEl)
	messageEl.appendChild(textEl);
	$('#messages').appendChild(messageEl);
	autoBottom()
}

function autoBottom() {
	// 滚动到底部
	if (isAtBottom() && !!myChannel) {
		window.scrollTo(0, document.body.scrollHeight);
	}

	unread += 1;
	updateTitle();
}

function insertAtCursor(text) {
	var input = $('#chatinput');
	var start = input.selectionStart || 0;
	var before = input.value.substr(0, start);
	var after = input.value.substr(start);

	before += text;
	input.value = before + after;
	input.selectionStart = input.selectionEnd = before.length;

	updateInputSize();
}

function send(data) {
	if (ws && ws.readyState == ws.OPEN) {
		if ($('#rainbow-nick').checked && data['cmd'] == 'chat') {
			ws.send(JSON.stringify({cmd: 'changecolor', color: `#${Math.floor(Math.random()*0xffffff).toString(16).padEnd(6,"0")}`}));
		};

		ws.send(JSON.stringify(data));
	}
}

var windowActive = true;
var unread = 0;

window.onfocus = function () {
	windowActive = true;
	updateTitle();
}

window.onblur = function () {
	windowActive = false;
}

window.onscroll = function () {
	if (isAtBottom()) {
		updateTitle();
	}
}

function isAtBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

var uwuTitle = "小张聊天室";
var uwuBUG = "ZhangChat"

function updateTitle() {
	if (windowActive && isAtBottom()) {
		unread = 0;
	}

	if (myChannel) {
		uwuTitle = myChannel;

		if (unread > 0) {
			uwuTitle = `（${unread}）${uwuTitle}`;
		}
	}

	document.title = `${uwuTitle} - ${uwuBUG}`;
}

document.addEventListener('visibilitychange', function() {
	if (document.visibilityState == 'hidden') {
		uwuBUG = 'ZhangBUG';
	} else {
		uwuBUG = 'ZhangChat';
	}

	document.title = `${uwuTitle} - ${uwuBUG}`;
});

$('#footer').onclick = function () {
	$('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
		e.preventDefault();

		// 发送消息
		if (!!e.target.value) {
			var text = e.target.value;
			e.target.value = '';

			send({cmd: 'chat', text: text, head: localStorageGet('head') || ''});

			lastSent[0] = text;
			lastSent.unshift("");
			lastSentPos = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 38 /* UP */) {
		// 恢复以前发送的消息
		if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
			e.preventDefault();

			if (lastSentPos == 0) {
				lastSent[0] = e.target.value;
			}

			lastSentPos += 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

			updateInputSize();
		}
	} else if (e.keyCode == 40 /* DOWN */) {
		if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
			e.preventDefault();

			lastSentPos -= 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 27 /* ESC */) {
		// 清空输入框
		e.preventDefault();
		e.target.value = '';
		lastSentPos = 0;
		lastSent[lastSentPos] = '';
		updateInputSize();
	} else if (e.keyCode == 9 /* TAB */) {
		if (e.ctrlKey) {
			return;
		}

		e.preventDefault();

		var pos = e.target.selectionStart || 0;
		var text = e.target.value;
		var index = text.lastIndexOf('@', pos);

		var autocompletedNick = false;

		if (index >= 0) {
			var stub = text.substring(index + 1, pos);

			// 搜索昵称
			var nicks = onlineUsers.filter(function (nick) {
				return nick.indexOf(stub) == 0
			});

			if (nicks.length > 0) {
				autocompletedNick = true;

				if (nicks.length == 1) {
					insertAtCursor(nicks[0].substr(stub.length) + " ");
				}
			}
		}

		// 由于没有插入昵称，因此插入一个制表符
		if (!autocompletedNick) {
			insertAtCursor('\t');
		}
	}
}

function updateInputSize() {
	var atBottom = isAtBottom();

	var input = $('#chatinput');
	input.style.height = 0;
	input.style.height = input.scrollHeight + 'px';
	document.body.style.marginBottom = $('#footer').offsetHeight + 'px';

	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}
}

$('#chatinput').oninput = function () {
	updateInputSize();
}

updateInputSize();

/* 侧边栏 */

$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
	$('#sidebar-content').classList.remove('hidden');
	$('#sidebar').classList.add('expand');
	e.stopPropagation();
}

$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
	var e = event.toElement || event.relatedTarget;

	try {
		if (e.parentNode == this || e == this) {
			return;
		}
	} catch (e) {
		return;
	}

	if (!$('#pin-sidebar').checked) {
		$('#sidebar-content').classList.add('hidden');
		$('#sidebar').classList.remove('expand');
	}
}

$('#set-video').onclick = function() {
	var newVideo = prompt('请输入视频文件地址（留空则清除公共视频）：', '')

	if (newVideo === null){
		return pushMessage({nick:'!', text:'您取消了设置视频'})
	}

	send({cmd:'set-video', url: newVideo || 'nothing'})
}

$('#get-video').onclick = function() {
	send({cmd:'get-video'})
}

$('#clear-messages').onclick = function () {
	// 清空聊天记录
	if (!confirm('是否清除本页聊天内容？')){ // 你确定吗？
		return
	}

	var messages = $('#messages');
	messages.innerHTML = '';
	pushMessage({nick:'*', text:'—— 历史记录为空 ——'})
}

$('#set-head').onclick = function () {
	var newHead = prompt('请输入头像地址（留空则使用默认值）：',localStorageGet('head') || '')
	localStorageSet('head', newHead || '')
}

// 从本地存储还原设置

$('#auto-login').checked = localStorageGet('auto-login') == 'true';

if (localStorageGet('pin-sidebar') == 'true') {
	$('#pin-sidebar').checked = true;
	$('#sidebar-content').classList.remove('hidden');
}

if (localStorageGet('fun-system') == 'false') {
	$('#fun-system').checked = false;
}

if (localStorageGet('joined-left') == 'false') {
	$('#joined-left').checked = false;

	if ($('#joined-left').checked) {
		$('#fun-system').removeAttribute('disabled')
	} else {
		$('#fun-system').setAttribute('disabled','disabled')
	}
}

if (localStorageGet('parse-latex') == 'false') {
	$('#parse-latex').checked = false;
	md.inline.ruler.disable([ 'katex' ]);
	md.block.ruler.disable([ 'katex' ]);
}

if (localStorageGet('rainbow-nick') == 'true') {
	$('#rainbow-nick').checked = true;
}

if (localStorageGet('show-head') == 'false') {
	$('#show-head').checked = false;
}

$('#pin-sidebar').onchange = function (e) {
	localStorageSet('pin-sidebar', !!e.target.checked);
}

$('#joined-left').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('joined-left', enabled);

	if (enabled) {
		$('#fun-system').removeAttribute('disabled')
	} else {
		$('#fun-system').setAttribute('disabled','disabled')
	}
}

$('#fun-system').onchange = function (e) {
	localStorageSet('fun-system', !!e.target.checked);
}

$('#parse-latex').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('parse-latex', enabled);

	if (enabled) {
		md.inline.ruler.enable([ 'katex' ]);
		md.block.ruler.enable([ 'katex' ]);
	} else {
		md.inline.ruler.disable([ 'katex' ]);
		md.block.ruler.disable([ 'katex' ]);
	}
}

if (localStorageGet('syntax-highlight') == 'false') {
	$('#syntax-highlight').checked = false;
	markdownOptions.doHighlight = false;
}

$('#syntax-highlight').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('syntax-highlight', enabled);
	markdownOptions.doHighlight = enabled;
}

if (localStorageGet('allow-imgur') == 'false') {
	$('#allow-imgur').checked = false;
	allowImages = false;
}

$('#auto-login').onchange = function (e) {
	localStorageSet('auto-login', !!e.target.checked);
}

$('#allow-imgur').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('allow-imgur', enabled);
	allowImages = enabled;
}

$('#rainbow-nick').onchange = function (e) {
	localStorageSet('rainbow-nick', !!e.target.checked);
}

$('#show-head').onchange = function (e) {
	var enabled = !!e.target.checked;
	var state = 'none'
	localStorageSet('show-head', enabled);

	if (enabled) {
		state = 'inline'
	}

	display('uwuTest', state)
}

function display(name, state = 'none', scope = document) {
	let uwuClass = scope.getElementsByClassName(name)
	
	for (var i=0; i < uwuClass.length; i++) {
		uwuClass[i].style.display = state;
	}
}

// 用户列表
var onlineUsers = [];
var ignoredUsers = [];

// 这里参考了HC++的代码 404不要打我（被打
function userAdd(nick, trip) {
	var user = document.createElement('a');
	user.textContent = nick;

	user.onclick = function (e) {
		userInvite(nick)
	}

	user.oncontextmenu = function (e) {
		e.preventDefault();
		userModAction(nick)
	}

	var userLi = document.createElement('li');
	userLi.appendChild(user);

	if (trip) {
		var userTrip = document.createElement('span')
		userTrip.innerHTML = trip
		userTrip.classList.add('trip')
		userLi.appendChild(userTrip)
	}

	$('#users').appendChild(userLi);
	onlineUsers.push(nick);
}

function userRemove(nick) {
	var users = $('#users');
	var children = users.children;

	for (var i = 0; i < children.length; i++) {
		var user = children[i];

		if (user.firstChild.textContent == nick) {
			users.removeChild(user);
		}
	}

	var index = onlineUsers.indexOf(nick);

	if (index >= 0) {
		onlineUsers.splice(index, 1);
	}
}

function userChange(nick, text) {
	var users = $('#users');
	var children = users.children;

	for (var i = 0; i < children.length; i++) {
		var user = children[i];

		if (user.firstChild.textContent == nick) {
			user.firstChild.innerText = text
			user.firstChild.onclick = function (e) {
				userInvite(text)
			}
			user.firstChild.oncontextmenu = function (e) {
				e.preventDefault();
				userModAction(text)
			}
		}
	}

	var index = onlineUsers.indexOf(nick);

	if (index >= 0) {
		onlineUsers[index] = text;
	}
}

function usersClear() {
	var users = $('#users');

	while (users.firstChild) {
		users.removeChild(users.firstChild);
	}

	onlineUsers.length = 0;
}

function userInvite(nick) {
	send({cmd: 'invite', nick: nick});
}

function userModAction(nick) {
	if (modCmd === null){	//如果未设置
		return pushMessage({
			nick: '!',
			text: '您尚未设置管理员操作'
		})
	}

	let toSend = modCmd
	toSend.nick = nick

	send(toSend);
}

function userIgnore(nick) {
	ignoredUsers.push(nick);
}

/* 配色方案切换 */

var schemes = [
	'electron',
	'eighties',
	'default',
	'tomorrow',
	'lax',
	'hacker',
];

var highlights = [
	'darcula',
	'rainbow',
	'zenburn',
	'androidstudio',
]

var uwuPrefixs = [
	'none',
	'onlytext',
	'onlyemoji',
]

var modAction = [	//管理员操作
	{
		text: '无',
		data: null,
	},
	{
		text: '踢出',	//对用户显示的文本
		data: {	//用户选择了这个操作，客户端向服务器发送数据时使用的模板，客户端会自动加上nick参数
			cmd: 'kick',
		},
	},
	{
		text: '封禁',
		data: {
			cmd: 'ban',
		},
	},
	{
		text: '禁言1分钟',
		data: {
			cmd: 'dumb',
			time: 1,
		},
	},
	{
		text: '禁言5分钟',
		data: {
			cmd: 'dumb',
			time: 5,
		}
	},
	{
		text: '禁言10分钟',
		data: {
			cmd: 'dumb',
			time: 10,
		}
	},
	{
		text: '永久禁言',
		data: {
			cmd: 'dumb',
			time: 0,
		}
	},
];

// 默认方案
var currentScheme = 'electron';
var currentHighlight = 'darcula';
var currentPrefix = 'none';

function setScheme(scheme) {
	currentScheme = scheme;
	$('#scheme-link').href = `schemes/${scheme}.css`;
	localStorageSet('scheme', scheme);
}

function setHighlight(scheme) {
	currentHighlight = scheme;
	$('#highlight-link').href = `vendor/hljs/styles/${scheme}.min.css`;
	localStorageSet('highlight', scheme);
}

function setPrefix(scheme) {
	currentPrefix = scheme;
	localStorageSet('prefix', scheme);
	display('none')

	if (scheme && scheme != 'none') {
		display(scheme, 'inline')
	}
}

// 添加主题到下拉条
schemes.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#scheme-selector').appendChild(option);
});

highlights.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#highlight-selector').appendChild(option);
});

uwuPrefixs.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#prefix-selector').appendChild(option);
});

modAction.forEach((action) => {
	var option = document.createElement('option');
	option.textContent = action.text;
	option.value = JSON.stringify(action.data);	//转换为JSON
	$('#mod-action').appendChild(option)
})

$('#scheme-selector').onchange = function (e) {
	setScheme(e.target.value);
}

$('#highlight-selector').onchange = function (e) {
	setHighlight(e.target.value);
}

$('#prefix-selector').onchange = function (e) {
	setPrefix(e.target.value);
}

$('#mod-action').onchange = (e) => {
	modCmd = JSON.parse(e.target.value)	//解析为obj
}

// 从本地存储加载侧边栏配置（如果可用）
if (localStorageGet('scheme')) {
	setScheme(localStorageGet('scheme'));
}

if (localStorageGet('highlight')) {
	setHighlight(localStorageGet('highlight'));
}

if (localStorageGet('prefix')) {
	setPrefix(localStorageGet('prefix'));
}

$('#scheme-selector').value = currentScheme;
$('#highlight-selector').value = currentHighlight;
$('#prefix-selector').value = currentPrefix;

/* 首先执行 */

if (!myChannel) {
	$('#messages').innerHTML = '';
	$('#footer').classList.add('hidden');
	$('#sidebar').classList.add('hidden');
	pushMessage({text: frontpage});
} else {
	join(myChannel);
}
