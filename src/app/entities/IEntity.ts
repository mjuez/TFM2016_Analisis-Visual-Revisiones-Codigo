import * as mongoose from "mongoose";

/**
 * IEntity interface.
 * Describes an entity, which contains a mongoose Document.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IEntity<T extends mongoose.Document> {

    /** The mongoose document. */
    document: T;
}