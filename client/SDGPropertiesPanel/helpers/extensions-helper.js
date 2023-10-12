import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil'
import SDGindicators from '../assets/indicator_data.csv'

export function findExtensions (element, types) {
  const extensionElements = getExtensionElements(element)

  if (!extensionElements) {
    return []
  }

  return extensionElements.get('values').filter((value) => {
    return isAny(value, [].concat(types))
  })
}

/**
 * Gets the extension elements of a business object
 * @param element
 * @returns {*}
 **/
export function getExtensionElements (element) {
  const businessObject = getBusinessObject(element)

  return businessObject.get('extensionElements')
}

/**
 * Gets the extension elements of a business object
 * @param element
 * @returns {*}
 **/
export function getSGElements (element) {
  const businessObject = getBusinessObject(element)

  return businessObject.get('sustainability:SustainabilityGoal')
}

/**
 * should be changed in getSustainableProperties
 * @param element
 * @returns {null|*}
 */
export function getSustainableDevelopmentGoalsProperties (element) {
  const bo = getBusinessObject(element)

  const properties = findExtensions(bo, 'sustainability:SustainableDevelopmentGoals') || []
  if (properties.length) {
    return properties[0].sustainableDevelopmentGoals
  }
  return null
}

export function getSustainableDevelopmentGoals (element) {
  const bo = getBusinessObject(element)

  const properties = findExtensions(bo, 'sustainability:SustainableDevelopmentGoals') || []
  if (properties.length) {
    return properties[0]
  }
  return null
}

export function createExtensionElements (element, bpmnFactory) {
  const bo = getBusinessObject(element)

  return createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
}

export function createSustainableDevelopmentGoals (extensionElements, bpmnFactory, properties) {
  return createElement('sustainability:SustainableDevelopmentGoals', properties, extensionElements, bpmnFactory)
}


export function createSustainabilityProperties (extensionElements, bpmnFactory, properties) {
  return createElement('sustainability:SustainableDevelopmentGoal', properties, extensionElements, bpmnFactory)
}

export function createSustainableDevelopmentTarget (sustainableDevelopmentGoalElement, bpmnFactory, properties) {
  return createElement('sustainability:SustainableDevelopmentTarget', properties, sustainableDevelopmentGoalElement, bpmnFactory)
}

export function createElement (elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties)
  element.$parent = parent

  return element
}

export function loadSustainableDevelopmentGoals () {
  let csvData = []
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      csvData = this.responseText.split('\n').map(function (row) {
        return row.split('"').filter(value => value.length > 1)
      })
    }
  }
  xhttp.open('GET', SDGindicators, false)
  xhttp.send()
  return csvData
}


/**
 * Helpers form properties panel repo
 */


export function removeExtensionElements(element, businessObject, extensionElementsToRemove, commandStack) {
  if (!extensionElementsToRemove.length) {
    extensionElementsToRemove = [ extensionElementsToRemove ];
  }

  const extensionElements = businessObject.get('extensionElements'),
      values = extensionElements.get('values').filter(value => !extensionElementsToRemove.includes(value));

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: extensionElements,
    properties: {
      values
    }
  });
}

/**
 * Get extension elements of business object. Optionally filter by type.
 *
 * @param {ModdleElement} businessObject
 * @param {string} [type=undefined]
 * @returns {Array<ModdleElement>}
 */
export function getExtensionElementsList(businessObject, type = undefined) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return [];
  }

  if (type) {
    return values.filter(value => is(value, type));
  }

  return values;
}

export function searchForSDGT(element, SDGTElements) {
  const indicatorElementsTmp = SDGTElements;

  const businessObject = getBusinessObject(element);
  const foundElements = getExtensionElementsList(businessObject, 'sustainability:SustainableDevelopmentGoal')
  if (foundElements.length > 0) {
    foundElements.forEach(value => {
      indicatorElementsTmp.push(value)
    })
  }
  if (businessObject.$parent) {
    return searchForSDGT(businessObject.$parent, indicatorElementsTmp)
  } else {
    const collaboration = businessObject.rootElements.find(value => is(getBusinessObject(value), "bpmn:Collaboration"))
    if (collaboration) {
      const sustainabilityIndicators = getExtensionElementsList(collaboration, 'sustainability:SustainableDevelopmentGoal')
      if (sustainabilityIndicators.length > 0) {
        sustainabilityIndicators.forEach(value => {
          indicatorElementsTmp.push(value)
        })
      }
    }
    return indicatorElementsTmp
  }
}

