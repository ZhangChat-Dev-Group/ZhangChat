import * as UAC from '../utility/UAC/_info';

// module main
export async function run(core, server, socket, data) {
    if (server.police.frisk(socket.address, 2)) {
        return server.reply({
            cmd: 'warn',
            text: '你执行此命令速度太快，请稍后再试',
        }, socket);
    }

    const zom_socket = server.findSockets({ channel:socket.channel, nick: data.nick });
    if (zom_socket == [] || zom_socket == null || zom_socket.length == 0) {
        return server.reply({
            cmd: 'warn',
            text: '找不到这个用户',
        }, socket);
    }
    if (zom_socket[0].address === socket.address || (zom_socket[0].trip === socket.trip && zom_socket[0].trip && socket.trip && !socket.passwordWarning && !zom_socket[0].passwordWarning)) {
        server.reply({
            cmd: 'warn',
            text: '您已被自己踢出聊天室，如果这不是您本人操作，请重新加入并通知管理员，谢谢合作。',
        }, zom_socket[0]);
        zom_socket[0].terminate();
        server.reply({
            cmd:'info',
            text:`您已踢出 ${data.nick}`
        },socket)
    } else {
        return server.reply({
            cmd: 'warn',
            text: `抱歉，我们无法确定 ${data.nick} 就是您本人，该命令只能踢出同IP地址或同识别码且都使用了强密码的用户`,
        }, socket);
    }

    return true;
}

export const info = {
    name: 'kickzom',
    description: '踢出由于网络问题而尚未离开聊天室的自己',
    usage: `
    API: { cmd: 'kickzom', nick: '<nickname>' }
    文本：以聊天形式发送 /kickzom <目标昵称>`,
    dataRules: [
        {
            name: 'nick',
            required: true,
            verify: UAC.verifyNickname,
            errorMessage: UAC.nameLimit.nick,
        }
    ],
    runByChat: true,
};