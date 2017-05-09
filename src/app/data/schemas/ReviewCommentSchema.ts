import * as mongoose from "mongoose";

/**
 * Review Comment Schema class. Defines the schema for
 * a Review Comment.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewCommentSchema {

    /** Gets the Review Comment Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            url: String,
            id: Number,
            pull_request_review_id: Number,
            diff_hunk: String,
            path: String,
            position: Number,
            original_position: Number,
            commit_id: String,
            original_commit_id: String,
            user: Object,
            body: String,
            created_at: Date,
            updated_at: Date,
            html_url: String,
            pull_request_url: String,
            _links: Object
        });

        return schema;
    }

}