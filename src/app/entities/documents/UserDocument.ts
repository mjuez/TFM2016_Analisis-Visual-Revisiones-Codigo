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
    reviews_approved_count: number,
    reviews_commented_count: number,
    reviews_changes_requested_count: number,
    reviews_dismissed_count: number,
    review_comments_count: number
}