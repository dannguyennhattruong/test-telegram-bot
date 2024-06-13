const express = require('express');
const app = express();
const fs = require('fs');
import { Update } from "@telegraf/types";
import { Request, Response } from "express";
import { Telegraf, Markup, Context } from "telegraf";
var cron = require('node-cron');
let bot: Telegraf<Context<Update>>;

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

    }
}




class FileSystemFake {
    data: any[] = []
    path = '';
    constructor(path: string) {
        this.path = path;
        this.data = require(path);
    }

    save(dto: any) {
        this.data.push(dto);
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4));
        return true;
    }

    update(dto: any) {
        let find = this.data.find(f => f?.username === dto?.username);
        if (find) {
            const d = {
                ...find,
                ...dto
            }
            this.data = this.data.filter(f => f?.username !== dto?.username);

            this.data.push(d);
        }
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 4));

        return this.data;
    }

    read() {
        this.data = require(this.path);
        return this.data;
    }

    find(cond: any) {
        this.data = require(this.path);
        const d = this.data.filter(cond);
        return d;
    }
}

const fileSys = new FileSystemFake("./telegram_user.json");



app.listen(3232, () => {
    console.log(`App is up`)
})

app.get('/get-json', (req: Request, res: Response) => {
    const data = require("./telegram_user.json")
    res.send(data)
})

const savechat = (dto: {
    username: string;
    chatId: number;
    date: number;
    isSent: boolean;
}) => {


    const find = fileSys.find((f: any) => f?.username === dto?.username);

    if (find?.length > 0) {
        // update chatId
        const up = fileSys.update({
            ...dto
        })
    }
    else {
        //create
        const s = fileSys.save({
            ...dto,
        })
    }
}

app.get('/pushmessage', async () => {
    const startMsg1 = `
            ⏰ Your Daily Tasks are Ready 
            🌟 Claim your rewards and boost your progress!
            👇 Tap the button below for a Daily Tasks, amazing rewards awaits for you! 
                    `
    const findAll = fileSys.read();
    for await (const iterator of findAll) {
        const s1 = sendMsg1();

        await bot.telegram.sendMessage(Number(iterator.chatId), startMsg1, {
            reply_markup: s1.reply_markup,
            parse_mode: 'HTML'
        })

        iterator.isSent = true;
    }
})

app.get('/bot/start', async (req: Request, res: Response) => {
    cron.schedule('0 8 * * *', async () => {
        console.log('Set cron 8 AM everyday')
        const startMsg1 = `
            ⏰ Your Daily Tasks are Ready 
            🌟 Claim your rewards and boost your progress!
            👇 Tap the button below for a Daily Tasks, amazing rewards awaits for you! 
                    `
        const findAll = fileSys.read();
        for await (const iterator of findAll) {
            const s1 = sendMsg1();

            await bot.telegram.sendMessage(Number(iterator.chatId), startMsg1, {
                reply_markup: s1.reply_markup,
                parse_mode: 'HTML'
            })

            iterator.isSent = true;
        }
    });
    res.send('Set done !')
    return await bot.launch();
})

app.get('/bot/:token', async (req: Request, res: Response) => {

    const TOKEN = req.params.token;
    const botx = new Telegraf(TOKEN)
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

    bot.start(async (ctx) => {
        console.log('chatID : ', ctx.chat.id)
        console.log('username : ', ctx.from.username);
        console.log('Date: ', ctx.message.date)
        savechat({
            chatId: ctx.chat.id,
            username: ctx.from.username as string,
            date: ctx.message.date,
            isSent: false
        })
        await ctx.reply('Welcome to HangarX', {
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

        })


    })

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
    })
    return res.send('OK')
})