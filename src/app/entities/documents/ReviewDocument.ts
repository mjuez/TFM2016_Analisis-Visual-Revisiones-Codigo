import * as mongoose from "mongoose";

/**
 * Review mongoose document.
 * Maps a Review.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ReviewDocument extends mongoose.Document {
    id: number,
    pull_request_id: number,
    user: {
        id: number,
        login: string
    },
    body: string,
    commit_id: string,
    state: string,
    html_url: string
}