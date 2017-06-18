import * as mongoose from "mongoose";
import { AbstractSchema } from "./AbstractSchema";

/**
 * Repository Schema class. Defines the schema for
 * a Repository.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositorySchema extends AbstractSchema {

    /** Repository Schema definition. */
    protected static _schemaDefinition: mongoose.SchemaDefinition = {
        id: {
            type: Number,
            index: true
        },
        owner: {
            login: String,
            id: Number
        },
        name: String,
        full_name: String,
        description: String,
        private: Boolean,
        fork: Boolean,
        html_url: String,
        language: String,
        forks_count: Number,
        stargazers_count: Number,
        watchers_count: Number,
        suscribers_count: Number,
        network_count: Number,
        size: Number,
        default_branch: String,
        open_issues_count: Number,
        pull_requests_count: {
            type: Number,
            default: 0
        },
        reviews_count: {
            type: Number,
            default: 0
        },
        review_comments_count: {
            type: Number,
            default: 0
        },
        topics: [String],
        pushed_at: Date,
        created_at: Date,
        updated_at: Date
    };

}