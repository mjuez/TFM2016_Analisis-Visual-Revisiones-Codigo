import * as mongoose from "mongoose";
import { AbstractSchema } from "./AbstractSchema";

/**
 * User Schema class. Defines the schema for
 * a User.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UserSchema extends AbstractSchema {

    /** User Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
        login: String,
        id: {
            type: Number,
            index: true
        },
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
        pull_request_count: {
            type: Number,
            default: 0
        },
        reviews_count: {
            type: Number,
            default: 0
        },
        reviews_approved_count: {
            type: Number,
            default: 0
        },
        reviews_commented_count: {
            type: Number,
            default: 0
        },
        reviews_changes_requested_count: {
            type: Number,
            default: 0
        },
        reviews_dismissed_count: {
            type: Number,
            default: 0
        },
        review_comments_count: {
            type: Number,
            default: 0
        }
    };

}