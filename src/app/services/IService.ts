import { IEntity } from "../entities/IEntity";

export interface IService<IEntity> {
    createOrUpdate(entity: IEntity, callback?: (err: any, result: IEntity) => void): void;
}