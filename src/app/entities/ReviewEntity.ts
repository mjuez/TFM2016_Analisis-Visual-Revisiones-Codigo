import * as mongoose from "mongoose";
import { ReviewDocument } from "./documents/ReviewDocument";
import { ReviewSchema } from "../data/schemas/ReviewSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

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
    public static toEntity(data: any, pullId: number = null): IReviewEntity {
        if (data) {
            if(data.pull_request_id === null){
                data.pull_request_id = pullId;
            }
            let entity: IReviewEntity = new ReviewEntity(<ReviewDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IReviewEntity array.
     * @param data  raw data.
     * @returns an array of review entities.
     */
    public static toEntityArray(data: any[], pullId: number = null): IReviewEntity[] {
        let entityArray: IReviewEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IReviewEntity = this.toEntity(jsonObject, pullId);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}