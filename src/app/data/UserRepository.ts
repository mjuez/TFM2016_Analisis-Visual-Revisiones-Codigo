import { IRepository, RetrieveOptions } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IUserEntity, UserEntity } from "../entities/UserEntity";
import { UserDocument } from "../entities/documents/UserDocument";
import { UserSchema } from "./schemas/UserSchema";
import * as mongoose from "mongoose";

/**
 * IUserRepository interface.
 * Defines custom CRUD operations for an User.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUserRepository extends IRepository<IUserEntity, UserDocument> {

    /**
     * Retrieves an user given its GitHub id.
     * 
     * @param id    User GitHub id.
     * @returns an user entity.
     */
    findById(id: number): Promise<IUserEntity>;

    /**
     * Retrieves an user given its login.
     * 
     * @param login User login.
     * @returns an user entity.
     */
    findByLogin(login: string): Promise<IUserEntity>;

}

/**
 * User Repository class.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UserRepository extends AbstractRepository<IUserEntity, UserDocument> implements IUserRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "user";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the User schema.
     * 
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<UserDocument>) {
        super(UserRepository.COLLECTION_NAME, UserSchema.schema, model);
    }

    /**
     * Retrieves an user given its GitHub id.
     * 
     * @param id    User GitHub id.
     * @returns an user entity.
     */
    public findById(id: number): Promise<IUserEntity> {
        return this.findOne({ id: id });
    }

    /**
     * Retrieves an user given its login.
     * 
     * @param login User login.
     * @returns an user entity.
     */
    public findByLogin(login: string): Promise<IUserEntity> {
        return this.findOne({ login: login });
    }

    /**
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * It allows to count the number of pages starting
     * from a specific user id.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id');
    }

    /**
     * Converts an user document to a
     * user entity.
     * 
     * @param document  user document.
     * @returns an user entity.
     */
    protected convertToEntity(document: UserDocument): IUserEntity {
        return UserEntity.toEntity(document);
    }

    /**
     * Converts an user document array to an
     * array of user entities.
     * 
     * @param documentArray user document array.
     * @returns an user entity array.
     */
    protected convertToEntityArray(documentArray: UserDocument[]): IUserEntity[] {
        return UserEntity.toUserEntityArray(documentArray);
    }

    /**
     * Creates a filter for updating an user entity.
     * The filter sets the id field as the user id.
     * 
     * @param item  user entity.
     * @return update filter.
     */
    protected updateFilter(item: IUserEntity): Object {
        return { id: item.id };
    }

}