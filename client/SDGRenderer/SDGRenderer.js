import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'

import {append as svgAppend, create as svgCreate} from 'tiny-svg'

import {getRoundRectPath} from 'bpmn-js/lib/draw/BpmnRenderUtil'

import {getBusinessObject, is} from 'bpmn-js/lib/util/ModelUtil'
import {isAny} from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import {findExtensions} from "../SDGPropertiesPanel/helpers/extensions-helper";
import {findSustainabilityIndicatorById} from "../SDGPropertiesPanel/utils/sustainabilityIndicatorUtil";
import sustainabilityIcon from "../../resources/sustainability_icon.svg"

const HIGH_PRIORITY = 1500
const TASK_BORDER_RADIUS = 2

const images = importAll(require.context('/resources/SDGIcons', false, /\.(png|jpe?g|svg)$/));
const icons = importAll(require.context('/resources/icons', false, /\.(png|jpe?g|svg)$/));

export class SDGRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer, elementRegistry, overlays) {
        super(eventBus, HIGH_PRIORITY)
        this.bpmnRenderer = bpmnRenderer
        this.elementRegistry = elementRegistry
        this.eventBus = eventBus
        this.overlays = overlays
    }

    canRender(element) {
        // only render tasks and events (ignore labels)
        return isAny(element, ['bpmn:Activity', 'bpmn:Process', 'bpmn:DataObjectReference', 'bpmn:Participant']) && !element.labelTarget
    }

    drawShape(parentNode, element) {
        // we only want to change some specifications, the let the renderer render the shape first
        const shape = this.bpmnRenderer.drawShape(parentNode, element)
        const businessObject = getBusinessObject(element)
        const metricElements = findExtensions(element, 'sustainability:Metric')
        const energyElements = findExtensions(element, 'sustainability:Energy')
        const materialElements = findExtensions(element, 'sustainability:Material')
        const sustainableDevelopmentGoals = findExtensions(element, 'sustainability:SustainableDevelopmentGoal')
        const fuelElements = findExtensions(element, 'sustainability:Fuel')

        if (metricElements.length) {
            const indicator = metricElements[0].indicatorRef
            const found = findSustainabilityIndicatorById(this.elementRegistry, indicator)
            if (found) {
                drawIcon(parentNode, sustainabilityIcon, shape.width.baseVal.value, shape.height.baseVal.value)
                // drawSDGOverlay(element, found, this.overlays)
            }
        }
        if (energyElements.length) {
            drawIcon(parentNode, icons['spark-icon.png'].default, shape.width.baseVal.value, shape.height.baseVal.value)
        }
        if (materialElements.length) {
            drawIcon(parentNode, icons['material.png'].default, 25, 25)
        }
        if (sustainableDevelopmentGoals.length) {
            drawIcon(parentNode, images['13.jpg'].default, shape.width.baseVal.value, shape.height.baseVal.value)
        }
        if (fuelElements.length) {
            drawIcon(parentNode, icons['barrel-icon.png'].default, shape.width.baseVal.value, shape.height.baseVal.value)
        }
        return shape
    }

    // gets called when a connection is to be cropped
    getShapePath(shape) {
        if (is(shape, 'bpmn:Task')) {
            return getRoundRectPath(shape, TASK_BORDER_RADIUS)
        }

        return this.bpmnRenderer.getShapePath(shape)
    }
}

SDGRenderer.$inject = ['eventBus', 'bpmnRenderer', 'elementRegistry', 'overlays']

// add SDG overlays to element
function drawSDGOverlay(element, sustainabilityMetric, overlays) {
    const bo = element.businessObject

    overlays.add(
        bo,
        {
            html: '<div>ID: StartEvent_1</div>',
            position: {top: 0, left: 0},
        }
    )
}

// render sustainability icon
function drawIcon(parentNode, imageUrl, parentWidth, parentHeight) {
    const image = svgCreate('image', {
        x: parentWidth - 10,
        y: -5,
        width: 25,
        height: 25,
        href: imageUrl
    });

    svgAppend(parentNode, image);

    return image;
}

// helpers

// copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
function prependTo(newNode, parentNode, siblingNode) {
    parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild)
}

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => {
        images[item.replace('./', '')] = r(item);
    });
    return images;
}
