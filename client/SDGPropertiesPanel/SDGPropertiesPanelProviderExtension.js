import {SustainableDevelopmentGoalsProps} from "./groups/SDGProps";
import {SustainabilityIndicator} from "./groups/SustainabilityIndicatorProps";
import {SustainableMetricProps} from "./groups/MetricProps";

const SUSTAINABILITY_GROUPS = [
    SustainableDevelopmentGoalsProps,
    SustainabilityIndicator,
    SustainableMetricProps
];
export default class SustainabilityPropertiesProvider {
    constructor(propertiesPanel, injector) {
        propertiesPanel.registerProvider(this)
        this._injector = injector
    }

    getGroups(element) {
        return (groups) => {
            groups = groups.concat(this._getGroups(element))

            return groups
        }
    }

    _getGroups(element) {
        const groups = SUSTAINABILITY_GROUPS.map(createGroup => createGroup(element, this._injector));
        // contract: if a group returns null, it should not be displayed at all
        return groups.filter(group => group !== null);
    }
}

SustainabilityPropertiesProvider.$inject = [
    'propertiesPanel',
    'injector'
];
