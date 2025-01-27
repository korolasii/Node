import Logger from "./logger/logger.js";

async function sleep(time) {
    return new Promise(
        (resolve) => setTimeout(resolve, time)
    );
}

const logger = new Logger();

logger.info("message");

await sleep(10000);

logger.info("message after 10 seconds");