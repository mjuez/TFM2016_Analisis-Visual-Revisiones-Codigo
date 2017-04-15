import * as mongoose from "mongoose";
import { PullRequestDocument } from "./documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";
import { AbstractEntity } from "./AbstractEntity";

export class PullRequestEntity extends AbstractEntity<PullRequestDocument> {
    
}