import * as mongoose from "mongoose"
import { IEntity } from "./IEntity";

/**
 * Abstract Entity class. Includes all functionality that every
 * entity should have.
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractEntity<T extends mongoose.Document> implements IEntity<T>{

    /** Mongoose Document. */
    private _document: T;

    /**
     * Class constructor. Sets the document.
     * @param document  a Mongoose Document.
     */
    constructor(document: T) {
        this._document = document;
    }

    /**
     * Gets the mongoose Document.
     */
    public get document(): T {
        return this._document;
    }

}