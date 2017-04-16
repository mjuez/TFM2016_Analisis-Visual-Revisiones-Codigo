import * as mongoose from "mongoose";
import { PullRequestDocument } from "./documents/PullRequestDocument";
import { PullRequestSchema } from "../data/schemas/PullRequestSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

export interface IPullRequestEntity extends IEntity<PullRequestDocument> {
    id: number;
}

export class PullRequestEntity extends AbstractEntity<PullRequestDocument> implements IPullRequestEntity {
    
    public get id(): number {
        return this.document.id;
    }

}