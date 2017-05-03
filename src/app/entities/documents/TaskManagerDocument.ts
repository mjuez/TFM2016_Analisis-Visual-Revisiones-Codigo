import * as mongoose from "mongoose";

export interface TaskManagerStatus {
    running: boolean,
    error?: {
        code: number,
        message: string
        continue_at: number
    }
}

export interface TaskManagerDocument extends mongoose.Document {
    current_task_id: any,
    status: TaskManagerStatus
}