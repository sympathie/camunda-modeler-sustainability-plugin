'use strict';
import {getExtensionElementsList} from "../SDGPropertiesPanel/helpers/extensions-helper";
import {findSustainabilityIndicatorById} from "../SDGPropertiesPanel/utils/sustainabilityIndicatorUtil";
import {getBusinessObject} from "bpmn-js/lib/util/ModelUtil";

var $ = require('jquery');
var _ = require('lodash');


// start-up behaviour (> 'npm run bundle' afterwards)
//   true: tooltip-plugin  enabled at start-up
//  false: tooltip-plugin disabled at start-up
var TOOLTIP_INFOS_ENABLED = true;


export function ToolTipService(eventBus, overlays, elementRegistry, editorActions, SDGRenderer) {

    // register 'toggleTooltipInfos'-event
    editorActions.register({
        toggleTooltipInfos: function () {
            toggleTooltipInfos();
        }
    });

    // refresh tooltips on various events
    eventBus.on('shape.added', function () {
        _.defer(function () {
            refresh();
        });
    });
    eventBus.on('element.changed', function () {
        _.defer(function () {
            refresh();
        });
    });
    eventBus.on('shape.removed', function () {
        _.defer(function () {
            refresh();
        });
    });

    // enable/disable tooltips
    function toggleTooltipInfos() {
        if (TOOLTIP_INFOS_ENABLED) {
            TOOLTIP_INFOS_ENABLED = false;
            overlays.remove({type: 'tooltip-info'});
        } else {
            TOOLTIP_INFOS_ENABLED = true;
            _.defer(function () {
                refresh();
            });
        }
    }

    /**
     * refresh all tooltips for supported bpmn-elements
     */
    function refresh() {
        if (!TOOLTIP_INFOS_ENABLED) {
            return;
        }

        _.forEach(elementRegistry.getAll(), function (element) {
            if (!getExtensionElementsList(element.businessObject, "sustainability:Metric").length) return
            if (!supportedTypes.includes(element.type)) return;

            var id = element.id + '_tooltip_info';
            cleanTooltip(element);
            addListener(element, id);
            addTooltip(element, id);
        });
    }

    /**
     * add tooltip regarding an element, using the given tooltip-id in html
     */
    function addTooltip(element, tooltipId) {
        elementOverlays[element.id].push(
            overlays.add(
                element, 'tooltip-info',
                overlay(buildTooltipOverlay(element, tooltipId))));
    }

    /**
     * add tooltip header
     */
    function tooltipHeader(element) {
        return '<div class="tooltip-header"> \
              <div class="tooltip-container">' + 'Key Sustainability Indicators' + '</div>\
            </div>';
    }

    /**
     * container for details:
     *  - properties depending on element-type
     *  - e.g. type of implementation
     */
    function tooltipDetails(element) {
        if (element.businessObject == undefined) return '';

        var lines = [];
        var type = element.businessObject.$type;

        evaluateSustainabilityMetric(element, lines)

        return addHeaderRemoveEmptyLinesAndFinalize('Metrics', lines);
    }


    function evaluateSustainabilityMetric(element, lines) {
        const businessObject = getBusinessObject(element)
        const metricElement = getExtensionElementsList(businessObject, "sustainability:Metric")
        if (metricElement) {
            metricElement.forEach(value => {
                const sustainabilityIndicator = findSustainabilityIndicatorById(elementRegistry, value.indicatorRef)
                lines.push(tooltipLineText(sustainabilityIndicator.name + ` (${sustainabilityIndicator.period})`, value.value + ` (${sustainabilityIndicator.unit})`));
            })
        }
    }

    /* >-- helpers for bpmn-elements --< */

    function checkExtensionElementsAvailable(element) {
        if (element == undefined
            || element.businessObject == undefined
            || element.businessObject.extensionElements == undefined
            || element.businessObject.extensionElements.values == undefined
            || element.businessObject.extensionElements.values.length == 0)
            return false;

        return true;
    }


    function findExtensionByType(element, type) {
        if (!checkExtensionElementsAvailable(element))
            return undefined;

        return findExtension(element.businessObject.extensionElements.values, type);
    }


    function findExtension(values, type) {
        return _.find(values, function (value) {
            return value.$type == type;
        });
    }


    /* >-- methods to assemble tooltip lines --< */

    /**
     * add a single tooltip line as 'text'
     */
    function tooltipLineText(key, value) {
        return tooltipLineWithCss(key, value, 'tooltip-value-text');
    }

    /**
     * add a single tooltip line as 'code'
     */
    function tooltipLineCode(key, value) {
        return tooltipLineWithCss(key, value, 'tooltip-value-code');
    }

    /**
     * add a single tooltip line as 'code'
     */
    function tooltipLineCodeWithFallback(key, value, fallback) {
        if (value == undefined) {
            return tooltipLineCode(key, fallback);
        } else {
            return tooltipLineCode(key, value);
        }
    }

    /**
     * add a single tooltip line as <div> with 2 <span>,
     * like: <div><span>key: </span><span class="css">value</span></div>
     */
    function tooltipLineWithCss(key, value, css) {
        if (value == undefined) return '';
        return `<div class="tooltip-line"><span class="tooltip-key">${key}:&nbsp;</span><span class="tooltip-value ${css}">${value}</span></div>`;
    }

    /**
     * create a tooltip-container with header (e.g. 'Details') and add all respective properties.
     * if there is no property present, the container is not created.
     */
    function addHeaderRemoveEmptyLinesAndFinalize(subheader, lines) {
        var final = _.without(lines, "");
        if (final.length == 0) return '';

        var html = '<div class="tooltip-container"> \
                  <div class="tooltip-subheader">' + subheader + '</div>';

        _.each(final, function (line) {
            html += line;
        });

        return html += '</div>';
    }

    /**
     * show some hint in tooltip, if no relevant property was found,
     * otherwise join all lines that include some information
     */
    function emptyPropertiesIfNoLines(lines) {
        var final = _.without(lines, "");
        if (final.length == 0) {
            return `<div class="tooltip-no-properties ">${_html_no_properties_found}</div>`;
        }
        return final.join('');
    }

    /**
     * build a complete tooltip-overlay-html, consisting of header, and
     * detail-containers, if any information is, otherwise show resp. hint.
     *
     * some containers are disabled currently, bc. the information is not really needed
     * to show in tooltip, or can be visualized by other plugins already.
     */
    function buildTooltipOverlay(element, tooltipId) {
        return '<div id="' + tooltipId + '" class="tooltip"> \
              <div class="tooltip-content">'
            + tooltipHeader(element)
            + emptyPropertiesIfNoLines([
                tooltipDetails(element),
            ])
            + '</div> \
            </div>';
    }

    /**
     * create tooltip-overlay with options and content
     */
    function overlay(html) {
        return {
            position: {top: -30, left: 0},
            scale: false,
            show: {maxZoom: 2},
            html: html
        }
    }

    /**
     * clean up an element from overlays
     */
    function cleanTooltip(element) {
        if (elementOverlays[element.id] !== undefined && elementOverlays[element.id].length !== 0) {
            for (var overlay in elementOverlays[element.id]) {
                overlays.remove(elementOverlays[element.id][overlay]);
            }
        }
        elementOverlays[element.id] = [];
    }

    /**
     * add listeners to an element, that are responsible for showing/hinding the
     * tooltip if the cursor hovers the element
     */
    function addListener(element, tooltipId) {
        $('[data-element-id="' + element.id + '"]')
            .on('mouseenter', function () {
                $('#' + tooltipId).show();
            })
            .on('mouseleave', function () {
                $('#' + tooltipId).hide();
            });
    }

}


var elementOverlays = [];
const _html_ok = '&#10004;';
const _html_nok = '&#10006;';
const _html_na = 'n/a';
const _html_no_properties_found = 'no relevant properties found';
const supportedTypes = [
    'bpmn:CallActivity',
    'bpmn:BusinessRuleTask',
    'bpmn:ComplexGateway',
    'bpmn:EventBasedGateway',
    'bpmn:ExclusiveGateway',
    'bpmn:ParallelGateway',
    'bpmn:InclusiveGateway',
    'bpmn:ManualTask',
    'bpmn:ReceiveTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:SubProcess',
    'bpmn:Task',
    'bpmn:UserTask',
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateCatchEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:DataOutputAssociation',
    'bpmn:DataInputAssociation',
];

ToolTipService.$inject = [
    'eventBus',
    'overlays',
    'elementRegistry',
    'editorActions',
    'SDGRenderer'
];
