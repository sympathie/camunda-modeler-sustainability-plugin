import {SDG_ASSESSMENT_MODE_EVENT} from "../../util/EventHelper";
import {
    domify,
    classes as domClasses,
    event as domEvent,
    query as domQuery
} from 'min-dom';
import {LOGO_STYLES} from "bpmn-js/lib/util/PoweredByUtil";

export default function AssessmentToggleMode(
    eventBus, canvas, propertiesPanel
) {
    this._eventBus = eventBus
    this._canvas = canvas
    this._propertiesPanel = propertiesPanel

    this._active = false

    eventBus.on('diagram.init', () => {
        this._canvasParent = this._canvas.getContainer().parentNode
        this._palette = domQuery('.djs-palette', this._canvas.getContainer())
        this._propertiesPanelContainer = this._propertiesPanel._layoutConfig
        this._init()
    })

    AssessmentToggleMode.prototype._init = function () {
        this._container = domify(
            `
            <div class="sdg-toggle-mode">
                Sustainability Assessment
            </div>
            `
        )

        domEvent.bind(this._container, 'click', () => this.toggleMode())
        this._canvas.getContainer().appendChild(this._container);
    }

    AssessmentToggleMode.prototype.toggleMode = function (active = !this._active) {

        if (active === this._active) {
            return;
        }

        if (active) {
            this._container.innerHTML = `Sustainability Assessment (active)</span>`;

            domClasses(this._palette).add('hidden');
            this._propertiesPanelContainer.open = false
            console.log(this._propertiesPanelContainer)
        } else {
            this._container.innerHTML = `Sustainability Assessment</span>`;

            domClasses(this._palette).remove('hidden');
            this._propertiesPanelContainer.open = true
        }

        this._eventBus.fire(SDG_ASSESSMENT_MODE_EVENT, {
            active
        });

        this._active = active;
    };
}

AssessmentToggleMode.$inject = ['eventBus', 'canvas', 'propertiesPanel']
