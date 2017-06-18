import * as mongoose from "mongoose";
import { RepositoryDocument } from "./documents/RepositoryDocument";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

/**
 * IRepositoryEntity interface. Describes custom functionality for
 * Rpository mongoose documents.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IRepositoryEntity extends IEntity<RepositoryDocument> {
    
    /** Gets Repository GitHub id. */
    id: number;

    /** Gets Repository name. */
    name: string;

}

/**
 * Repository Entity.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositoryEntity extends AbstractEntity<RepositoryDocument> implements IRepositoryEntity {

    /**
     * Gets Repository GitHub id.
     * 
     * @returns repository id.
     */
    public get id(): number {
        return this.document.id;
    }

    /**
     * Gets Repository name.
     * 
     * @returns repository name.
     */
    public get name(): string {
        return this.document.name;
    }

    /**
     * Transforms raw data to IRepositoryEntity.
     * 
     * @param data  raw data.
     * @returns a repository entity.
     */
    public static toEntity(data: any): IRepositoryEntity {
        if (data) {
            let entity: IRepositoryEntity = new RepositoryEntity(<RepositoryDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IRepositoryEntity array.
     * 
     * @param data  raw data.
     * @returns an array of repository entities.
     */
    public static toEntityArray(data: any[]): IRepositoryEntity[] {
        let entityArray: IRepositoryEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IRepositoryEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}