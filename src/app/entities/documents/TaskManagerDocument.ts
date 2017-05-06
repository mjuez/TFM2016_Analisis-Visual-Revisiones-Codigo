import * as mongoose from "mongoose";

export interface TaskManagerError {
    code: number,
    message: string
    continue_at: number
}

export interface TaskManagerDocument extends mongoose.Document {
    current_task: any,
    error?: TaskManagerError
}