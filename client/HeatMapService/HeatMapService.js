import {ToolTipService} from "../ToolTipService/ToolTipService";
import {getExtensionElementsList} from "../SDGPropertiesPanel/helpers/extensions-helper";
import _ from "lodash";
import {getBusinessObject, is} from "bpmn-js/lib/util/ModelUtil";
import {SELECT_INDICATOR_EVENT, SDG_ASSESSMENT_MODE_EVENT} from "./util/EventHelper";
import {query as domQuery} from "min-dom";
import {findSustainabilityIndicatorById} from "../SDGPropertiesPanel/utils/sustainabilityIndicatorUtil";

export function HeatMapService(eventBus, overlays, elementRegistry, elementFactory, canvas) {
    const elementOverlays = []
    let elements = []
    let legendContainer

    eventBus.on(SELECT_INDICATOR_EVENT, function (event) {
        _.defer(function () {
            rerenderOldElements()
            refresh(event.indicator.id);
        });
    });

    eventBus.on(SDG_ASSESSMENT_MODE_EVENT, (event) => {
        if (!event.active) {
            rerenderOldElements()
        }
    })

    function refresh(indicatorId) {
        const values = extractHeatValues(indicatorId)
        applyHeatMap(values.heatMapValues, values.min, values.max, indicatorId)
    }

    function rerenderOldElements() {
        elements.forEach(element => {
            console.log('element', element)
            const gfx = elementRegistry.getGraphics(element.element).getElementsByClassName('djs-visual')[0].firstElementChild;
            if (is(elementRegistry.get(element.element).businessObject, "bpmn:DataOutputAssociation")) {
                gfx.style.stroke = element.stroke;
            } else {
                gfx.style.fill = element.fill;
                gfx.style.opacity = element.opacity;
            }
        })
        elements = []
    }

    function extractHeatValues(sustainabilityIndicator) {
        let heatMapValues = {}
        let min = 0, max = 0

        elementRegistry.forEach(element => {
            const bo = element.businessObject
            const sustainabilityMetrics = getExtensionElementsList(bo, "sustainability:Metric")
            if (sustainabilityMetrics) {
                let value = 0.00;
                sustainabilityMetrics.forEach(metric => {
                    if (metric.indicatorRef === sustainabilityIndicator) {
                        value += parseFloat(metric.value)
                    }
                })
                if (value !== 0) {
                    heatMapValues[element.id] = value
                    if (value > max) max = value
                    if (value < min) min = value
                }
            }
        })
        return {
            min: min,
            max: max,
            heatMapValues
        }
    }

    function calculateColor(value, min, max, indicatorId) {
        const normalizedValue = calculateNormalizedValue(value, min, max)
        return heatMapColorforValue(normalizedValue, indicatorId)
    }

    function calculateNormalizedValue(value, min, max) {
        return (value - min) / (max - min);
    }

    function calculateOpacity(value, min, max) {
        const normalizedValue = (value - min) / (max - min);

        // Scale the normalized value to be between 0.1 and 0.9
        return 0.1 + normalizedValue * 0.8;
    }

    function getElementSize(elementId) {
        const element = elementRegistry.get(elementId);
        if (element) {
            const {width, height} = element;
            return {width, height};
        }
        return {width: 0, height: 0}; // Fallback für den Fall, dass das Element nicht gefunden wird
    }

    function updateElementAppearance(element, heatMapValue, min, max, indicatorId) {
        const color = calculateColor(heatMapValue, min, max, indicatorId);
        const opacity = calculateOpacity(heatMapValue, min, max, indicatorId);

        // Aktualisieren Sie das SVG-Element
        const gfx = elementRegistry.getGraphics(element).getElementsByClassName('djs-visual')[0].firstElementChild;

        // gfx.style.strokeWidth = interpolate(2, 8, scale) + 'px'
        elements.push(
            {
                element: element,
                stroke: gfx.style.stroke,
                fill: gfx.style.fill,
                opacity: gfx.style.opacity,
            }
        )

        if (is(elementRegistry.get(element).businessObject, "bpmn:DataOutputAssociation")) {
            gfx.style.stroke = color;
        } else {
            gfx.style.fill = color;
        }
    }

    function applyHeatMap(heatMapValues, min, max, indicatorId) {
        createHeatmapLegend(indicatorId, min, max)
        Object.keys(heatMapValues).forEach(elementId => {
            const bo = getBusinessObject(elementId)
            elementOverlays[elementId] = []
            updateElementAppearance(bo, heatMapValues[elementId], min, max, indicatorId)

            /*
                        elementOverlays[elementId].push(
                overlays.add(
                    bo, 'heatmap-info',
                    {
                        // position: {top: 0 - ((elementSize.height * scale) / 2), left: 0 - ((elementSize.height * scale) / 2)},
                        position: {top: 0, left: 0},
                        scale: false,
                        show: {maxZoom: 2},
                        // html: `<div style="background-color: ${color}; width: ${overlaySize.width}px; height: ${overlaySize.height}px; border-radius: 10px; opacity: ${normalizedValue}; z-index: -1"></div>`
                        html: `<div style="background-color: ${color}; width: ${elementSize.width}px; height: ${elementSize.height}px; border-radius: 100%; opacity: ${normalizedValue}; z-index: -1"></div>`
                    }
                )
            )
             */

        });
    }

    function calculateOverlaySize(elementSize, value, min, max) {
        const normalizedValue = (value - min) / (max - min);
        const scale = normalizedValue * 0.5; // Skalierungsfaktor, z.B. zwischen 50% und 100% der Elementgröße

        return {
            width: Math.round(elementSize.width + elementSize.width * scale),
            height: Math.round(elementSize.height + elementSize.width * scale)
        };
    }

    function calculateScale(elementSize, value, min, max) {
        const normalizedValue = (value - min) / (max - min);
        return normalizedValue * 0.5; // Skalierungsfaktor, z.B. zwischen 50% und 100% der Elementgröße
    }

    function heatMapColorforValue(value, indicatorId) {
        const indicatorElement = findSustainabilityIndicatorById(elementRegistry, indicatorId)
        const startColor = {r: 0, g: 255, b: 0}; // Grün
        const endColor = {r: 255, g: 0, b: 0}; // Rot

        console.log(indicatorElement)

        if (indicatorElement.goalType === "INCREASE") {
            const tempColor = { ...startColor };
            startColor.r = endColor.r;
            startColor.g = endColor.g;
            startColor.b = endColor.b;
            endColor.r = tempColor.r;
            endColor.g = tempColor.g;
            endColor.b = tempColor.b;
        }

        const r = Math.round(interpolate(startColor.r, endColor.r, value));
        const g = Math.round(interpolate(startColor.g, endColor.g, value));
        const b = Math.round(interpolate(startColor.b, endColor.b, value));

        return `rgb(${r}, ${g}, ${b})`;
    }

    function createHeatmapLegend(indicatorId, min, max) {
        if (legendContainer)
            canvas.getContainer().removeChild(legendContainer)

        legendContainer = document.createElement('div')
        legendContainer.id = 'heatmapLegend'
        legendContainer.innerHTML = ''; // Clear previous content

        const legendSteps = 1000; // Adjust based on your heatmap color scale
        const stepSize = 1 / legendSteps;

        for (let i = 0; i <= legendSteps; i++) {
            const value = i * stepSize;
            const color = heatMapColorforValue(value, indicatorId);

            const legendItem = document.createElement('div');
            const valueSpan = document.createElement('span');
            if (i === 0) {
                valueSpan.textContent = min;
                legendContainer.appendChild(valueSpan);
            }
            legendItem.classList.add('legend-color');
            legendItem.style.backgroundColor = color

            legendContainer.appendChild(legendItem);
            if (i === 1000) {
                valueSpan.textContent = max;
                legendContainer.appendChild(valueSpan);
            }
        }
        canvas.getContainer().appendChild(legendContainer)
        console.log(canvas)
    }

    function interpolate(start, end, value) {
        return start + (end - start) * value;
    }
}


ToolTipService.$inject = [
    'eventBus',
    'overlays',
    'elementRegistry',
    'editorActions',
    'elementFactory',
    'canvas'
];
