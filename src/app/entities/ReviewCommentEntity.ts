import * as mongoose from "mongoose";
import { ReviewCommentDocument } from "./documents/ReviewCommentDocument";
import { ReviewCommentSchema } from "../data/schemas/ReviewCommentSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

/**
 * IReviewCommentEntity interface. Describes custom functionality for
 * Review Comment mongoose documents.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewCommentEntity extends IEntity<ReviewCommentDocument> {
    
}

/**
 * Review Comment Entity.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewCommentEntity extends AbstractEntity<ReviewCommentDocument> implements IReviewCommentEntity {

    /**
     * Transforms raw data to IReviewCommentEntity.
     * @param data  raw data.
     * @returns a review comment entity.
     */
    public static toEntity(data: any): IReviewCommentEntity {
        if (data) {
            let entity: IReviewCommentEntity = new ReviewCommentEntity(<ReviewCommentDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IReviewCommentEntity array.
     * @param data  raw data.
     * @returns an array of review comment entities.
     */
    public static toEntityArray(data: any[]): IReviewCommentEntity[] {
        let entityArray: IReviewCommentEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IReviewCommentEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}