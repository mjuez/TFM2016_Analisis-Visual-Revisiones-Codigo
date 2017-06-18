import * as mongoose from "mongoose";
import { AbstractSchema } from "./AbstractSchema";

/**
 * Review Schema class. Defines the schema for
 * a Review.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewSchema extends AbstractSchema {

    /** Review Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
        id: {
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
        user: {
            id: Number,
            login: {
                type: String,
                index: true
            }
        },
        body: String,
        commit_id: String,
        state: String,
        html_url: String,
        pull_request_url: String,
        submitted_at: Date
    };
    
}