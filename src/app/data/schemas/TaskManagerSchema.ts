import * as mongoose from "mongoose";
import { TaskManagerRepository } from "../TaskManagerRepository"

/**
 * Task manager Schema class. Defines the schema for
 * the Task manager.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerSchema {

    /** Gets the Task manager Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            current_task: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TaskManagerRepository.COLLECTION_NAME
            },
            error: {
                type: Object, required: false
            }
        });

        return schema;
    }

}