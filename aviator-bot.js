
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const CONFIG = {
    url: 'https://www.mozzartbet.co.ke/en#/',
    pollInterval: 4000,
    threshold: 1.22,
    historySelector: '.payout',
    aviatorSelector: 'p.offer-link.dark.mozzart_ke a.aviator'
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let browser;
let previousHistory = [];
let initialized = false;

const stats = {
    rounds: 0,
    belowThreshold: 0,
    total: 0,
    results: []
};

function parseMultiplier(text) {
    const match = text.match(/(\d+(?:\.\d+)?)\s*x?/i);
    return match ? Number(match[1]) : null;
}

async function findGameFrame(page, selector, timeout = 90000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        for (const frame of page.frames()) {
            try {
                const element = await frame.$(selector);
                if (element) return frame;
            } catch (error) {
                // Frame may be refreshing.
            }
        }

        await sleep(1000);
    }

    throw new Error(`Game element not found: ${selector}`);
}

async function getMultipliers(page) {
    const frame = await findGameFrame(
        page,
        CONFIG.historySelector
    );

    const values = await frame.$$eval(
        CONFIG.historySelector,
        elements => elements
            .filter(element => element.getClientRects().length > 0)
            .map(element => element.textContent.trim())
    );

    return values
        .map(parseMultiplier)
        .filter(value => value !== null && Number.isFinite(value));
}

function findOverlap(oldHistory, newHistory) {
    const max = Math.min(
        oldHistory.length,
        newHistory.length
    );

    for (let size = max; size > 0; size--) {
        const oldPart = oldHistory.slice(0, size);
        const newPart = newHistory.slice(-size);

        if (oldPart.every(
            (value, index) => value === newPart[index]
        )) {
            return size;
        }
    }

    return 0;
}

function recordMultiplier(value) {
    const file = 'aviator-results.csv';

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, 'Round,Multiplier\n');
    }

    const lines = fs.readFileSync(file, 'utf8')
        .trim()
        .split(/\r?\n/);

    const lastRound = Number(lines[lines.length - 1].split(',')[0]) || 0;

    fs.appendFileSync(
        file,
        `${lastRound + 1},${value.toFixed(2)}\n`
    );

    stats.rounds++;
    stats.total += value;
    stats.results.push(value);

    if (value < CONFIG.threshold) {
        stats.belowThreshold++;
    }

    const average = stats.total / stats.rounds;

    console.log('\n-----------------------------');
    console.log(`NEW ROUND: ${value.toFixed(2)}x`);
    console.log(`Total rounds: ${stats.rounds}`);
    console.log(`Below ${CONFIG.threshold}x: ${stats.belowThreshold}`);
    console.log(`Average: ${average.toFixed(2)}x`);
    console.log('-----------------------------');
}

function displayStatistics() {
    const average = stats.rounds
        ? stats.total / stats.rounds
        : 0;

    const highest = stats.rounds
        ? Math.max(...stats.results)
        : 0;

    const lowest = stats.rounds
        ? Math.min(...stats.results)
        : 0;

    const belowPercentage = stats.rounds
        ? (stats.belowThreshold / stats.rounds) * 100
        : 0;

    const last10 = stats.results.slice(-10);
    const last10Average = last10.length
        ? last10.reduce((sum, value) => sum + value, 0) / last10.length
        : 0;

    console.log('\n====== AVIATOR STATISTICS ======');
    console.log(`Rounds recorded: ${stats.rounds}`);
    console.log(`Highest multiplier: ${highest.toFixed(2)}x`);
    console.log(`Lowest multiplier: ${lowest.toFixed(2)}x`);
    console.log(`Below threshold: ${stats.belowThreshold}`);
    console.log(`Below threshold percentage: ${belowPercentage.toFixed(2)}%`);
    console.log(`Historical average: ${average.toFixed(2)}x`);
    console.log(`Last 10 rounds average: ${last10Average.toFixed(2)}x`);
    console.log('================================');
}

async function login(page) {
    await page.goto(CONFIG.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    console.log('MozzartBet opened.');
    console.log('Log in if needed, then open Casino > Aviator > Demo.');

    const deadline = Date.now() + 180000;
    let aviatorFrame = null;

    while (Date.now() < deadline) {
        aviatorFrame = page.frames().find(frame =>
            frame.url().includes('airplane-demo.spribegaming.com')
        );

        if (aviatorFrame) break;
        await sleep(1000);
    }

    if (!aviatorFrame) {
        throw new Error('Aviator Demo frame not detected within 3 minutes.');
    }

    console.log('AVIATOR DEMO FRAME DETECTED');
}

async function monitor(page) {
    console.log('\nMonitoring Aviator multipliers...');

    while (true) {
        try {
            const current = await getMultipliers(page);

            if (!current.length) {
                await sleep(CONFIG.pollInterval);
                continue;
            }

            if (!initialized) {
                previousHistory = current;
                initialized = true;

                console.log('Initial history loaded.');
                console.log(current.slice(0, 10));

                await sleep(CONFIG.pollInterval);
                continue;
            }

            if (
                JSON.stringify(current) !==
                JSON.stringify(previousHistory)
            ) {
                const overlap = findOverlap(
                    previousHistory,
                    current
                );

                if (overlap > 0) {
                    const newResults = current
                        .slice(0, current.length - overlap)
                        .reverse();

                    newResults.forEach(recordMultiplier);
                } else {
                    console.log(
                        'History changed; unable to identify new rounds safely.'
                    );
                }

                previousHistory = current;
            }

        } catch (error) {
            console.error('Monitoring error:', error.message);
        }

        await sleep(CONFIG.pollInterval);
    }
}

async function main() {
    try {
        browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: './chrome-profile',
    args: ['--start-maximized']
});

        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(60000);

        await login(page);

        await sleep(8000);

        const openPages = await browser.pages();
        for (let i = 0; i < openPages.length; i++) {
            console.log('BROWSER TAB:', i, {
                url: openPages[i].url(),
                title: await openPages[i].title(),
                frames: openPages[i].frames().map(frame => frame.url())
            });
        }

        await findGameFrame(
            page,
            CONFIG.historySelector
        );

        console.log('Multiplier history detected.');

        await monitor(page);

    } catch (error) {
        console.error('\nBOT ERROR:', error.message);
    } finally {
        console.log('Browser left open for inspection. Press Ctrl+C to stop.');
    }
}

process.on('SIGINT', async () => {
    console.log('\nStopping bot...');
    displayStatistics();

    if (browser) {
        await browser.close();
    }

    process.exit(0);
});

main();
