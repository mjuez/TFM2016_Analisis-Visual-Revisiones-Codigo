import * as mongoose from "mongoose";

/**
 * Pull Request mongoose document.
 * Maps a GitHub Pull Request.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface PullRequestDocument extends mongoose.Document {
    id: number,
    html_url: string,
    number: number,
    state: string,
    title: string,
    body: string,
    assignees: [{
        id: number,
        login: string
    }],
    requested_reviewers: [{
        id: number,
        login: string
    }],
    milestone: {
        id: number,
        number: number,
        title: string,
        description: string,
        creator: {
            id: number,
            login: string
        },
        open_issues: number,
        closed_issues: number,
        state: string,
        created_at: Date,
        updated_at: Date,
        due_on: Date,
        closed_at: Date
    },
    locked: boolean,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    head: any,
    base: any,
    user: {
        id: number,
        login: string
    },
    merge_commit_sha: string,
    merged: boolean,
    mergeable: boolean,
    merged_by: Object,
    comments: number,
    reviews: number,
    review_comments: number,
    commits: number,
    additions: number,
    deletions: number,
    changed_files: number
}