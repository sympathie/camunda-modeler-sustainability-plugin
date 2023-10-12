import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil'
import {
    createExtensionElements,
    createSustainabilityProperties,
    getExtensionElements,
    getExtensionElementsList,
    getSustainableDevelopmentGoalsProperties,
    removeExtensionElements
} from '../helpers/extensions-helper'
import Ids from 'ids'
import {ListEntry, ListGroup} from '@bpmn-io/properties-panel';
import {SustainableDevelopmentTargets} from "./SDGTProps";
import {SDGTitle} from "../parts/sdgTitle";
import {SDGDescription} from "../parts/sdgDescription";

const ids = new Ids([16, 36, 1])


export function SustainableDevelopmentGoalsProps(element, injector) {
    const businessObject = getBusinessObject(element)

    if (!is(element, 'bpmn:Process') && !is(element, 'bpmn:Collaboration')) {
        return null;
    }

    const translate = injector.get('translate'),
        commandStack = injector.get('commandStack');

    const sustainableDevelopmentGoalsDefinition = getExtensionElementsList(businessObject, 'sustainability:SustainableDevelopmentGoal')

    return {
        id: 'sustainability-goals-group',
        label: translate('Sustainability Development Goals'),
        component: ListGroup,
        add: addSustainableDevelopmentGoalFactory(element, injector),
        items: sustainableDevelopmentGoalsDefinition.map(function (
            sustainabilityGoalElement,
            index
        ) {
            const id = `${element.id}-sustainability-goals-${index}`

            return SustainableDevelopmentGoalsPropertyItem({
                id,
                element,
                sustainabilityGoalElement,
                injector,
                commandStack
            })
        })
    }
}

function SustainableDevelopmentGoalsPropertyItem(props) {
    const {id, element, sustainabilityGoalElement, injector, commandStack} = props
    const entries = [
        {
            id: `${id}-title`,
            component: SDGTitle,
            sustainabilityGoalElement,
            element
        },
        /*
                {
            id: `${id}-description`,
            component: SDGDescription,
            listener: sustainabilityGoalElement,
            element
        },
         */
        {
            id: `${id}-sustainable-development-targets`,
            component: SustainableDevelopmentTargets,
            listener: sustainabilityGoalElement
        }
    ]

    return {
        id,
        label: `${sustainabilityGoalElement.code || ''} ${sustainabilityGoalElement.title || ''}`,
        entries: entries,
        autoFocusEntry: id + '-name',
        remove: removeSDGFactory({
                element,
                sustainabilityGoalElement,
                commandStack
            }
        )
    }
}


function removeSDGFactory({element, sustainabilityGoalElement, commandStack}) {
    return function removeListener(event) {
        event.stopPropagation();

        removeExtensionElements(element, getContainer(element), sustainabilityGoalElement, commandStack);
    };
}

function addSustainableDevelopmentGoalFactory(element, injector) {
    const bpmnFactory = injector.get('bpmnFactory')
    const modeling = injector.get('modeling')

    function add(event) {
        event.stopPropagation()
        const property = {title: '', description: ''}

        const businessObject = getBusinessObject(element)

        const extensionElements = getExtensionElements(element)
        let updatedBusinessObject, update

        if (!extensionElements) {
            updatedBusinessObject = businessObject

            const extensionElements = createExtensionElements(
                businessObject,
                bpmnFactory
            )
            const sustainabilityGoalProperties = createSustainabilityProperties(
                extensionElements,
                bpmnFactory,
                property
            )
            extensionElements.values.push(sustainabilityGoalProperties)

            update = {extensionElements}
        } else {
            updatedBusinessObject = businessObject

            const sustainabilityGoalProperties = createSustainabilityProperties(
                extensionElements,
                bpmnFactory,
                property
            )
            extensionElements.values.push(sustainabilityGoalProperties)

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
function getProcessBo(element) {
    let bo = getBusinessObject(element)

    if (is(element, 'bpmn:Participant')) {
        bo = bo.processRef
    }

    return bo
}

function sustainableDevelopmentGoalsProperties(processBo) {
    const sustainabilityProperties = getSustainableDevelopmentGoalsProperties(processBo)
    if (!sustainabilityProperties) {
        return []
    }
    return sustainabilityProperties
}

function getContainer(element) {
    const businessObject = getBusinessObject(element);

    return businessObject.get('processRef') || businessObject;
}
