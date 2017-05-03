import * as mongoose from "mongoose";

/**
 * Task mongoose document.
 * Maps a Task.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface TaskDocument extends mongoose.Document {
    is_completed: boolean,
    creation_date: Date,
    start_date: Date,
    end_date: Date,
    owner: string,
    repository: string,
    current_page: number
}

// WILL BE USED IN THE FUTURE
export interface SubTaskDocument extends TaskDocument {
    parent_id: any,
    pull_request_number: number
}