import * as mongoose from "mongoose";
import { TaskType } from "../../entities/enum/TaskType";
import { TaskRepository } from "../TaskRepository";

/**
 * Task Schema class. Defines the schema for
 * a Task.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskSchema {

    /** Gets the Task Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            type: {
                type: Number,
                enum: ['ALL', 'REVIEWS', 'REVIEW_COMMENTS', 'USERS', 'USERS_PULLS', 'USERS_REVIEWS', 'USERS_REVIEW_COMMENTS', 'REPOSITORY']
            },
            is_completed: Boolean,
            creation_date: Date,
            start_date: Date,
            end_date: Date,
            owner: String,
            repository: String,
            current_page: Number,
            current_local_page: Number,
            parent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TaskRepository.COLLECTION_NAME
            },
            last_processed: Number
        });

        return schema;
    }

}