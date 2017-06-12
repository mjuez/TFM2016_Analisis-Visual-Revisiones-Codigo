import * as mongoose from "mongoose";

/**
 * Rpository mongoose document.
 * Maps a Repository.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface RepositoryDocument extends mongoose.Document {
    id: number,
    owner: {
        login: string,
        id: number
    },
    name: string,
    full_name: string,
    description: string,
    private: boolean,
    fork: boolean,
    html_url: string,
    language: string,
    forks_count: number,
    stargazers_count: number,
    watchers_count: number,
    suscribers_count: number,
    network_count: number,
    size: number,
    default_branch: string,
    open_issues_count: number,
    pull_requests_count: number,
    reviews_count: number,
    review_comments_count: number,
    topics: [string],
    pushed_at: Date,
    created_at: Date,
    updated_at: Date
}