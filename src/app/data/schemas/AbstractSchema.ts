import * as mongoose from "mongoose";

/**
 * Abstract Schema.
 * Defines the shared functionality of schema creation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractSchema {

    /** Schema definition template. */
    protected static _schemaDefinition: mongoose.SchemaDefinition;

    /** 
     * Gets the schema.
     * @returns a mongoose schema.
     */
    public static get schema(): mongoose.Schema {
        const schema = new mongoose.Schema(this._schemaDefinition);
        return schema;
    }
}