import * as mongoose from "mongoose";
import { ReviewDocument } from "./documents/ReviewDocument";
import { ReviewSchema } from "../data/schemas/ReviewSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { GitHubUtil } from "../util/GitHubUtil";

/**
 * IReviewEntity interface. Describes custom functionality for
 * Review mongoose documents.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewEntity extends IEntity<ReviewDocument> {
    /** Gets Review GitHub id. */
    id: number;
}

/**
 * Review Entity.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewEntity extends AbstractEntity<ReviewDocument> implements IReviewEntity {

    /** @inheritdoc */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Transforms raw data to IReviewEntity.
     * @param data  raw data.
     * @returns a review entity.
     */
    public static toEntity(data: any): IReviewEntity {
        if (data) {
            let entity: IReviewEntity = new ReviewEntity(<ReviewDocument>data);
            if (entity.document.pull_request_number === undefined) {
                let pullData: any = GitHubUtil.getPullData(entity.document.pull_request_url);
                entity.document.pull_request_number = pullData.number;
                entity.document.repository = {
                    name: pullData.repository,
                    owner: pullData.owner
                };
            }
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IReviewEntity array.
     * @param data  raw data.
     * @returns an array of review entities.
     */
    public static toEntityArray(data: any[]): IReviewEntity[] {
        let entityArray: IReviewEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IReviewEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}