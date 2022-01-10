const puppeteer = require('puppeteer')
const CronJob = require('cron').CronJob
const nodemailer = require('nodemailer')
const cheerio = require('cheerio')

const ps5_url = "https://www.amazon.com.br/dp/B09FGC9T19"
const ps5_digital_url = "https://www.amazon.com.br/dp/B09FGCKBPK"

async function initBrowser(url){
    const browser = await puppeteer.launch({headless: true})
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
    let divAvailability = $('#availability')
    divAvailability.each(function () {
        const isAvailable = $(this).find('span').text().toLowerCase().includes("em estoque")
        if(isAvailable){
            sendNotification(url)
        } else {
            console.log(`${url} --${$(this).find('span').text()} -- ${new Date()}`)
        }
    })
}

async function monitor(){
    const page1 = await initBrowser(ps5_url)
    const page2 = await initBrowser(ps5_digital_url)
    let job = new CronJob("*/3 * * * *", function(){
        checkStock(page1, ps5_url)
        checkStock(page2, ps5_digital_url)
    }, null, true, null, null, true)
    job.start()
    //await checkStock(page)
}

monitor()

