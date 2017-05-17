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

    /**
     * Transforms raw data to IPullRequestEntity.
     * @param data  raw data.
     * @returns a pull request entity.
     */
    public static toEntity(data: any): IPullRequestEntity {
        if (data) {
            let entity: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>data);
            if(entity.document.reviews === undefined){
                entity.document.reviews = 0;
            }
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IPullRequestEntity array.
     * @param data  raw data.
     * @returns an array of pull request entities.
     */
    public static toEntityArray(data: any[]): IPullRequestEntity[] {
        let entityArray: IPullRequestEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IPullRequestEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}