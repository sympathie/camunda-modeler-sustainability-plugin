import {getBusinessObject} from "bpmn-js/lib/util/ModelUtil";
import {findExtensions} from "../helpers/extensions-helper";

export function findSustainabilityIndicatorById(elements, id) {
    let foundIndicator = null;

    elements.forEach(el => {
        if (!foundIndicator) {
            const element = getBusinessObject(el);
            const indicators = findExtensions(element, 'sustainability:SustainabilityIndicator');
            const indicator = indicators.find(value => getBusinessObject(value).id === id);

            if (indicator) {
                foundIndicator = indicator;
            }
        }
    });

    return foundIndicator;
}