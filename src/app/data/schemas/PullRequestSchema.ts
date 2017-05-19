import * as mongoose from "mongoose";

/**
 * Pull Request Schema class. Defines the schema for
 * a Pull Request.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestSchema {

    /** Gets the Pull Request Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            id: {
                type: Number,
                index: true
            },
            html_url: String,
            number: {
                type: Number,
                index: true
            },
            state: String,
            title: String,
            body: String,
            assignees: [{
                id: Number,
                login: String
            }],
            requested_reviewers: [{
                id: Number,
                login: String
            }],
            milestone: {
                id: Number,
                number: Number,
                title: String,
                description: String,
                creator: {
                    id: Number,
                    login: String
                },
                open_issues: Number,
                closed_issues: Number,
                state: String,
                created_at: Date,
                updated_at: Date,
                due_on: Date,
                closed_at: Date
            },
            locked: Boolean,
            created_at: Date,
            updated_at: Date,
            closed_at: Date,
            merged_at: Date,
            head: {
                repo: {
                    id: Number,
                    name: String,
                    owner: {
                        id: Number,
                        login: String
                    }
                },
                user: {
                    id: Number,
                    login: String
                }
            },
            base: {
                repo: {
                    id: Number,
                    name: String,
                    owner: {
                        id: Number,
                        login: String
                    }
                },
                user: {
                    id: Number,
                    login: String
                }
            },
            user: {
                id: Number,
                login: String
            },
            merge_commit_sha: String,
            merged: Boolean,
            mergeable: Boolean,
            merged_by: Object,
            comments: Number,
            reviews: {
                type: Number,
                default: 0
            },
            review_comments: {
                type: Number,
                default: 0
            },
            commits: Number,
            additions: Number,
            deletions: Number,
            changed_files: Number
        });

        return schema;
    }

}