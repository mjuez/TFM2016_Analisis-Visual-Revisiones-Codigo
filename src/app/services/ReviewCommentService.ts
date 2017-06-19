import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { AbstractMultiplePersistenceService } from "./AbstractPersistenceService";

/**
 * Review Comment service interface.
 * Describes services for getting review comments.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IReviewCommentService extends IMultiplePersistenceService<IReviewCommentEntity> { }

/**
 * Review Comment services implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentService extends AbstractMultiplePersistenceService<IReviewCommentRepository, IReviewCommentEntity> implements IReviewCommentService {

    /**
     * Class constructor with ReviewComment repository and
     * pull request service dependency injection.
     * 
     * @param repository    Injected ReviewComment repository.
     */
    constructor(repository: IReviewCommentRepository) {
        super(repository);
    }

    /**
     * Finds a persisted review comment by its id.
     *
     * @async 
     * @param entity    A in-memory review comment.
     * @returns the persisted review comment.
     */
    protected async findEntity(entity: IReviewCommentEntity): Promise<IReviewCommentEntity> {
        return await this._repository.findById(entity.id);
    }

}