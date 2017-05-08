import * as mongoose from "mongoose";

/**
 * Review mongoose document.
 * Maps a Review.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ReviewDocument extends mongoose.Document {
    id: number,
    user: Object,
    body: string,
    commit_id: string,
    state: string,
    html_url: string,
    pull_request_url: string,
    _links: Object
}