import { ITaskEntity } from "../../entities/TaskEntity";
import * as Events from "events";

/**
 * Task interface.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface ITask extends Events.EventEmitter {

    /** Task entity. */
    entity: ITaskEntity;

    /**
     * Task entity setter.
     *
     * @param entity task entity.
     */
    setEntity(entity: ITaskEntity): Promise<void>;

    /** Runs the task. */
    run(): Promise<void>;

    /** Persists the task. */
    persist(): Promise<void>;

    /**
     * Updates the current page of the task.
     *
     * @param pageNumber    new current page.
     */
    updateCurrentPage(pageNumber: number): Promise<void>;
}