import { IEntity } from "../entities/IEntity";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { GitHubUtil } from "./GitHubUtil";

export class EntityUtil {

    public static toJSONArray(entityArray: IEntity<any>[]): Object[] {
        let JSONArray: Object[] = [];
        entityArray.map((entity) => {
            JSONArray.push(entity.document);
        });
        return JSONArray;
    }

    public static toJSON(entity: IEntity<any>): Object[] {
        return entity.document;
    }

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
     * Transforms raw data to IReviewEntity array.
     * @param data  raw data.
     * @returns an array of review entities.
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