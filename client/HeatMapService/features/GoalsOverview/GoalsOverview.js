import {SELECT_SDG_EVENT, SDG_ASSESSMENT_MODE_EVENT} from "../../util/EventHelper";
import {domify, event as domEvent, query as domQuery} from 'min-dom';
import {is} from "bpmn-js/lib/util/ModelUtil";
import {getExtensionElementsList} from "../../../SDGPropertiesPanel/helpers/extensions-helper";

const images = importAll(require.context('/resources/SDGIcons', false, /\.(png|jpe?g|svg)$/));

export default function GoalsOverview(
    eventBus, canvas, elementRegistry
) {
    this._eventBus = eventBus
    this._canvas = canvas
    this._elementRegistry = elementRegistry

    this._active = false

    eventBus.on(SDG_ASSESSMENT_MODE_EVENT, (event) => {
        if (!event.active) {
            this._hideContainer()
        } else {
            this._elementRegistry.forEach(value => {
                if (is(value, "bpmn:Collaboration") || is(value, "bpmn:Process") ) {
                    if (getExtensionElementsList(value.businessObject, "sustainability:SustainableDevelopmentGoal")) {
                        this._sdgs = getExtensionElementsList(value.businessObject, "sustainability:SustainableDevelopmentGoal")
                    }
                }
            })

            this._canvasParent = this._canvas.getContainer().parentNode;
            this._palette = domQuery('.djs-palette', this._canvas.getContainer());

            this._init()
        }
    })

    GoalsOverview.prototype._hideContainer = function () {
        this._canvas.getContainer().removeChild(this._container)
        this._container = null
    }


    GoalsOverview.prototype._init = function () {
        this._container = domify(
            `
            <div class="goals-overview-container">
            </div>
            `
        )

        this._sdgs.forEach(value => {
            const sdgContainer = this._container.appendChild(
                domify(
                    `
                        <div id="${value.code}" class="sdg-icon">
                        <img class="sdg-icon" src="${images[value.code + '.jpg'].default}" alt="">
                        </div>
                        `
                )
            )
            domEvent.bind(sdgContainer, 'click', () => this._selectGoal(value))
        })

        this._canvas.getContainer().appendChild(this._container);
        // domEvent.bind(this._container.getElementById(value.code), 'click', () => this._selectGoal(value))
    }

    GoalsOverview.prototype._selectGoal = function (goal) {
        this._eventBus.fire(SELECT_SDG_EVENT, {
            goal
        });
    }
}

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => {
        images[item.replace('./', '')] = r(item);
    });
    return images;
}

GoalsOverview.$inject = ['eventBus', 'canvas', 'elementRegistry']
