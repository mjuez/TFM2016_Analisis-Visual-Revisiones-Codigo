import { Router } from 'express';

export interface IController {
    readonly API_URL: string;
    readonly API_CREDENTIALS: string;
    router: Router;
}

export abstract class AbstractController implements IController {

    readonly API_URL: string = `https://api.github.com`;
    readonly API_CREDENTIALS: string = `?client_id=${process.env.ANVIRECO_ID}&client_secret=${process.env.ANVIRECO_SECRET}`;
    readonly API_HEADERS: Object = {
        "User-Agent": process.env.ANVIRECO_APPNAME
    }
    router: Router;

    constructor() {
        this.router = Router();
    }

}