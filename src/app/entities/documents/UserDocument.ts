import * as mongoose from "mongoose";

/**
 * User mongoose document.
 * Maps an User.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface UserDocument extends mongoose.Document {
    login: string,
    id: number,
    html_url: string,
    type: string,
    name: string,
    public_repos: number,
    public_gists: number,
    followers: number,
    following: number,
    created_at: Date,
    updated_at: Date,
    updated_on_task: any,
    pull_request_count: number,
    reviews_count: number,
    reviews_accepted_count: number,
    reviews_commented_count: number,
    reviews_requested_changes_count: number,
    review_comments_count: number
}