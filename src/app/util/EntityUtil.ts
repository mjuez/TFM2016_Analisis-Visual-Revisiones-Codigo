import { IEntity } from "../entities/IEntity";

export class EntityUtil {

    public static toJSONArray(entityArray: IEntity<any>[]): Object[] {
        let JSONArray: Object[] = [];
        entityArray.map((entity) => {
            JSONArray.push(entity.document);
        });
        return JSONArray;
    }

    public static toJSON(entity: IEntity<any>): Object[] {
        return entity.document;
    }

}