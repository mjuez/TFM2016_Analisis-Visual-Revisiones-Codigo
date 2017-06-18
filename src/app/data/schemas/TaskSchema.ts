import * as mongoose from "mongoose";
import { TaskRepository } from "../TaskRepository";
import { AbstractSchema } from "./AbstractSchema";

/**
 * Task Schema class. Defines the schema for
 * a Task.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class TaskSchema extends AbstractSchema {

    /** Task Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
        type: {
            type: Number,
            enum: ['ALL', 'PULL_REQUESTS', 'REVIEWS', 'REVIEW_COMMENTS', 'USERS', 'USERS_PULLS', 'USERS_REVIEWS', 'USERS_REVIEW_COMMENTS', 'REPOSITORY']
        },
        is_completed: Boolean,
        creation_date: Date,
        start_date: Date,
        end_date: Date,
        owner: String,
        repository: String,
        current_page: {
            type: Number,
            default: 1
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TaskRepository.COLLECTION_NAME
        },
        last_processed: Number
    };

}