import { IRepository, RetrieveOptions } from "../data/IRepository";
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

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id');
    }

    protected convertToEntity(document: UserDocument): IUserEntity {
        return UserEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: UserDocument[]): IUserEntity[] {
        return UserEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: IUserEntity): Object {
        return { id: item.id };
    }

}