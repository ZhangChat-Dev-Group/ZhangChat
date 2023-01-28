/*
 *
 * NOTE: The client side of hack.chat is currently in development,
 * a new, more modern but still minimal version will be released
 * soon. As a result of this, the current code has been deprecated
 * and will not actively be updated.
 *
*/

//select "chatinput" on "/"


document.addEventListener("keydown", e => {
    if (e.key === '/' && document.getElementById("chatinput") != document.activeElement) {
        e.preventDefault();
        document.getElementById("chatinput").focus();
    }
});

// initialize markdown engine
var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer:  true,
	quotes: `""''`,

	doHighlight: true,
	langPrefix: 'hljs language-',
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) {}

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

// image handler
var allowImages = true;
var imgHostWhitelist = [    //这些是由小张添加的
	'i.loli.net', 's2.loli.net',	//SM-MS图床
	's1.ax1x.com', 's2.ax1x.com', 'z3.ax1x.com', 's4.ax1x.com',		//路过图床
	'i.postimg.cc',		//postimages图床
	'gimg2.baidu.com',	//百度
	'xq.kzw.ink',	//XChat
	'catbox.moe', 'img.thz.cool', 'img.liyuv.top',  //这些是ee加的(被打)
	document.domain,
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
		var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
		var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
		var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
		var suffix = options.xhtmlOut ? ' /' : '';
		var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
		return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
	}

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.link_open = function (tokens, idx, options) {
	var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + Remarkable.utils.escapeHtml(tokens[idx].href) + '"' + title + target + '>';
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
			return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
		});
	}

  return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
	var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
	if (linkHref !== link.innerHTML) {
		return confirm('等一下！你即将前往：' + linkHref);
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
	'注意：在这里，我们把“房间”称作“频道”',
	'公共频道：**[?chat](/?chat)**',
	'这个是为您准备的频道（只有您自己）： ?' +Math.random().toString(36).substr(2, 8),
	'---',
	'我们会依照中华人民共和国有关法律保存您的聊天记录和IP地址，您的IP归属地也会依法公开。如果您不满意，则可以选择离开。',
	'请自觉遵守中华人民共和国有关法律和聊天室内的规定，如果您不在中国境内，也请遵守当地法律以及聊天室内的规定。',
	'---',
	'您知道吗？这个聊天室原本是[MelonFish](https://gitee.com/XChatFish)交给[MrZhang365](https://blog.mrzhang365.cf)开发的XChat聊天室，但是由于某些原因，它被开发者魔改成了现在的小张聊天室。',
	'XChat基于[HackChat](https://hack.chat/)，HackChat的GitHub仓库地址为：https://github.com/hack-chat/main',
	'在此对hackchat的开发者深表感谢。',
	'---',
	'友情链接：',
	'[小张（本聊天室开发者）的博客](https://blog.mrzhang365.cf/)',
	'[纸片君ee的个人主页](https://paperee.guru/)',
	'[Maggie\'s Personal Website](https://www.thz.cool/)',
	'[小张软件](https://www.zhangsoft.cf/)',
	'[HackChat聊天室](https://hack.chat/)',
	'[TanChat聊天室](https://tanchat.fun/)',
	'---',
	'2023 小张软件',
].join("\n");

function $(query) {
	return document.querySelector(query);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key]
	} catch (e) { }
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val
	} catch (e) { }
}

var ws;
var myMurmur = '';
var myNick = localStorageGet('my-nick') || '';
var myChannel = decodeURI(window.location.search.replace(/^\?/, ''));
var lastSent = [""];
var lastSentPos = 0;
//const hCaptchaSiteKey = '94d4ba8b-335c-4d47-b57b-23647dafbf05'

/** Notification switch and local storage behavior **/
var notifySwitch = document.getElementById("notify-switch")
var notifySetting = localStorageGet("notify-api")
var notifyPermissionExplained = 0; // 1 = granted msg shown, -1 = denied message shown

// Inital request for notifications permission
function RequestNotifyPermission() {
	try {
		var notifyPromise = Notification.requestPermission();
		if (notifyPromise) {
			notifyPromise.then(function (result) {
				console.log("ZhangChat桌面通知权限：" + result);
				if (result === "granted") {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "*",
							text: "已获得桌面通知权限",
							time: null
						});
						notifyPermissionExplained = 1;
					}
					return false;
				} else {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "!",
							text: "桌面通知权限被拒绝，当有人@你时，你将不会收到桌面通知",
							time: null
						});
						notifyPermissionExplained = -1;
					}
					return true;
				}
			});
		}
	} catch (error) {
		pushMessage({
			cmd: "chat",
			nick: "!",
			text: "无法创建桌面通知",
			time: null
		});
		console.error("无法创建桌面通知，该浏览器可能不支持桌面通知，错误信息：\n")
		console.error(error)
		return false;
	}
}

// Update localStorage with value of checkbox
notifySwitch.addEventListener('change', (event) => {
	if (event.target.checked) {
		RequestNotifyPermission();
	}
	localStorageSet("notify-api", notifySwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
	localStorageSet("notify-api", "false")
	notifySwitch.checked = false
}
// Configure notifySwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
	notifySwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	notifySwitch.checked = false
}

/** Sound switch and local storage behavior **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")

// Update localStorage with value of checkbox
soundSwitch.addEventListener('change', (event) => {
	localStorageSet("notify-sound", soundSwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
	localStorageSet("notify-sound", "false")
	soundSwitch.checked = false
}
// Configure soundSwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
	soundSwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	soundSwitch.checked = false
}

// Create a new notification after checking if permission has been granted
function spawnNotification(title, body) {
	// Let's check if the browser supports notifications
	if (!("Notification" in window)) {
		console.error("浏览器不支持桌面通知");
	} else if (Notification.permission === "granted") { // Check if notification permissions are already given
		// If it's okay let's create a notification
		var options = {
			body: body,
			icon: "/favicon-96x96.png"
		};
		var n = new Notification(title, options);
	}
	// Otherwise, we need to ask the user for permission
	else if (Notification.permission !== "denied") {
		if (RequestNotifyPermission()) {
			var options = {
				body: body,
				icon: "/favicon-96x96.png"
			};
			var n = new Notification(title, options);
		}
	} else if (Notification.permission == "denied") {
		// At last, if the user has denied notifications, and you
		// want to be respectful, there is no need to bother them any more.
	}
}

function notify(args) {
	// Spawn notification if enabled
	if (notifySwitch.checked) {
		spawnNotification("?" + myChannel + "  —  " + args.nick, args.text)
	}

	// Play sound if enabled
	if (soundSwitch.checked) {
		var soundPromise = document.getElementById("notify-sound").play();
		if (soundPromise) {
			soundPromise.catch(function (error) {
				console.error("播放提示音错误：\n" + error);
			});
		}
	}
}

function getNick(){
	return myNick.split('#')[0]
}

function getMurmur() {
	return Fingerprint2.getPromise({}).then(components => {
		// 参数
		const values = components.map(function (component) {
			return component.value
		});
		// 指纹
		myMurmur = Fingerprint2.x64hash128(values[19].join(''), 31);
		//console.log(murmur)
	})
}

/*
function tokenCallback(token){
	//debugger
	setTimeout(() => {
		document.getElementById('captcha').innerHTML = ''    //清除验证码，防止出现BUG
	},2000)
	join(myChannel,token)
}
*/

function join(channel) {
	/*
	var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
	// if you changed the port during the server config, change 'wsPath'
	// to the new port (example: ':8080')
	// if you are reverse proxying, change 'wsPath' to the new location
	// (example: '/chat-ws')
	var wsPath = ':6060';
	const url = protocol + '//' + document.domain + wsPath
	*/
	const url = 'wss://ws.zhangsoft.cf/'

	ws = new WebSocket(url);

	var wasConnected = false;

	ws.onopen = async function () {
		var shouldConnect = true;
		if (!wasConnected) {
			if (location.hash) {
				myNick = location.hash.substr(1);
			} else {
				var newNick = prompt('请输入昵称：', myNick);
				if (newNick !== null) {
					myNick = newNick;
				} else {
					// The user cancelled the prompt in some manner
					shouldConnect = false;
				}
			}
		}

		if (myNick && shouldConnect) {
			localStorageSet('my-nick', myNick);
			await getMurmur();
			//console.log(`murmur is: ${myMurmur}`)
			var sendMurmur=encode(myMurmur)
			send({ cmd: 'join', channel: channel, nick: myNick, client:'ZhangChatClient', murmur: sendMurmur.toString() });
		}

		wasConnected = true;
	}

	ws.onclose = function () {
		if (wasConnected) {
			pushMessage({ nick: '!', text: "哎呀，掉线了，正在重新连接..." });
		}

		window.setTimeout(function () {
			join(channel);
		}, 2000);
		
	}

	ws.onmessage = function (message) {
		var args = JSON.parse(message.data);
		var cmd = args.cmd;
		var command = COMMANDS[cmd];
		//console.log(args)
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
		var nicks = args.nicks;

		usersClear();

		nicks.forEach(function (nick) {
			userAdd(nick);
		});

		pushMessage({ nick: '*', text: "在线的用户：" + nicks.join(", ") })
	},

	onlineAdd: function (args) {
		var nick = args.nick;

		userAdd(nick);

		if ($('#joined-left').checked) {
			var joinNotice = nick + " 加入了聊天室"
			if (args.client){
				joinNotice += '\nTA正在使用 ' + args.client
			}
			if (args.auth){
				joinNotice += '\n系统认证：' + args.auth
			}
			pushMessage({ nick: '→', text: joinNotice, trip: args.trip || '' },'info');    //仿Discord
		}
	},

	onlineRemove: function (args) {
		var nick = args.nick;

		userRemove(nick);

		if ($('#joined-left').checked) {
			pushMessage({ nick: '←', text: nick + " 离开了聊天室" },'info');    //仿Discord
		}
	},
	'set-video': function (args){
		var html = `<video controls><source src="${args.url}"></video>`
		pushHTML({
			nick:'*',
			text: html
		})
	},
	history: function (args) {
		var i = 0
		for (i in args.history) {
			pushMessage(args.history[i],null)
		}
		pushMessage({
			nick: '*',
			text:'——以上是历史记录——'
		})
	}
}

function buildReplyText(user,text){
	var replyText = `>`
	var i = 0
	var tooLong = true
	const textList = text.split('\n')
	if (user.trip){
		replyText += `[${user.trip}] ${user.nick}：\n`
	}else{
		replyText += `${user.nick}：\n`
	}
	for (i = 0;i < 8;i+=1){
		if (typeof textList[i] === 'undefined'){
			tooLong = false
			break
		}
		replyText += '>' + textList[i] + '\n'
	}
	if (i < textList.length && tooLong){
		replyText += '>……\n\n'
	}else{
		replyText += '\n'
	}
	if (user.nick !== getNick()){
		replyText += `@${user.nick} `
	}
	return replyText
}

function pushMessage(args,cls = undefined) {    //cls指定messageEl添加什么classList
	// Message container
	var messageEl = document.createElement('div');
	
	if (args.messageID){
		messageEl.id = args.messageID
	}

	if (
		typeof (myNick) === 'string' && (
			args.text.match(new RegExp('@' + getNick() + '\\b', "gi")) ||
			((args.type === "whisper" || args.type === "invite") && args.from)
		)
	) {
		notify(args);
	}

	messageEl.classList.add('message');
    if (typeof cls === 'string'){
		messageEl.classList.add(cls);
	}else if (cls === null){
		//nothing
	}else{
		if (verifyNickname(getNick()) && args.nick == getNick()) {
			messageEl.classList.add('me');
		} else if (args.nick == '!') {
			messageEl.classList.add('warn');
		} else if (args.nick == '*') {
			messageEl.classList.add('info');
		} else if (args.admin) {
			messageEl.classList.add('admin');
		} else if (args.mod) {
			messageEl.classList.add('mod');
		} else if (args.channelOwner){
			messageEl.classList.add('channelOwner')
		} else if (args.trusted){
			messageEl.classList.add('trusted');
		}
	}
	
	// Nickname
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);


	if (args.trip) {
		var tripEl = document.createElement('span');
		if(args.isBot){
			tripEl.textContent = '√Bot ' + args.trip + " ";
		}else{
			tripEl.textContent = args.trip + " ";
		}
		tripEl.classList.add('trip');
		nickSpanEl.appendChild(tripEl);
	}

	if (args.head){
		//头像
		var imgEl = document.createElement('img');
		imgEl.src = args.head
		imgEl.style.height = '25px'
		imgEl.style.width = '25px'
		imgEl.style.marginRight = '0.5rem'
		imgEl.style.verticalAlign = 'top'
		imgEl.style.borderRadius = '50%'
		nickSpanEl.appendChild(imgEl)
	}

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		if (args.color && /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(args.color)) {
			nickLinkEl.setAttribute('style', 'color:#' + args.color + ' !important');
		}

		nickLinkEl.onclick = function () {
			insertAtCursor("@" + args.nick + " ");
			$('#chatinput').focus();
		}

		nickLinkEl.oncontextmenu = function(e){
			e.preventDefault();
			var replyText = buildReplyText({
				nick:args.nick,
				trip: args.trip || ''
			},args.text)
			replyText += $('#chatinput').value
			$('#chatinput').value = ''
			insertAtCursor(replyText)
			$('#chatinput').focus();
		}

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();
		nickSpanEl.appendChild(nickLinkEl);
	}
	// Text
	var textEl = document.createElement('p');
	textEl.classList.add('text');
	textEl.innerHTML = md.render(args.text);

	messageEl.appendChild(textEl);

	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').appendChild(messageEl);
	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}

	unread += 1;
	updateTitle();
}

function pushHTML(args,cls = undefined) {    //cls指定messageEl添加什么classList
	// Message container
	var messageEl = document.createElement('div');

	if (verifyNickname(getNick()) && args.nick == getNick()) {
		messageEl.classList.add('me');
	} else if (args.nick == '!') {
		messageEl.classList.add('warn');
	} else if (args.nick == '*') {
		messageEl.classList.add('info');
	} else if (args.admin) {
		messageEl.classList.add('admin');
	} else if (args.mod) {
		messageEl.classList.add('mod');
	} else if (args.channelOwner){
		messageEl.classList.add('channelOwner')
	} else if (args.trusted){
		messageEl.classList.add('trusted');
	}
	
	// Nickname
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);

	if (args.trip) {
		var tripEl = document.createElement('span');
		if(args.isBot){
			tripEl.textContent = '√Bot ' + args.trip + " ";
		}else{
			tripEl.textContent = args.trip + " ";
		}
		tripEl.classList.add('trip');
		nickSpanEl.appendChild(tripEl);
	}

	if (args.head){
		//头像
		var imgEl = document.createElement('img');
		imgEl.src = args.head
		imgEl.style.height = '20px'
		imgEl.style.width = '20px'
		imgEl.style.marginRight = '0.5rem'
		imgEl.style.verticalAlign = 'top'
		imgEl.style.borderRadius = '50%'
		nickSpanEl.appendChild(imgEl)
	}

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		nickLinkEl.onclick = function () {
			insertAtCursor("@" + args.nick + " ");
			$('#chatinput').focus();
		}

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();
		nickSpanEl.appendChild(nickLinkEl);
	}
	// Text
	var textEl = document.createElement('div');
	textEl.classList.add('text');
	textEl.innerHTML = args.text;

	messageEl.appendChild(textEl);

	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').appendChild(messageEl);
	if (atBottom) {
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

function updateTitle() {
	if (windowActive && isAtBottom()) {
		unread = 0;
	}

	var title;
	if (myChannel) {
		title = myChannel;
	} else {
		title = "小张聊天室";
	}

	if (unread > 0) {
		title = '（' + unread + '）' + title;
	}

	document.title = title;
}

$('#footer').onclick = function () {
	$('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
		e.preventDefault();

		// Submit message
		if (e.target.value != '') {
			var text = e.target.value;
			e.target.value = '';

			send({ cmd: 'chat', text: text, head: localStorageGet('head') || '' });

			lastSent[0] = text;
			lastSent.unshift("");
			lastSentPos = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 38 /* UP */) {
		// Restore previous sent messages
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
		e.preventDefault();

		// Clear input field
		e.target.value = "";
		lastSentPos = 0;
		lastSent[lastSentPos] = "";

		updateInputSize();
	} else if (e.keyCode == 9 /* TAB */) {
		// Tab complete nicknames starting with @

		if (e.ctrlKey) {
			// Skip autocompletion and tab insertion if user is pressing ctrl
			// ctrl-tab is used by browsers to cycle through tabs
			return;
		}
		e.preventDefault();

		var pos = e.target.selectionStart || 0;
		var text = e.target.value;
		var index = text.lastIndexOf('@', pos);

		var autocompletedNick = false;

		if (index >= 0) {
			var stub = text.substring(index + 1, pos).toLowerCase();
			// Search for nick beginning with stub
			var nicks = onlineUsers.filter(function (nick) {
				return nick.toLowerCase().indexOf(stub) == 0
			});

			if (nicks.length > 0) {
				autocompletedNick = true;
				if (nicks.length == 1) {
					insertAtCursor(nicks[0].substr(stub.length) + " ");
				}
			}
		}

		// Since we did not insert a nick, we insert a tab character
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

/* sidebar */

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
	} catch (e) { return; }

	if (!$('#pin-sidebar').checked) {
		$('#sidebar-content').classList.add('hidden');
		$('#sidebar').classList.remove('expand');
	}
}

$('#set-video').onclick = function() {
    var newVideo = prompt('请输入视频文件地址（留空则清除公共视频）：','')
	if (newVideo === null){
		return pushMessage({
			nick:'!',
			text:'您取消了设置视频'
		})
	}
	send({
		cmd:'set-video',
		url: newVideo || 'nothing'
	})
}

$('#get-video').onclick = function() {
	send({
		cmd:'get-video',
	})
}

$('#clear-messages').onclick = function () {
	// Delete children elements
	if (!confirm('是否清除本页聊天内容？')){     //are you sure?
		return
	}
	var messages = $('#messages');
	messages.innerHTML = '';
}

$('#set-head').onclick = function () {
	var newHead = prompt('请输入头像地址（留空则使用默认值）：',localStorageGet('head') || '')
	if (!newHead){
		localStorageSet('head','')
	}else{
		localStorageSet('head',newHead)
	}
}

// Restore settings from localStorage

if (localStorageGet('pin-sidebar') == 'true') {
	$('#pin-sidebar').checked = true;
	$('#sidebar-content').classList.remove('hidden');
}

if (localStorageGet('joined-left') == 'false') {
	$('#joined-left').checked = false;
}

if (localStorageGet('parse-latex') == 'false') {
	$('#parse-latex').checked = false;
	md.inline.ruler.disable([ 'katex' ]);
	md.block.ruler.disable([ 'katex' ]);
}

$('#pin-sidebar').onchange = function (e) {
	localStorageSet('pin-sidebar', !!e.target.checked);
}

$('#joined-left').onchange = function (e) {
	localStorageSet('joined-left', !!e.target.checked);
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

$('#allow-imgur').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('allow-imgur', enabled);
	allowImages = enabled;
}

// User list
var onlineUsers = [];
var ignoredUsers = [];

function userAdd(nick) {
	var user = document.createElement('a');
	user.textContent = nick;

	user.onclick = function (e) {
		userInvite(nick)
	}

	var userLi = document.createElement('li');
	userLi.appendChild(user);
	$('#users').appendChild(userLi);
	onlineUsers.push(nick);
}

function userRemove(nick) {
	var users = $('#users');
	var children = users.children;

	for (var i = 0; i < children.length; i++) {
		var user = children[i];
		if (user.textContent == nick) {
			users.removeChild(user);
		}
	}

	var index = onlineUsers.indexOf(nick);
	if (index >= 0) {
		onlineUsers.splice(index, 1);
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
	send({ cmd: 'invite', nick: nick });
}

function userIgnore(nick) {
	ignoredUsers.push(nick);
}

/* color scheme switcher */

var schemes = [
	'electron',
	'eighties',
	'atelier-dune',
	'lax',
	'monokai',
	'tomorrow',
	'default',
	'hacker',
	'railscasts',
	'bright',
];

var highlights = [
	'androidstudio',
	'agate',
	'atom-one-dark',
	'darcula',
	'github',
	'rainbow',
	'tk-night',
	'tomorrow',
	'xcode',
	'zenburn'
]

var currentScheme = 'electron';
var currentHighlight = 'androidstudio';

function setScheme(scheme) {
	currentScheme = scheme;
	$('#scheme-link').href = "schemes/" + scheme + ".css";
	localStorageSet('scheme', scheme);
}

function setHighlight(scheme) {
	currentHighlight = scheme;
	$('#highlight-link').href = "vendor/hljs/styles/" + scheme + ".min.css";
	localStorageSet('highlight', scheme);
}

// Add scheme options to dropdown selector
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

$('#scheme-selector').onchange = function (e) {
	setScheme(e.target.value);
}

$('#highlight-selector').onchange = function (e) {
	setHighlight(e.target.value);
}

// Load sidebar configaration values from local storage if available
if (localStorageGet('scheme')) {
	setScheme(localStorageGet('scheme'));
}

if (localStorageGet('highlight')) {
	setHighlight(localStorageGet('highlight'));
}

$('#scheme-selector').value = currentScheme;
$('#highlight-selector').value = currentHighlight;

/* main */

if (myChannel == '') {
	pushMessage({ text: frontpage });
	$('#footer').classList.add('hidden');
	$('#sidebar').classList.add('hidden');
} else {
	join(myChannel);
}
