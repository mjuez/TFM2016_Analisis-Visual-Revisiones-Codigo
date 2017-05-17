import * as mongoose from "mongoose";
import { ReviewCommentDocument } from "./documents/ReviewCommentDocument";
import { ReviewCommentSchema } from "../data/schemas/ReviewCommentSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { GitHubUtil } from "../util/GitHubUtil";

/**
 * IReviewCommentEntity interface. Describes custom functionality for
 * Review Comment mongoose documents.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewCommentEntity extends IEntity<ReviewCommentDocument> {
    /** Gets Review Comment GitHub id. */
    id: number;
}

/**
 * Review Comment Entity.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewCommentEntity extends AbstractEntity<ReviewCommentDocument> implements IReviewCommentEntity {

    /** @inheritdoc */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Transforms raw data to IReviewCommentEntity.
     * @param data  raw data.
     * @returns a review comment entity.
     */
    public static toEntity(data: any): IReviewCommentEntity {
        if (data) {
            let entity: IReviewCommentEntity = new ReviewCommentEntity(<ReviewCommentDocument>data);
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