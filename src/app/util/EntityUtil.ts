import { IEntity } from "../entities/IEntity";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { GitHubUtil } from "./GitHubUtil";

/**
 * Entities utilities.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export class EntityUtil {

    /**
     * Converts an entity to a JSON object.
     * 
     * @param entity    a generic entity.
     * @returns a JSON Object with entity data.
     */
    public static toJSON(entity: IEntity<any>): Object {
        return entity.document;
    }
    
    /**
     * Converts a list of entities to a list
     * of JSON objects.
     * 
     * @param entityArray a generic entities array.
     * @return a list of JSON objects.
     */
    public static toJSONArray(entityArray: IEntity<any>[]): Object[] {
        let JSONArray: Object[] = [];
        entityArray.map((entity) => {
            JSONArray.push(entity.document);
        });
        return JSONArray;
    }

    /**
     * Fills pull request data of a review entity
     * or a review comment entity.
     * The pull request data is its number and
     * repository (owner/name).
     * 
     * @param entity    an entity to fill its
     *                  pull request data.
     * @returns the entity with pull request data.
     */
    public static fillPullData(entity: IReviewEntity | IReviewCommentEntity): IReviewEntity | IReviewCommentEntity {
        if (entity.document.pull_request_number === undefined) {
            const pullData: any = GitHubUtil.getPullData(entity.document.pull_request_url);
            entity.document.pull_request_number = pullData.number;
            entity.document.repository = {
                name: pullData.repository,
                owner: pullData.owner
            };
        }
        return entity;
    }

    /**
     * Transforms raw data to entities array.
     * 
     * @param data  raw data.
     * @returns an array of entities.
     */
    public static toEntityArray = (data: any[], toEntityHandler: any): IEntity<any>[] => {
        let entityArray: IEntity<any>[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                const entity: IEntity<any> = toEntityHandler(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}