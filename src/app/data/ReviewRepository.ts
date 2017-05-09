import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { ReviewDocument } from "../entities/documents/ReviewDocument";
import { ReviewSchema } from "./schemas/ReviewSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as BluebirdPromise from "bluebird";
import * as mongoose from "mongoose";

/**
 * IReviewRepository interface.
 * Defines custom CRUD operations for a Review.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewRepository extends IRepository<IReviewEntity, ReviewDocument> {

    /**
     * Retrieves a list of reviews of a pull request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a list of review entities if resolved.
     */
    findByPullId(id: number): BluebirdPromise<IReviewEntity[]>;

    /**
     * Retrieves a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    findById(id: number): BluebirdPromise<IReviewEntity>;

}

/**
 * Review Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewRepository extends AbstractRepository<IReviewEntity, ReviewDocument> implements IReviewRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "review";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Review schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<ReviewDocument>) {
        super(ReviewRepository.COLLECTION_NAME, ReviewSchema.schema, model);
    }

    /**
     * Updates a Review from database. Uses its GitHub id.
     * @param item      Review entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: IReviewEntity): BluebirdPromise<number> {
        let promise: BluebirdPromise<number> = new BluebirdPromise<number>((resolve, reject) => {
            this.model.update({ id: item.id }, item.document, (error, rowsAffected) => {
                if (!error) {
                    resolve(rowsAffected);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves a list of reviews of a pull request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a list of review entities if resolved.
     */
    public findByPullId(id: number): BluebirdPromise<IReviewEntity[]> {
        let promise: BluebirdPromise<IReviewEntity[]> = new BluebirdPromise<IReviewEntity[]>((resolve, reject) => {
            this.model.find({ pull_request_id: id }, (error, result) => {
                if (!error) {
                    let entityArray: IReviewEntity[] = ReviewEntity.toEntityArray(result);
                    resolve(entityArray);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    public findById(id: number): BluebirdPromise<IReviewEntity> {
        let promise: BluebirdPromise<IReviewEntity> = new BluebirdPromise<IReviewEntity>((resolve, reject) => {
            this.model.find({ id: id }, (error, result) => {
                if (!error) {
                    let entity: IReviewEntity = ReviewEntity.toEntity(result[0]);
                    resolve(entity);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    protected convertToEntity(document: ReviewDocument): IReviewEntity {
        return ReviewEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: ReviewDocument[]): IReviewEntity[] {
        return ReviewEntity.toEntityArray(documentArray);
    }

}