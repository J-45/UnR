const puppeteer = require('puppeteer');
const https = require('https');

(async () => {

        console.log("-= Uptimed.js =-\n");
        const PARAMETERS    = process.argv.toString();
        let URL             = "";
        let TEXT            = "";
        let DELAY           = "";
        let TIMEOUT         = "";
        let upAndRunning    = null;
        let lastNotification= 0;
        let now             = Date.now();
        let canSendNotifcation  = true;

        try {
            URL = /-u,([^,]+),/gm.exec(PARAMETERS)[1];
            TEXT = /-t,([^,]+),/gm.exec(PARAMETERS)[1];
            DELAY = /-d,([^,]+),/gm.exec(PARAMETERS)[1];
            TIMEOUT = /-w,([^,]+)/gm.exec(PARAMETERS)[1];
            DELAY = parseInt(DELAY);
        } catch {
            console.error("Missing url (-u) and/or texte (-t) and/or delay (-d) in minutes timeout (-w) in secondes");
            console.log("");
            console.error("uptimed.js -u [URL] -t [TEXT] -d [DELAY] -w [TIMEOUT]");
            console.log("");
            return;
        }

        console.log(`Search '${TEXT}' in '${URL}' every ${DELAY} minute(s) and wait ${TIMEOUT} secondes max.`);

while (true) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);
        await page.screenshot({ path: 'example.png' });

        try {
            await page.goto(URL, {'timeout': TIMEOUT * 1000, 'waitUntil':'load'});
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
            upAndRunning    = true;
        } catch {
            upAndRunning    = false;
        }
        
        let textRegex = new RegExp(TEXT,"gi")
        const textFound = (await page.content()).match(textRegex);

        if (textFound !== null && upAndRunning){
            upAndRunning    = true;
        }else{
            upAndRunning    = false;
        }

        now = Date.now();
        minimumBetweenTwoNotification = 1000 * (60 * 60); // ms * secondes * minutes
        canSendNotifcation = (now - lastNotification) > minimumBetweenTwoNotification; 

        if (canSendNotifcation && !upAndRunning) {
            lastNotification = Date.now();
            sendNofication(URL, TEXT, lastNotification);
        }else {
            process.stdout.write('.');
        }

        await browser.close();
        await page.waitForTimeout( ( DELAY * 60 ) * 1000 );
    }

})();

function sendNofication(URL, TEXT, lastNotification) {
    const DATE = new Date(lastNotification).toLocaleDateString("fr-FR");
    const TIME = new Date(lastNotification).toLocaleTimeString("fr-FR");
    let txt = `${DATE} - ${TIME} = '${TEXT}' not found in '${URL}'`;
    var data = JSON.stringify({
        'user': "", 'pass': "", 'msg': txt
    });

    const options = {
        hostname: 'smsapi.free-mobile.fr',
        port: 443,
        path: '/sendmsg',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
    }

    const req = https.request(options, res => {
        // console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
          console.log(`>${d}<`);
        })
    })

    req.on('error', error => {
        console.error(error);
    })

    req.write(data);
    req.end();

    console.log(`\nSent >>> ${txt}`);
}
