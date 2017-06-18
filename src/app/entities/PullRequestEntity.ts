import * as mongoose from "mongoose";
import { PullRequestDocument } from "./documents/PullRequestDocument";
import { PullRequestSchema } from "../data/schemas/PullRequestSchema";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { EntityUtil } from "../util/EntityUtil";

/**
 * IPullRequestEntity interface. Describes custom functionality for
 * Pull Request mongoose documents.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IPullRequestEntity extends IEntity<PullRequestDocument> {

    /** Gets Pull Request GitHub id. */
    id: number;

}

/**
 * Pull Request Entity.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestEntity extends AbstractEntity<PullRequestDocument> implements IPullRequestEntity {

    /** 
     * Gets Pull Request GitHub id.
     * 
     * @returns pull request id.
     */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Transforms raw data to IPullRequestEntity.
     * 
     * @param data  raw data.
     * @returns a pull request entity.
     */
    public static toEntity(data: any): IPullRequestEntity {
        if (data) {
            let entity: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>data);
            if (entity.document.reviews === undefined) {
                entity.document.reviews = 0;
            }
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IPullRequestEntity array.
     * 
     * @param data  raw data.
     * @returns an array of pull request entities.
     */
    public static toPullRequestEntityArray(data: any[]): IPullRequestEntity[] {
        const pullRequestEntityArray: IPullRequestEntity[] = <IPullRequestEntity[]>
            EntityUtil.toEntityArray(data, PullRequestEntity.toEntity);
        return pullRequestEntityArray;
    }

}