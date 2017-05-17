import * as mongoose from "mongoose";

/**
 * User Schema class. Defines the schema for
 * a User.
 * @author Mario Juez <mario@mjuez.com>
 */
export class UserSchema {

    /** Gets the User Schema. */
    public static get schema(): mongoose.Schema {
        let schema = new mongoose.Schema({
            login: String,
            id: Number,
            html_url: String,
            type: String,
            name: String,
            public_repos: Number,
            public_gists: Number,
            followers: Number,
            following: Number,
            created_at: Date,
            updated_at: Date,
            updated_on_task: mongoose.Schema.Types.ObjectId,
            pull_request_count: Number,
            reviews_count: Number,
            reviews_accepted_count: Number,
            reviews_commented_count: Number,
            reviews_requested_changes_count: Number,
            review_comments_count: Number
        });

        return schema;
    }

}