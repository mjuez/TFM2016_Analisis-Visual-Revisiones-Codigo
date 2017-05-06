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
                enum:  ['ALL', 'REVIEWS', 'REVIEW_COMMENTS']
            },
            is_completed: Boolean,
            creation_date: Date,
            start_date: Date,
            end_date: Date,
            owner: String,
            repository: String,
            current_page: Number,
            parent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TaskRepository.COLLECTION_NAME
            },
            current_pull_request_number: Number
        });

        return schema;
    }

}