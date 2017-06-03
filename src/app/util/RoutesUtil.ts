export class RoutesUtil {

    public static directionNameToNumber(direction: string): number {
        if(direction.toUpperCase() === 'ASC'){
            return 1;
        }else if(direction.toUpperCase() === 'DESC'){
            return -1;
        }

        return 0;
    }

}