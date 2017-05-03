import * as mongoose from "mongoose";
import { TaskType } from "../../entities/enum/TaskType";

/**
 * Task Schema class. Defines the schema for
 * a Task.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskSchema {

    /** Gets the Task Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            type: TaskType,
            is_completed: Boolean,
            creation_date: Date,
            start_date: Date,
            end_date: Date,
            owner: String,
            repository: String,
            current_page: Number,
            parent_id: mongoose.Schema.Types.ObjectId,
            current_pull_request_number: Number
        });

        return schema;
    }

}