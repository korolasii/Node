// logger.js
import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { Transform } from "node:stream";
import chalk from "chalk";
import levels from "./levels.js"; 

class LogTransformer extends Transform {

    constructor(options) {
        super({ ...options, objectMode: true });
    }

    _transform(chunk, encoding, callback) {
        const { message, type } = chunk;
        const timestamp = new Date().toISOString();
        let formattedMessage;

        switch (type) {
            case levels.INFO:
                formattedMessage = chalk.blue(`[${timestamp}] INFO: ${message}`);
                break;
            case levels.WARNING:
                formattedMessage = chalk.yellow(`[${timestamp}] WARNING: ${message}`);
                break;
            case levels.ERROR:
                formattedMessage = chalk.red(`[${timestamp}] ERROR: ${message}`);
                break;
            default:
                formattedMessage = chalk.gray(`[${timestamp}] UNKNOWN: ${message}`);
                break;
        }
        callback(null, formattedMessage + "\n");
    }
}

class Logger extends EventEmitter {
    constructor(logPath = "./logs/app.log") {
        super();
        this.logPath = logPath;

        if (!fs.existsSync(path.dirname(this.logPath))) {
            fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
        }

        this.writerStream = fs.createWriteStream(this.logPath, { flags: "a" });
        this.writerStream.on("error", (err) => {
            console.error("Помилка запису у файл:", err.message);
        });

        this.logTransformer = new LogTransformer();

        this.logTransformer.pipe(this.writerStream);

        this.on("log", (logObj) => {
            this.logTransformer.write(logObj);
        });
    }

    __log(level, msg) {
        if (process.env.APP_ENV === "local") {
            const timestamp = new Date().toISOString();
            let formattedMessage;
            switch (level) {
                case levels.INFO:
                    formattedMessage = chalk.blue(`[${timestamp}] INFO: ${msg}`);
                    break;
                case levels.WARNING:
                    formattedMessage = chalk.yellow(`[${timestamp}] WARNING: ${msg}`);
                    break;
                case levels.ERROR:
                    formattedMessage = chalk.red(`[${timestamp}] ERROR: ${msg}`);
                    break;
                default:
                    formattedMessage = chalk.gray(`[${timestamp}] UNKNOWN: ${msg}`);
                    break;
            }
            console.log(formattedMessage);
        } else {
            this.emit("log", { message: msg, type: level });
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
