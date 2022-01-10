const puppeteer = require('puppeteer')
const CronJob = require('cron').CronJob
const nodemailer = require('nodemailer')
const cheerio = require('cheerio')

const ps5_url = "https://www.magazineluiza.com.br/playstation-5-2020-nova-geracao-825gb-1-controle-branco-headset-para-ps5-bluetooth-sony-pulse-3d/p/229587800/ga/otga/"
const ps5_digital_url = "https://www.magazineluiza.com.br/playstation-5-digital-edition-2020-nova-geracao-1-controle-controle-ps5-dualsense-cosmic-red/p/229588200/ga/otga/"

async function initBrowser(url){
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto(url)
    return page
}

async function sendNotification(url) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword'
        }
    })

    let textToSend = 'PLAYSTATION 5 DISPONÍVEL'
    let htmlText = `<a href=\"${url}\">Link</a>`
    let info = await transporter.sendMail({
        from: '"Amazon Monitor" <youremail@gmail.com>',
        to: "emailtosendnotification@gmail.com",
        subject: 'PLAYSTATION 5 EM ESTOQUE!',
        text: textToSend,
        html: htmlText
    })

    console.log("Message Sent: %s", info.messageId)
}

async function checkStock(page, url){
    await page.reload()
    let content = await page.evaluate(() => document.body.innerHTML)
    const $ = cheerio.load(content)
    let divAvailability = $('.price-template-price-block').text().toLowerCase().includes("por")
    console.log($('.unavailable__product').find('p.unavailable__product-title').text())
    if(divAvailability){
        sendNotification(url)
    } else {
        console.log(`${url} -- ${new Date()}`)
    }
}

async function monitor(){
    const page1 = await initBrowser(ps5_url)
    const page2 = await initBrowser(ps5_digital_url)
    let job = new CronJob("*/5 * * * *", function(){
        checkStock(page1, ps5_url)
        checkStock(page2, ps5_digital_url)
    }, null, true, null, null, true)
    job.start()
    //await checkStock(page)
}

monitor()

