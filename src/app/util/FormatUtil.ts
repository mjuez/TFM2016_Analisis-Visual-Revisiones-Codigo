import * as moment from "moment";
import * as twix from "twix";

export class FormatUtil {

    public static toDateLabels(datesRanges: any[]): string[] {
        let labels: string[] = datesRanges.map((range) => {
            return range.simpleFormat("DD/MM/YYYY");
        });
        return labels;
    }

}