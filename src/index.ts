import * as http from "http";
import App from "./App";

/**
 * Anvireco Server.
 * Configures an HTTP server for the application.
 * @author Mario Juez <mario@mjuez.com>
 */
class AnvirecoServer {

    /**
     * Server port.
     */
    private readonly _PORT = this.normalizePort(process.env.PORT || 3000);

    /**
     * Server instance.
     */
    private readonly _server: http.Server;

    /**
     * Creates an Anvireco Server.
     */
    constructor() {
        App.set("port", this._PORT);
        this._server = http.createServer();
    }

    /**
     * Starts the server.
     * Listens to a port and sets error and listening handlers.
     */
    public start(): void {
        this._server.listen(this._PORT);
        this._server.on("error", (err: NodeJS.ErrnoException) => { this.onError(err) });
        this._server.on("listening", () => { this.onListening() });
    }

    /**
     * Helper function to normalize a port value.
     * @param val   Value to normalize.
     * @returns     Normalized port.
     */
    private normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

    /**
     * Server error handler.
     * @param error a NodeJS exception.
     */
    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') throw error;
        let bind = (typeof this._PORT === 'string') ? 'Pipe ' + this._PORT : 'Port ' + this._PORT;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Server listening handler.
     */
    private onListening(): void {
        let addr = this._server.address();
        let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    }

}

new AnvirecoServer().start();
