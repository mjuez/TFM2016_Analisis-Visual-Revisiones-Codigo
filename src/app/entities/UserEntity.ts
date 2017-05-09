import * as mongoose from "mongoose";
import { UserDocument } from "./documents/UserDocument";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";

/**
 * IUserEntity interface. Describes custom functionality for
 * User mongoose documents.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IUserEntity extends IEntity<UserDocument> {
    /** Gets User GitHub id. */
    id: number;

    /** Gets User login. */
    login: string;
}

/**
 * User Entity.
 * @author Mario Juez <mario@mjuez.com>
 */
export class UserEntity extends AbstractEntity<UserDocument> implements IUserEntity {

    /** @inheritdoc */
    public get id(): number {
        return this.document.id;
    }

    /** @inheritdoc */
    public get login(): string {
        return this.document.login;
    }

    /**
     * Transforms raw data to IUserEntity.
     * @param data  raw data.
     * @returns a user entity.
     */
    public static toEntity(data: any): IUserEntity {
        if (data) {
            let entity: IUserEntity = new UserEntity(<UserDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to IUserEntity array.
     * @param data  raw data.
     * @returns an array of user entities.
     */
    public static toEntityArray(data: any[]): IUserEntity[] {
        let entityArray: IUserEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IUserEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}