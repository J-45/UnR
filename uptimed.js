const puppeteer = require('puppeteer');

(async () => {
    while (true) {
        console.log("-= Uptimed.js =-\n");
        const PARAMETERS    = process.argv.toString();
        let URL             = ""
        let TEXT            = ""
        let DELAY           = ""

        try {
        URL = /-u,([^,]+),/gm.exec(PARAMETERS)[1];
        TEXT = /-t,([^,]+)/gm.exec(PARAMETERS)[1];
        DELAY = /-d,([^,]+)/gm.exec(PARAMETERS)[1];
        DELAY = parseInt(DELAY);
        } catch {
            console.error("Missing url (-u) and/or texte (-t) and/or delay (-d) in secondes");
            console.log("");
            console.error("uptimed.js -u [URL] -t [TEXT] -d [DELAY]");
            console.log("");
            return;
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);
        await page.screenshot({ path: 'example.png' });
        await browser.close();

        console.log(`Text >${TEXT}< in '${URL}' every ${DELAY} secondes`);
        await page.waitForTimeout(DELAY * 1000);
    }

})();
