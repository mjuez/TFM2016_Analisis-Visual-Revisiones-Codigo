import * as mongoose from "mongoose";
import { PullRequestDocument } from "./documents/PullRequestDocument";
import { PullRequestSchema } from "../data/schemas/PullRequestSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

/**
 * IPullRequestEntity interface. Describes custom functionality for
 * Pull Request mongoose documents.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestEntity extends IEntity<PullRequestDocument> {
    /** Gets Pull Request GitHub id. */
    id: number;
}

/**
 * Pull Request Entity.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestEntity extends AbstractEntity<PullRequestDocument> implements IPullRequestEntity {

    /** @inheritdoc */
    public get id(): number {
        return this.document.id;
    }

}