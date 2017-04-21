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
            id: Number,
            url: String,
            html_url: String,
            diff_url: String,
            patch_url: String,
            issue_url: String,
            commits_url: String,
            review_comments_url: String,
            review_comment_url: String,
            comments_url: String,
            statuses_url: String,
            number: Number,
            state: String,
            title: String,
            body: String,
            assignee: Object,
            milestone: Object,
            locked: Boolean,
            created_at: Date,
            updated_at: Date,
            closed_at: Date,
            merged_at: Date,
            head: Object,
            base: Object,
            _links: Object,
            user: Object,
            merge_commit_sha: String,
            merged: Boolean,
            mergeable: Boolean,
            merged_by: Object,
            comments: Number,
            commits: Number,
            additions: Number,
            deletions: Number,
            changed_files: Number,
            maintainer_can_modify: Boolean
        });

        return schema;
    }

}