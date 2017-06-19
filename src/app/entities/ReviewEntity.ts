import { ReviewDocument } from "./documents/ReviewDocument";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { EntityUtil } from "../util/EntityUtil";

/**
 * IReviewEntity interface. Describes custom functionality for
 * Review mongoose documents.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewEntity extends IEntity<ReviewDocument> {
    
    /** Gets Review GitHub id. */
    id: number;

}

/**
 * Review Entity.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewEntity extends AbstractEntity<ReviewDocument> implements IReviewEntity {

    /** 
     * Gets Review GitHub id.
     * 
     * @returns review id.
     */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Transforms raw data to IReviewEntity.
     * 
     * @param data  raw data.
     * @returns a review entity.
     */
    public static toEntity = (data: any): IReviewEntity => {
        if (data) {
            let reviewEntity: IReviewEntity = new ReviewEntity(<ReviewDocument>data);
            reviewEntity = <IReviewEntity>EntityUtil.fillPullData(reviewEntity);
            return reviewEntity;
        }
        return null;
    }

    /**
     * Transforms raw data to IReviewEntity array.
     * 
     * @param data  raw data.
     * @returns an array of review entities.
     */
    public static toReviewEntityArray = (data: any[]): IReviewEntity[] => {
        const reviewEntityArray: IReviewEntity[] = <IReviewEntity[]>
            EntityUtil.toEntityArray(data, ReviewEntity.toEntity);
        return reviewEntityArray;
    }

}