import * as mongoose from "mongoose";

/**
 * Task manager Schema class. Defines the schema for
 * the Task manager.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerSchema {

    /** Gets the Task manager Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            current_task_id: mongoose.Schema.Types.ObjectId,
            status: Object
        });

        return schema;
    }

}