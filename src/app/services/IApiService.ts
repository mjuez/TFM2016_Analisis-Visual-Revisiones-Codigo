import * as Events from "events";

/**
 * IApiService interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IApiService<T> extends Events.EventEmitter {
    
    /** API wrapper. */
    API: T
}