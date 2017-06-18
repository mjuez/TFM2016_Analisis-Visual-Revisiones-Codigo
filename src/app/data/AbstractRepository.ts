import * as mongoose from "mongoose";
import { IRepository, RetrieveOptions } from "./IRepository";
import { IEntity } from "../entities/IEntity";

/**
 * Abstract Repository class. Includes all functionality that every
 * repository should have (shared CRUD functionality).
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractRepository<T extends IEntity<E>, E extends mongoose.Document> implements IRepository<T, E> {

    /** Mongoose Model (repository). */
    private readonly _model: mongoose.Model<E>;

    /** Maximum results per page (100). */
    public static readonly RESULTS_PER_PAGE: number = 100;

    /**
     * Class constructor. Creates a Mongoose Model given
     * a name and a schema.
     * 
     * @param name      Mongoose collection name.
     * @param schema    Mongoose entity schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(name: string, schema: mongoose.Schema, model?: mongoose.Model<E>) {
        if (model) {
            this._model = model;
        } else {
            try {
                this._model = mongoose.model<E>(name);
            } catch (error) {
                this._model = mongoose.model<E>(name, schema);
            }
        }
    }

    /** 
     * Gets the Mongoose Model.
     * 
     * @returns the mongoose model.
     */
    public get model(): mongoose.Model<E> {
        return this._model;
    }

    /**
     * Creates an item into database.
     * 
     * @param item      Item to create.
     * @returns the created item.
     */
    public async create(item: T): Promise<T> {
        try {
            let persistedDocument: E = await this.model.create(item.document);
            let entity: T = this.convertToEntity(persistedDocument);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates an item.
     * 
     * @param item      Item with updated data.
     * @returns number of rows affected.
     */
    public async update(item: T): Promise<number> {
        try {
            let result: any = await this.model.update(this.updateFilter(item), item.document);
            return result.nModified;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a single entity from database.
     * @param filter    filtering options.
     * 
     * @returns one entity.
     */
    public async findOne(filter: Object): Promise<T> {
        try {
            let document: E = await this.model.findOne(filter);
            let entity: T = this.convertToEntity(document);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Counts the number of entities in database
     * given an optional filter.
     * 
     * @param filter    Optional filtering options.
     * @returns the number of entities.
     */
    public count(filter: Object = {}): mongoose.Query<number> {
        return this.model.count(filter);
    }

    /**
     * Removes elements that match a filter from database.
     * 
     * @param filter filtering options.
     */
    public async remove(filter: Object = {}): Promise<void> {
        try {
            await this.model.remove(filter);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves elements from database given a list of
     * retrieving options like filtering, sorting...
     * 
     * @param options   Retrieving options.
     * @returns an array of entities.
     */
    public async retrieve({ 
        filter = {},
        page,
        startingFrom = 0,
        where = 'id',
        sort = { id: 1 },
        select = '' }: RetrieveOptions = {}): Promise<T[]> {
            
        try {
            if (page === undefined) {
                return await this._retrieveAll({ filter, page, startingFrom, where, sort, select });
            } else {
                return await this._retrievePage({ filter, startingFrom, where, sort, select });
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Counts the number of pages given a filter, and
     * a starting from value.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @param where         field where start from.
     * @returns number of pages.
     */
    protected async _numPages(filter: Object, startingFrom: number, where: string): Promise<number> {
        try {
            let numResults: number = await this.count(filter)
                .where(where).gt(startingFrom);
            return Math.ceil(numResults / AbstractRepository.RESULTS_PER_PAGE);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves an array of elements without pagination.
     * 
     * @param options Retrieving options.
     * @returns an array of entities.
     */
    private async _retrieveAll(options: RetrieveOptions): Promise<T[]> {
        try {
            const documentArray: E[] = await this._retrieveArray(options);
            const entityArray: T[] = this.convertToEntityArray(documentArray);
            return entityArray;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves an array with a page of elements.
     * 
     * @param options Retrieving options.
     * @returns an array of entities.
     */
    private async _retrievePage(options: RetrieveOptions): Promise<T[]> {
        try {
            let skip: number = (options.page - 1) * AbstractRepository.RESULTS_PER_PAGE;
            let documentArray: E[] =
                await this._retrieveArray(options)
                    .skip(skip)
                    .limit(AbstractRepository.RESULTS_PER_PAGE);
            let entityArray: T[] = this.convertToEntityArray(documentArray);
            return entityArray;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Document query creation given retrieving options.
     * 
     * @param options Retrieving options.
     * @returns mongoose document query.
     */
    private _retrieveArray(options: RetrieveOptions): mongoose.DocumentQuery<E[], E> {
        return this.model.find(options.filter)
            .where(options.where)
            .gt(options.startingFrom)
            .sort(options.sort)
            .select(options.select);
    }

    /**
     * Template method.
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    public abstract async numPages(filter: Object, startingFrom: number): Promise<number>;

    /**
     * Template method.
     * Retrieves an array of entities from database given
     * retrieving options.
     * 
     * @param options   retrieving options.
     * @returns an array of entities.
     
    public abstract async retrieve(options: RetrieveOptions): Promise<T[]>;*/

    /**
     * Template method.
     * Converts a mongoose document to an entity.
     * 
     * @param document mongoose document.
     * @returns an entity.
     */
    protected abstract convertToEntity(document: E): T;

    /**
     * Template method.
     * Converts a mongoose document array to an entity array.
     * 
     * @param documentArray mongoose document array.
     * @returns an array of entities.
     */
    protected abstract convertToEntityArray(documentArray: E[]): T[];

    /**
     * Template method.
     * Creates a filter for updating an entity.
     * 
     * @param item entity with data to create the update filter.
     * @return update filter.
     */
    protected abstract updateFilter(item: T): Object;

}