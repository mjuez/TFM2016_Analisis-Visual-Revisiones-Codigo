import * as http from 'http';

export default class HelloWorldServer {

    private readonly PORT: number | string | boolean = this.normalizePort(process.env.PORT || 3000);
    private server: http.Server;

    constructor() {
        this.server = http.createServer(this.onRequest);
        this.server.listen(this.PORT);
    }

    public getServer(): http.Server {
        return this.server;
    }

    private onRequest(req: http.ServerRequest, res: http.ServerResponse): void {
        let helloWorld: Object = {
            "message": "Hello World!"
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(helloWorld));
    }

    private normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

}
