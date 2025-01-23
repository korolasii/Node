import Logger from "./logger/logger.js";

const logger  = new Logger()

logger.info("Info message")
logger.warning("Warning message")
logger.error(new Error("Something went wrong"));
