import * as mongoose from "mongoose";
import { AbstractSchema } from "./AbstractSchema";

/**
 * Review Comment Schema class. Defines the schema for
 * a Review Comment.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentSchema extends AbstractSchema {

    /** Review Comment Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
        id: {
            type: Number,
            index: true
        },
        pull_request_review_id: {
            type: Number,
            index: true
        },
        pull_request_number: {
            type: Number,
            index: true
        },
        repository: {
            name: String,
            owner: String
        },
        diff_hunk: String,
        path: String,
        position: Number,
        original_position: Number,
        commit_id: String,
        original_commit_id: String,
        user: {
            login: {
                type: String,
                index: true
            },
            id: Number
        },
        body: String,
        created_at: Date,
        updated_at: Date,
        html_url: String,
        pull_request_url: String
    };

}