import * as http from 'http';

export default class HelloWorldServer {

    private readonly PORT: number | string | boolean = this.normalizePort(process.env.PORT || 3000);
    private readonly HEADER: Object = { "Content-Type": "application/json" };

    constructor() {
        let server: http.Server = http.createServer(this.onRequest);
        server.listen(this.PORT);
    }

    private onRequest(req: http.ServerRequest, res: http.ServerResponse): void {
        let helloWorld: Object = {
            "message": "Hello World!"
        }

        res.writeHead(200, this.HEADER);
        res.end(JSON.stringify(helloWorld));
    }

    private normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

}
