import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import levels from "./levels.js";
import formatMessage from "./formatter.js";

class Logger extends EventEmitter {
    constructor(logPath = "./logs/app.log") {
        super();
        this.logPath = logPath;

        if (!fs.existsSync(path.dirname(this.logPath))) {
            fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
        }

        this.on("log", this.writeLogToFile);
    }

    writeLogToFile(formattedMsg) {
        fs.appendFile(this.logPath, `${formattedMsg}\n`, (err) => {
            if (err) {
                console.error("Error while trying to write data to file:", err.message);
            }
        });
    }

    __log(level, msg) {
        const formattedMsg = formatMessage(level, msg);

        if (process.env.APP_ENV === "local") {
            console.log(formattedMsg);
        } else {
            this.emit("log", formattedMsg);
        }
    }

    info(msg) {
        this.__log(levels.INFO, msg);
    }

    warning(msg) {
        this.__log(levels.WARNING, msg);
    }

    error(err) {
        if (err instanceof Error) {
            const errorDetails = `Error: ${err.message}\nStack: ${err.stack}`;
            this.__log(levels.ERROR, errorDetails);
        } else {
            this.__log(levels.ERROR, err);
        }
    }
}

export default Logger;