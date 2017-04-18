/**
 * Generic factory utility.
 * Creates an instance of a generic type.
 * @author Mario Juez <mario@mjuez.com>
 */
export class GenericFactory<T> {
    
    /**
     * Creates an instance of a generic type.
     */
    public createInstance: { new (...args: any[]): T };

}