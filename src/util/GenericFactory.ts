export class GenericFactory<T> {
    
    public createInstance: { new (...args: any[]): T };

}