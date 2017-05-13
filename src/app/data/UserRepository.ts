import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IUserEntity, UserEntity } from "../entities/UserEntity";
import { UserDocument } from "../entities/documents/UserDocument";
import { UserSchema } from "./schemas/UserSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as mongoose from "mongoose";

/**
 * IUserRepository interface.
 * Defines custom CRUD operations for an User.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IUserRepository extends IRepository<IUserEntity, UserDocument> {

    /**
     * Retrieves an user given its GitHub id.
     * @param id    User GitHub id.
     * @returns a promise that returns an user entity if resolved.
     */
    findById(id: number): Promise<IUserEntity>;

    /**
     * Retrieves an user given its login.
     * @param login User login.
     * @returns a promise that returns an user entity if resolved.
     */
    findByLogin(login: string): Promise<IUserEntity>;

}

/**
 * User Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class UserRepository extends AbstractRepository<IUserEntity, UserDocument> implements IUserRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "user";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the User schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<UserDocument>) {
        super(UserRepository.COLLECTION_NAME, UserSchema.schema, model);
    }

    /**
     * Updates a User from database. Uses its GitHub id.
     * @param item      User entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: IUserEntity): Promise<number> {
        let promise: Promise<number> = new Promise<number>((resolve, reject) => {
            this.model.update({ id: item.id }, item.document, (error, rowsAffected) => {
                if (!error) {
                    resolve(rowsAffected);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves an user given its GitHub id.
     * @param id    User GitHub id.
     * @returns a promise that returns an user entity if resolved.
     */
    public findById(id: number): Promise<IUserEntity> {
        return this.findOne({ id: id });
    }

    /**
     * Retrieves an user given its login.
     * @param login User login.
     * @returns a promise that returns an user entity if resolved.
     */
    public findByLogin(login: string): Promise<IUserEntity> {
        return this.findOne({ login: login });
    }

    /**
     * Retrieves an user given a filter.
     * @param filter User filter.
     * @returns a promise that returns an user entity if resolved.
     */
    private findOne(filter: Object): Promise<IUserEntity> {
        let promise: Promise<IUserEntity> = new Promise<IUserEntity>((resolve, reject) => {
            this.model.find(filter, (error, result) => {
                if (!error) {
                    let entity: IUserEntity = UserEntity.toEntity(result[0]);
                    resolve(entity);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    protected convertToEntity(document: UserDocument): IUserEntity {
        return UserEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: UserDocument[]): IUserEntity[] {
        return UserEntity.toEntityArray(documentArray);
    }

}