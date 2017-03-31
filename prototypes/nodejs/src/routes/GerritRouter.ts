import { Router, Request, Response, NextFunction } from 'express';
import * as request from 'request';

export class GerritRouter {

    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    public getChange(req: Request, res: Response, next: NextFunction) {
        let repository = req.params.repository;
        let change = parseInt(req.params.change);
        request(`https://${repository}/changes/${change}`, (error, response, body) => {
            res.status(200).json(JSON.parse(body.replace(")]}'", "")));
        });
    }

    private init() {
        this.router.get('/r/:repository/c/:change', this.getChange);
    }

}

export default new GerritRouter().router;