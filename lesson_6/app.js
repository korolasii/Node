import http from "node:http";
import fs from "node:fs/promises";

const APP_PORT = 3000;

const server = http.createServer(async (request, response) => {
    console.log("URL:", request.url, "Method:", request.method, "Headers:", request.headers);

    try {
        const logEntry = `${new Date().toISOString()} - ${request.method} ${request.url}\n`;
        await fs.appendFile("http-data.txt", logEntry, "utf8");
    } catch (error) {
        console.error("Ошибка при записи в файл:", error);
    }

    if (Math.random() < 0.1) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Internal Server Error" }));
        return;
    }

    const delay = Math.floor(Math.random() * 2000) + 1000;
    setTimeout(() => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Success" }));
    }, delay);
});

server.listen(APP_PORT, () => {
    console.log(`Server is listening on port ${APP_PORT}`);
});
