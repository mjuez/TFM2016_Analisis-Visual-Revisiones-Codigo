import { Response } from "express";

/**
 * Static API routing utilities.
 * 
 * @author Mario Juez <mario@mjuez.com>
 */
export class RoutesUtil {

    /**
     * Converts string direction (ASC/DESC) to its numeric representation
     * for using with mongoose (ASC = 1, DESC = -1).
     * 
     * @param direction string direction (ASC/DESC).
     * @return numeric value for direction.
     */
    public static directionNameToNumber = (direction: string): number => {
        const upperCaseDirection: string = direction.toUpperCase();
        if (upperCaseDirection === 'ASC') {
            return 1;
        } else if (upperCaseDirection === 'DESC') {
            return -1;
        }
        return 0;
    }

    /**
     * Sends a 404 response.
     */
    public static notFoundResponse = (res: Response): void => {
        res.status(404).json({ message: "Page not found." });
    }

    /**
     * Sends a 500 response.
     */
    public static errorResponse = (res: Response): void => {
        res.status(500).json({ message: "Oops, something went wrong." });
    }

}