import * as mongoose from "mongoose";

export interface TaskManagerError {
    code: number,
    message: Object
    continue_at: number
}

export interface TaskManagerDocument extends mongoose.Document {
    current_task: any,
    error?: TaskManagerError
}