// logger.js
import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { Transform } from "node:stream";
import chalk from "chalk";
import levels from "./levels.js"; // levels = { INFO: "info", WARNING: "warning", ERROR: "error" }

//
// Трансформер, який приймає об’єкт { message, type }
// та повертає форматований рядок із позначкою часу та кольоровим форматуванням
//
class LogTransformer extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });
  }

  _transform(chunk, encoding, callback) {
    // Очікуємо об’єкт виду: { message, type }
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
    // Повертаємо рядок із символом нового рядка
    callback(null, formattedMessage + "\n");
  }
}

//
// Logger, який використовує потоки для запису логів
//
class Logger extends EventEmitter {
  constructor(logPath = "./logs/app.log") {
    super();
    this.logPath = logPath;

    // Перевіряємо, чи існує директорія для логів, якщо ні – створюємо її
    if (!fs.existsSync(path.dirname(this.logPath))) {
      fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
    }

    // Створюємо writable stream для файлу логів (режим додавання)
    this.writerStream = fs.createWriteStream(this.logPath, { flags: "a" });
    this.writerStream.on("error", (err) => {
      console.error("Помилка запису у файл:", err.message);
    });

    // Створюємо трансформер, який форматуватиме повідомлення
    this.logTransformer = new LogTransformer();

    // Перетокуємо форматовані повідомлення у writerStream
    this.logTransformer.pipe(this.writerStream);

    // Використовуємо eventEmitter для отримання об'єктів логу,
    // які передаємо в трансформер
    this.on("log", (logObj) => {
      this.logTransformer.write(logObj);
    });
  }

  // Метод для логування. Якщо змінна оточення APP_ENV встановлена як "local",
  // виводимо лог у консоль, інакше – записуємо через потоки у файл.
  __log(level, msg) {
    if (process.env.APP_ENV === "local") {
      // Локальний режим: форматування безпосередньо для консолі
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
      // Не локальний режим: відправляємо об’єкт у трансформер через подію "log"
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
