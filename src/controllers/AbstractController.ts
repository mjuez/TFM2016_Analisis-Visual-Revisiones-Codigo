import { Request, Response } from "express";
import { IPersistenceService } from "../app/services/IPersistenceService";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import { IServices } from "../app/services/IServices";

/**
 * Abstract Controller.
 * Implements shared functionality for other controllers.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractController {

    /** Services instances. */
    protected readonly _services: IServices;

    /**
     * Injects services instances.
     * @param services List of services instances.
     */
    constructor(services: IServices) {
        this._services = services;
    }

    /**
     * Sends an HTTP response with an ordered page of any entities.
     * If the page is empty it sends a 404 response.
     * 
     * @param req       Express request.
     * @param res       Express response.
     * @param service   A persistence service for getting the number of page.
     * @param handler   A handler for getting entities list.
     */
    protected getOrderedPage = async (req: Request, res: Response, service: IPersistenceService<any>, handler: any): Promise<void> => {
        const page: number = req.params.page;
        const direction: number = RoutesUtil.directionNameToNumber(req.params.direction);
        if (direction === 0) {
            RoutesUtil.notFoundResponse(res);
        }
        else {
            try {
                const entities: any[] = await handler(page, direction);
                const jsonEntities: Object[] = EntityUtil.toJSONArray(entities);
                const lastPage: number = await service.numPages();
                if (jsonEntities.length === 0) {
                    RoutesUtil.notFoundResponse(res);
                } else {
                    res.json({ data: jsonEntities, last_page: lastPage });
                }
            } catch (error) {
                console.log(error);
                RoutesUtil.errorResponse(res);
            }
        }
    }

}