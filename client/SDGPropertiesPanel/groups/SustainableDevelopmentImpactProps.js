import {CollapsibleEntry, ListEntry, SelectEntry, TextFieldEntry} from "@bpmn-io/properties-panel";
import {createElement, getExtensionElementsList, searchForSDGT} from "../helpers/extensions-helper";
import {useService} from "bpmn-js-properties-panel";
import {without} from 'min-dash';
import {SustainableDevelopmentIndicators} from "./SDGIProps";
import {getBusinessObject, is} from "bpmn-js/lib/util/ModelUtil";


export function SustainableDevelopmentImpacts(props) {
    const {
        id,
        element,
        listener
    } = props;

    const bpmnFactory = useService('bpmnFactory');
    const commandStack = useService('commandStack');
    const translate = useService('translate');

    const sustainableDevelopmentImpacts = listener.get('impacts');

    function addSustainableDevelopmentImpacts() {
        const target = createElement('sustainability:SustainableDevelopmentImpact', {}, listener, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                impacts: [...listener.get('impacts'), target]
            }
        });
    }

    function removeSustainableDevelopmentImpacts(target) {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                impacts: without(listener.get('impacts'), target)
            }
        });
    }

    return ListEntry({
        id: id,
        element: element,
        items: sustainableDevelopmentImpacts,
        component: Impacts,
        label: translate('SDG Impact'),
        onAdd: addSustainableDevelopmentImpacts,
        onRemove: removeSustainableDevelopmentImpacts,
        autoFocusEntry: true
    })
}

function Impacts(props) {
    const {
        element,
        id: idPrefix,
        index,
        item: impact,
        open
    } = props

    const targetId = `${idPrefix}-impact-${index}`

    return CollapsibleEntry({
        id: idPrefix,
        element: element,
        entries: ImpactInjection({
            element,
            impact,
            idPrefix: targetId
        }),
        label: impact.get('sustainableDevelopmentIndicatorRef') || '',
        open: true
    })
}

function ImpactInjection(props) {

    const {
        element,
        idPrefix,
        impact
    } = props;

    return [{
        id: idPrefix + '-sustainable-development-indicator-ref',
        component: SustainableDevelopmentIndicatorRefProperty,
        impact,
        idPrefix,
        element
    }, {
        id: idPrefix + '-impact',
        component: SustainableDevelopmentImpact,
        impact,
        idPrefix,
        element
    }];
}

function SustainableDevelopmentIndicatorRefProperty(props) {
    const {
        idPrefix,
        element,
        impact
    } = props;
    let processElement = getBusinessObject(element)
    while (!getExtensionElementsList(processElement, 'sustainability:SustainableDevelopmentGoal')) {
        processElement = processElement.$parent
    }

    const businessObject = getBusinessObject(element)
    const sustainableDevelopmentGoalDefinition = searchForSDGT(element, [])

    const sustainableDevelopmentTargets = sustainableDevelopmentGoalDefinition
        .filter(sdg => sdg.sustainableDevelopmentTargets !== undefined)
        .flatMap(goal =>
            goal.sustainableDevelopmentTargets.map(target => target)
        );


    const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: impact,
            properties: {
                sustainableDevelopmentIndicatorRef: value
            }
        });
    };

    const getValue = (target) => {
        return target.sustainableDevelopmentIndicatorRef || '';
    };

    return SelectEntry({
        element: impact,
        idPrefix,
        label: translate(`Contributes to`),
        getOptions() {
            return sustainableDevelopmentTargets.map(goal => {
                return ({value: goal.code, label: `(${goal.code} ${goal.description})`})
            })
        },
        getValue,
        setValue,
    })
}

function SustainableDevelopmentImpact(props) {
    const {
        idPrefix,
        element,
        impact
    } = props;

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')

    let array = []

    const setValue = (value) => {
        impact.impact = value
    }

    const getValue = () => {
        return impact.impact || ''
    }

    return SelectEntry({
        element: impact,
        idPrefix,
        label: translate(`Contribution to SDG`),
        getOptions() {
            return [{value: 'MinimizeNegativeImpact', label: translate('Minimizing Negative Impact')}, {value: 'MaximizingPositiveImpact', label: translate('Maximizing Positive Impact')}]
        },
        getValue,
        setValue,
    })
}
