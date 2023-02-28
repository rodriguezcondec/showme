import express from "express"
import path from "path"
import http from "http"
import https from "https"
import fs from "fs"

const port: number = 3000
let useSsl: boolean = true;

if (process.argv.length > 2 && process.argv[2] == 'http') {
    console.log('Do not use secure SSL server');
    useSsl = false;
}

class App {
    private server: http.Server
    private port: number

    constructor(port: number) {
        this.port = port;
        const app = express();
        app.use(express.static(path.join(__dirname, '../client')));

        if (useSsl) {
            const options = {
                key: fs.readFileSync('./config/key.pem'),
                cert: fs.readFileSync('./config/cert.pem')
            };
            this.server = https.createServer(options, app);
        } else {
            this.server = new http.Server(app);
        }
    }

    public Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        })
    }
}

new App(port).Start()