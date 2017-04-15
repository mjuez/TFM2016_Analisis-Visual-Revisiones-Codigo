import * as mongoose from "mongoose"
import { IEntity } from "./IEntity";

export abstract class AbstractEntity<T extends mongoose.Document> implements IEntity<T>{
    
    private _document: T;

    constructor(document: T){
        this._document = document;
    }
    
    public get document(): T {
        return this._document;
    }

}