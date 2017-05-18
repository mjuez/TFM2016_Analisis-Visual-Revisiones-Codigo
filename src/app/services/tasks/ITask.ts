import { ITaskEntity } from "../../entities/TaskEntity";
import * as Events from "events";

export interface ITask extends Events.EventEmitter {
    entity: ITaskEntity;
    run(): Promise<void>;
    persist(): Promise<void>;
}