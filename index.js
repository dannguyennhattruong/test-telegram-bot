"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const fs = require('fs');
const telegraf_1 = require("telegraf");
var cron = require('node-cron');
let bot;
const sendMsg1 = () => {
    return {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: "Complete your task to earn now", url: 'https://t.me/DAPP_HANGARX_BOT/hangarx' }],
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        },
    };
};
class FileSystemFake {
    constructor(path) {
        this.data = [];
        this.path = '';
        this.path = path;
        this.data = require(path);
    }
    save(dto) {
        this.data.push(dto);
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4));
        return true;
    }
    update(dto) {
        let find = this.data.find(f => (f === null || f === void 0 ? void 0 : f.username) === (dto === null || dto === void 0 ? void 0 : dto.username));
        if (find) {
            const d = Object.assign(Object.assign({}, find), dto);
            this.data = this.data.filter(f => (f === null || f === void 0 ? void 0 : f.username) !== (dto === null || dto === void 0 ? void 0 : dto.username));
            this.data.push(d);
        }
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4));
        return this.data;
    }
    read() {
        this.data = require(this.path);
        return this.data;
    }
    find(cond) {
        this.data = require(this.path);
        const d = this.data.filter(cond);
        return d;
    }
}
const fileSys = new FileSystemFake("./telegram_user.json");
app.listen(3232, () => {
    console.log(`App is up`);
});
const savechat = (dto) => {
    const find = fileSys.find((f) => (f === null || f === void 0 ? void 0 : f.username) === (dto === null || dto === void 0 ? void 0 : dto.username));
    if ((find === null || find === void 0 ? void 0 : find.length) > 0) {
        // update chatId
        const up = fileSys.update(Object.assign({}, dto));
    }
    else {
        //create
        const s = fileSys.save(Object.assign({}, dto));
    }
};
app.get('/bot/start', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    cron.schedule('0 8 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        console.log('Set cron 8 AM everyday');
        const startMsg1 = `
            ⏰ Your Daily Tasks are Ready 
            🌟 Claim your rewards and boost your progress!
            👇 Tap the button below for a Daily Tasks, amazing rewards awaits for you! 
                    `;
        const findAll = fileSys.read();
        try {
            for (var _d = true, findAll_1 = __asyncValues(findAll), findAll_1_1; findAll_1_1 = yield findAll_1.next(), _a = findAll_1_1.done, !_a; _d = true) {
                _c = findAll_1_1.value;
                _d = false;
                const iterator = _c;
                const s1 = sendMsg1();
                yield bot.telegram.sendMessage(Number(iterator.chatId), startMsg1, {
                    reply_markup: s1.reply_markup,
                    parse_mode: 'HTML'
                });
                iterator.isSent = true;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = findAll_1.return)) yield _b.call(findAll_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }));
    res.send('Set done !');
    return yield bot.launch();
}));
app.get('/bot/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const TOKEN = req.params.token;
    const botx = new telegraf_1.Telegraf(TOKEN);
    bot = botx;
    bot.command('help', (ctx) => {
        ctx.reply('To get help, contact our support team at support@hangarx.io');
    });
    bot.command('menu', (ctx) => {
        ctx.reply('Choose an option:', {
            reply_markup: {
                keyboard: [
                    [
                        { text: 'Play', web_app: { url: 'https://portal.hangarx.io' } },
                        { text: 'Share' }
                    ],
                    [
                        {
                            text: 'Website | Whitepaper',
                            web_app: { url: 'https://hangarx.io' }
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    });
    bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('chatID : ', ctx.chat.id);
        console.log('username : ', ctx.from.username);
        console.log('Date: ', ctx.message.date);
        savechat({
            chatId: ctx.chat.id,
            username: ctx.from.username,
            date: ctx.message.date,
            isSent: false
        });
        yield ctx.reply('Welcome to HangarX', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [
                        { text: 'Play', web_app: { url: 'https://portal.hangarx.io' } },
                        { text: 'Share' }
                    ],
                    [
                        {
                            text: 'Website | Whitepaper',
                            web_app: { url: 'https://hangarx.io' }
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }));
    bot.hears('Share', ctx => {
        const link = `https://t.me/hangarxgaming_bot`;
        const shareLink = `https://t.me/share/url?url=${encodeURIComponent(link)}`;
        ctx.reply(`https://t.me/DAPP_HANGARX_BOT/hangarx`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Share", url: shareLink }],
                    /* Inline buttons. 2 side-by-side */
                    /* One button */
                ],
                resize_keyboard: true,
            },
        });
    });
    return res.send('OK');
}));
