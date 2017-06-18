import { ReviewCommentDocument } from "./documents/ReviewCommentDocument";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { GitHubUtil } from "../util/GitHubUtil";
import { EntityUtil } from "../util/EntityUtil";

/**
 * IReviewCommentEntity interface. Describes custom functionality for
 * Review Comment mongoose documents.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewCommentEntity extends IEntity<ReviewCommentDocument> {
    
    /** Gets Review Comment GitHub id. */
    id: number;

}

/**
 * Review Comment Entity.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentEntity extends AbstractEntity<ReviewCommentDocument> implements IReviewCommentEntity {

    /** 
     * Gets Review Comment GitHub id.
     * 
     * @returns review comment id.
     */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Transforms raw data to IReviewCommentEntity.
     * 
     * @param data  raw data.
     * @returns a review comment entity.
     */
    public static toEntity = (data: any): IReviewCommentEntity => {
        if (data) {
            let reviewCommentEntity: IReviewCommentEntity = new ReviewCommentEntity(<ReviewCommentDocument>data);
            reviewCommentEntity = <IReviewCommentEntity>EntityUtil.fillPullData(reviewCommentEntity);
            return reviewCommentEntity;
        }
        return null;
    }

    /**
     * Transforms raw data to IReviewCommentEntity array.
     * @param data  raw data.
     * @returns an array of review comment entities.
     */
    public static toReviewCommentEntityArray = (data: any[]): IReviewCommentEntity[] => {
        const reviewCommentEntityArray: IReviewCommentEntity[] = <IReviewCommentEntity[]>
            EntityUtil.toEntityArray(data, ReviewCommentEntity.toEntity);
        return reviewCommentEntityArray;
    }

}