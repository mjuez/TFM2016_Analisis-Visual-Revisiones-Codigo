import * as mongoose from "mongoose";
import { AbstractSchema } from "./AbstractSchema";

/**
 * Compare Type for head and base declaration.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
const Compare: mongoose.Schema = new mongoose.Schema({
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
}, { _id: false });

/**
 * Pull Request Schema class. Defines the schema for
 * a Pull Request.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestSchema extends AbstractSchema {

    /** Pull Request Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
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
        head: Compare,
        base: Compare,
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
    };

}