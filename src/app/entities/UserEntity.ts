import { UserDocument } from "./documents/UserDocument";
import { IEntity } from "./IEntity";
import { AbstractEntity } from "./AbstractEntity";
import { EntityUtil } from "../util/EntityUtil";

/**
 * IUserEntity interface. Describes custom functionality for
 * User mongoose documents.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUserEntity extends IEntity<UserDocument> {
    
    /** Gets User GitHub id. */
    id: number;

    /** Gets User login. */
    login: string;
}

/**
 * User Entity.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UserEntity extends AbstractEntity<UserDocument> implements IUserEntity {

    /** 
     * Gets user GitHub id.
     *
     * @returns user id.
     */
    public get id(): number {
        return this.document.id;
    }

    /** 
     * Gets user login.
     * 
     * @returns user login.
     */
    public get login(): string {
        return this.document.login;
    }

    /**
     * Transforms raw data to IUserEntity.
     * 
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
     * 
     * @param data  raw data.
     * @returns an array of user entities.
     */
    public static toUserEntityArray(data: any[]): IUserEntity[] {
        const userEntityArray: IUserEntity[] = <IUserEntity[]>
            EntityUtil.toEntityArray(data, UserEntity.toEntity);
        return userEntityArray;
    }

}