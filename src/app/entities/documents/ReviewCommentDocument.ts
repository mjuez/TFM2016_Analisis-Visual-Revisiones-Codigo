import * as mongoose from "mongoose";

/**
 * Review Comment mongoose document.
 * Maps a Review Comment.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ReviewCommentDocument extends mongoose.Document {
    id: number,
    pull_request_review_id: number,
    pull_request_number: number,
    repository: {
        name: string,
        owner: string
    }
    diff_hunk: string,
    path: string,
    position: number,
    original_position: number,
    commit_id: string,
    original_commit_id: string,
    user: {
        login: string,
        id: number
    },
    body: string,
    created_at: Date,
    updated_at: Date,
    html_url: string,
    pull_request_url: string
}