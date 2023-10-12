import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil'
import {
    createElement,
    createExtensionElements,
    getExtensionElements,
    getExtensionElementsList,
    removeExtensionElements
} from '../helpers/extensions-helper'
import {ListGroup, SelectEntry, TextFieldEntry, ToggleSwitchEntry} from '@bpmn-io/properties-panel';
import {useService} from "bpmn-js-properties-panel";
import {SustainableDevelopmentImpacts} from "./SustainableDevelopmentImpactProps";
import {v4 as uuidv4} from 'uuid';


export function SustainabilityIndicator(element, injector) {
    const businessObject = getBusinessObject(element)

    if (!is(element, 'bpmn:SubProcess') && !is(element, 'bpmn:Event') && !is(element, 'bpmn:Process') && !is(element, 'bpmn:Activity') && !is(element, 'bpmn:Collaboration') && !is(element, 'bpmn:Participant') && !is(element, 'bpmn:Lane')) {
        return null;
    }

    const translate = injector.get('translate'),
        commandStack = injector.get('commandStack');

    const sustainabilityIndicatorDefinition = getExtensionElementsList(businessObject, 'sustainability:SustainabilityIndicator')

    return {
        id: 'sustainability-indicator-group',
        label: translate('Sustainability Indicators'),
        component: ListGroup,
        add: addSustainabilityIndicatorsFactory(element, injector),
        items: sustainabilityIndicatorDefinition.map(function (
            sustainabilityIndicatorElement,
            index
        ) {
            const id = `${element.id}-sustainability-indicator-${index}`

            return SustainabilityIndicatorPropertyItem({
                id,
                element,
                sustainabilityIndicatorElement,
                injector,
                commandStack
            })
        })
    }
}

function SustainabilityIndicatorPropertyItem(props) {
    const {id, element, sustainabilityIndicatorElement, injector, commandStack} = props
    let entries

    entries = [
        /*
                    {
            id: `${id}-name`,
            component: Custom,
            listener: sustainabilityIndicatorElement,
            element
        },
         */
        {
            id: `${id}-name`,
            component: IndicatorName,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-unit`,
            component: IndicatorUnit,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-period`,
            component: IndicatorPeriod,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-quantification-method`,
            component: IndicatorQuantificationMethod,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-improvement-goal`,
            component: IndicatorImprovementGoal,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-goal-type`,
            component: GoalType,
            listener: sustainabilityIndicatorElement,
            element
        },
        {
            id: `${id}-sustainable-development-impact`,
            component: SustainableDevelopmentImpacts,
            listener: sustainabilityIndicatorElement,
        },
    ]

    return {
        id,
        label: `${sustainabilityIndicatorElement.name || ''} : ${sustainabilityIndicatorElement.unit || ''}`,
        entries: entries,
        autoFocusEntry: id + '-name',
        remove: removeSDGFactory({
                element,
                sustainabilityIndicatorElement,
                commandStack
            }
        )
    }
}

function Custom(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    let array = []

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                custom: value
            }
        });
        listener.custom = value
    }

    const getValue = () => {
        return listener.custom
    }

    return ToggleSwitchEntry({
        element: listener,
        id,
        label: translate('Custom'),
        getValue,
        setValue,
        debounce
    })
}


function IndicatorImprovementGoal(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                improvementGoal: value
            }
        });
    }

    const getValue = () => {
        return listener.improvementGoal || ''
    }

    return TextFieldEntry({
        element: listener,
        id,
        label: translate(`Target measured in (${listener.get('unit')})`),
        getValue,
        setValue,
        debounce
    })
}

function IndicatorQuantificationMethod(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                quantificationMethod: value
            }
        });
    }

    const getValue = () => {
        return listener.quantificationMethod || ''
    }

    return TextFieldEntry({
        element: listener,
        id,
        description: "A formula used to calculate an indicator, whether to use the total amount or per unit of product or any other factor to normalise the performance e.g. 'Mass of CO2 equivalents emitted'",
        label: translate('Quantification Method'),
        getValue,
        setValue,
        debounce
    })
}

function IndicatorPeriod(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                period: value
            }
        });
    }

    const getValue = () => {
        return listener.period || ''
    }

    return TextFieldEntry({
        element: listener,
        id,
        description: "The period for calculating an indicator (e.g. yearly or instance",
        label: translate('Period of Measurement'),
        getValue,
        setValue,
        debounce
    })
}

function IndicatorUnit(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')
    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                unit: value
            }
        });
    }
    const getValue = () => {
        return listener.unit || ''
    }

    return TextFieldEntry({
        element: listener,
        id,
        description: "The metric used to represent an indicator (e.g. kilograms, kilowatts, dollars, percent, days and etc",
        label: translate('Unit'),
        getValue,
        setValue,
        debounce
    })
}
function GoalType(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')
    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                goalType: value
            }
        });
    }
    const getValue = () => {
        return listener.goalType || ''
    }

    return SelectEntry({
        element: listener,
        id,
        label: translate('Goal Type'),
        description: "Specifies whether to increase or decrease the current Value",
        getOptions() {
            return [{value: 'INCREASE', label: translate('Increase to target value')}, {value: 'DECREASE', label: translate('Decrease to target value')}]
        },
        getValue,
        setValue,
    })
}


function IndicatorName(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                name: value
            }
        });
    }

    const getValue = () => {
        return listener.name || ''
    }

    return TextFieldEntry({
        element: listener,
        id,
        label: translate('Name'),
        getValue,
        setValue,
        debounce
    })
}


function removeSDGFactory({element, sustainabilityIndicatorElement, commandStack}) {
    return function removeListener(event) {
        event.stopPropagation();
        removeExtensionElements(element, getContainer(element), sustainabilityIndicatorElement, commandStack);
    };
}

function addSustainabilityIndicatorsFactory(element, injector) {
    const bpmnFactory = injector.get('bpmnFactory')
    const modeling = injector.get('modeling')
    let myuuid = `${uuidv4()}`;

    function add(event) {
        event.stopPropagation()

        const property = {id: myuuid}

        const businessObject = getBusinessObject(element)

        const extensionElements = getExtensionElements(element)
        let updatedBusinessObject, update

        if (!extensionElements) {
            updatedBusinessObject = businessObject

            const extensionElements = createExtensionElements(
                businessObject,
                bpmnFactory
            )
            const sustainabilityIndicator = createElement('sustainability:SustainabilityIndicator', property, extensionElements, bpmnFactory);
            extensionElements.values.push(sustainabilityIndicator)

            update = {extensionElements}
        } else {
            updatedBusinessObject = businessObject

            const sustainabilityIndicator = createElement('sustainability:SustainabilityIndicator', property, extensionElements, bpmnFactory);
            extensionElements.values.push(sustainabilityIndicator)

            update = {extensionElements}
        }
        modeling.updateModdleProperties(element, updatedBusinessObject, update)
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
