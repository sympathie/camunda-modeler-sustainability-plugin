import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil'
import {
    createElement,
    createExtensionElements,
    createSustainabilityProperties,
    getExtensionElements,
    getExtensionElementsList,
    getSustainableDevelopmentGoalsProperties,
    removeExtensionElements
} from '../helpers/extensions-helper'
import Ids from 'ids'
import {ListGroup, SelectEntry, TextFieldEntry} from '@bpmn-io/properties-panel';
import {SustainableDevelopmentTargets} from "./SDGTProps";
import {SDGTitle} from "../parts/sdgTitle";
import {SDGDescription} from "../parts/sdgDescription";
import {useService} from "bpmn-js-properties-panel";
import {values} from "min-dash";
import {findSustainabilityIndicatorById} from "../utils/sustainabilityIndicatorUtil";

const ids = new Ids([16, 36, 1])


export function SustainableMetricProps(element, injector) {
    const businessObject = getBusinessObject(element)

    if (!is(element, 'bpmn:FlowNode')) {
        return null;
    }

    const translate = injector.get('translate'),
        commandStack = injector.get('commandStack');

    const metricDefinition = getExtensionElementsList(businessObject, 'sustainability:Metric')

    return {
        id: 'sustainability-metric',
        label: translate('Sustainability Metric'),
        component: ListGroup,
        add: addSustainabilityMetricFactory(element, injector),
        items: metricDefinition.map(function (
            metricElement,
            index
        ) {
            const id = `${element.id}-sustainability-metric-${index}`

            return SustainabilityMetricPropertyItem({
                id,
                element,
                metricElement,
                injector,
                commandStack
            })
        })
    }
}

function SustainabilityMetricPropertyItem(props) {
    const {id, element, metricElement, injector, commandStack} = props
    const elementRegistry = injector.get('elementRegistry')

    const indicator = findSustainabilityIndicatorById(elementRegistry, metricElement.indicatorRef)

    const entries = [
        {
            id: `${id}-indicator-ref`,
            component: MetricIndicatorRef,
            listener: metricElement,
            element
        },
        {
            id: `${id}-value`,
            component: MetricValue,
            listener: metricElement,
            element
        }
    ]

    return {
        id,
        label: indicator ? `[${indicator.name}] ${metricElement.value || ''} (${indicator.unit || ''})` : 'Sustainability Metric',
        entries: entries,
        autoFocusEntry: id + '-name',
        remove: removeMetricFactory({
                element,
                metricElement,
                commandStack
            }
        )
    }
}

function MetricIndicatorRef(props) {
    const {
        idPrefix,
        element,
        listener
    } = props;

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    const setValue = (indicator) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                indicatorRef: indicator,
            }
        });
    }

    const getValue = () => {
        return listener.indicatorRef || ''
    }

    return SelectEntry({
        element: listener,
        idPrefix,
        label: translate(`Referenced Sustainability Indicator`),
        getOptions() {
            return searchForParentIndicators(element, [], element.id).map(indicatorElement => {
                return {value: indicatorElement.id, label: translate(`${indicatorElement.name}`)}
            })
        },
        getValue,
        setValue,
    })
}

function MetricValue(props) {
    const {
        idPrefix,
        element,
        listener
    } = props;

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const elementRegistry = useService('elementRegistry')
    const commandStack = useService('commandStack')

    const indicator = findSustainabilityIndicatorById(elementRegistry, listener.indicatorRef)

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                value: value,
            }
        });
    }

    const getValue = () => {
        return listener.value || ''
    }

    return TextFieldEntry({
        element: listener,
        id: idPrefix + '-value',
        label: indicator ? translate('Average Value' + ` (${indicator.unit})`) : translate('Average Value'),
        getValue,
        setValue,
        debounce
    });
}


function removeMetricFactory({element, metricElement, commandStack}) {
    return function removeListener(event) {
        event.stopPropagation();

        removeExtensionElements(element, getContainer(element), metricElement, commandStack);
    };
}

function addSustainabilityMetricFactory(element, injector) {
    const bpmnFactory = injector.get('bpmnFactory')
    const modeling = injector.get('modeling')
    const commandStack = injector.get('commandStack')

    function add(event) {
        event.stopPropagation()
        const property = {}

        const businessObject = getBusinessObject(element)
        const extensionElements = getExtensionElements(element)

        if (!extensionElements) {
            const extensionElements = createExtensionElements(
                businessObject,
                bpmnFactory
            )

            const sustainabilityIndicator = createElement('sustainability:Metric', {}, extensionElements, bpmnFactory);

            commandStack.execute('element.updateModdleProperties', {
                element,
                moddleElement: element.businessObject,
                properties: {
                    extensionElements: extensionElements
                }
            });
            commandStack.execute('element.updateModdleProperties', {
                element,
                moddleElement: extensionElements,
                properties: {
                    values: [...extensionElements.get('values'), sustainabilityIndicator]
                }
            });
        } else {
            const sustainabilityIndicator = createElement('sustainability:Metric', {}, extensionElements, bpmnFactory);

            commandStack.execute('element.updateModdleProperties', {
                element,
                moddleElement: extensionElements,
                properties: {
                    values: [...extensionElements.get('values'), sustainabilityIndicator]
                }
            });
        }
    }

    return add
}

// helper

/**
 * Get process business object from process element or participant.
 */
function getContainer(element) {
    const businessObject = getBusinessObject(element);

    return businessObject.get('processRef') || businessObject;
}

function searchForParentIndicators(element, indicatorElements, elementId) {
    let indicatorElementsTmp = indicatorElements;

    const businessObject = getBusinessObject(element);
    const foundElements = getExtensionElementsList(businessObject, 'sustainability:SustainabilityIndicator')
    if (foundElements.length > 0) {
        foundElements.forEach(value => {
            indicatorElementsTmp.push(value)
        })
    }
    if (is(businessObject, "bpmn:Process")) {
        indicatorElementsTmp = indicatorElementsTmp.concat(findElementInLane(element, elementId, []));
    }
    if (businessObject.$parent) {
        return searchForParentIndicators(businessObject.$parent, indicatorElementsTmp, elementId)
    } else {
        const collaboration = businessObject.rootElements.find(value => is(getBusinessObject(value), "bpmn:Collaboration"))
        if (collaboration) {
            const sustainabilityIndicators = getExtensionElementsList(collaboration, 'sustainability:SustainabilityIndicator')
            if (sustainabilityIndicators.length > 0) {
                sustainabilityIndicators.forEach(value => {
                    indicatorElementsTmp.push(value)
                })
            }
            const rootElements = collaboration.participants
            if (rootElements.length > 0) {
                rootElements.forEach(participant => {
                    const processRefBo = getBusinessObject(participant.processRef)
                    try {
                        if (processRefBo.flowElements !== undefined) {
                            const flowElements = processRefBo.flowElements
                            if (flowElements.find(element => getBusinessObject(element).id === elementId)) {
                                const sustainabilityIndicators = getExtensionElementsList(participant, 'sustainability:SustainabilityIndicator')
                                if (sustainabilityIndicators.length > 0) {
                                    sustainabilityIndicators.forEach(value => {
                                        indicatorElementsTmp.push(value)
                                    })
                                }
                            }
                        }
                    } catch (e) {
                    }
                })
            }
        }
        return indicatorElementsTmp
    }
}

function findElementInLane(element, elementId, indicatorElements) {
    const elementObject = getBusinessObject(element)
    if (elementObject.flowNodeRef) {
        if (elementObject.flowNodeRef.find(element => element.id === elementId)) {
            const foundElements = getExtensionElementsList(elementObject, 'sustainability:SustainabilityIndicator')
            if (foundElements.length > 0) {
                foundElements.forEach(value => {
                    indicatorElements.push(value)
                })
            }
        }
    }
    if (element.lanes) {
        element.lanes.forEach(lane => {
            return findElementInLane(lane, elementId, indicatorElements)
        })
    } else if (element.laneSets) {
        element.laneSets.forEach(laneSet => {
            return findElementInLane(laneSet, elementId, indicatorElements)
        })
    } else if (element.childLaneSet) {
        if (element.childLaneSet.lanes)
            element.childLaneSet.lanes.forEach(lane => {
                return findElementInLane(lane, elementId, indicatorElements)
            })
    }
    return indicatorElements
}
