import {SELECT_INDICATOR_EVENT, SELECT_SDG_EVENT, SDG_ASSESSMENT_MODE_EVENT} from "../../util/EventHelper";
import {classes, domify, event as domEvent} from "min-dom";
import {getExtensionElementsList} from "../../../SDGPropertiesPanel/helpers/extensions-helper";

const images = importAll(require.context('/resources/SDGIcons', false, /\.(png|jpe?g|svg)$/));

export default function IndicatorOverview(eventBus, elementRegistry, canvas) {
    this._eventBus = eventBus
    this._elementRegistry = elementRegistry
    this._canvas = canvas
    this._indicators = []

    this._eventBus.on(SELECT_SDG_EVENT, (event) => {
        if (this._container && event.goal.code === this._goal.code) {
            this._hideContainer()
        } else {
            this._goal = event.goal
            this._refresh(event.goal)
            this._init(event.goal)
        }
    })

    this._eventBus.on(SDG_ASSESSMENT_MODE_EVENT, (event) => {
        if (!event.active && this._container) {
            this._hideContainer()
        }
    })

    IndicatorOverview.prototype._hideContainer = function () {
        this._canvas.getContainer().removeChild(this._container)
        this._container = null
    }

    IndicatorOverview.prototype._refresh = function (goal) {
        this._indicators = []
        this._elementRegistry.forEach(element => {
            const indicatorElements = getExtensionElementsList(element.businessObject, "sustainability:SustainabilityIndicator")
            indicatorElements.forEach(indicatorElement => {
                indicatorElement.impacts.forEach(impact => {
                    console.log('impacts', impact)
                    if (impact.sustainableDevelopmentIndicatorRef.substring(0, impact.sustainableDevelopmentIndicatorRef.indexOf('.')) === goal.code && !this._indicators.includes(indicatorElement)) {
                        console.log('pushed')
                        this._indicators.push(indicatorElement)
                    }
                })
            })
        })
    }

    IndicatorOverview.prototype._init = function (goal) {
        if (this._container) {
            this._canvas.getContainer().removeChild(this._container);
        }

        const container = document.createElement('div');
        container.classList.add('indicator-overview-container');

        const header = document.createElement('div');
        header.classList.add('indicator-overview-header');

        header.innerHTML = `
        <img class="indicator-overview-header-image" src="${images[goal.code + '.jpg'].default}" alt="">
        <h2>${goal.code}: ${goal.title}</h2>
    `;

        container.appendChild(header);

        goal.sustainableDevelopmentTargets.forEach(target => {
            const targetContainer = document.createElement('div');
            targetContainer.classList.add('target-container');

            const h3 = document.createElement('h3');
            h3.textContent = `${target.code}: ${target.description}`;
            targetContainer.appendChild(h3);

            this._indicators.forEach(indicator => {
                const matchingImpact = indicator.impacts.find(impact => impact.sustainableDevelopmentIndicatorRef === target.code);

                if (matchingImpact) {
                    const button = document.createElement('button');
                    button.id = indicator.id;
                    button.classList.add('sbpmn-button', 'indicator-button');
                    const information = document.createElement('div');
                    const buttonText = document.createElement('h3');
                    buttonText.textContent = `${indicator.name} (${indicator.unit} / ${indicator.period})`;
                    const quantificationMethod = document.createElement('div');
                    quantificationMethod.textContent = `Quantification / Normalization Method: ${indicator.quantificationMethod}`
                    information.appendChild(quantificationMethod)
                    information.appendChild(buttonText)
                    button.appendChild(information)
                    button.addEventListener('click', () => this._selectIndicator(indicator));
                    targetContainer.appendChild(button);
                }
            })

            container.appendChild(targetContainer);
        });

        this._container = container;
        this._canvas.getContainer().appendChild(this._container);
    };

    IndicatorOverview.prototype._selectIndicator = (indicator) => {
        // remove old selected from button
        const indicatorButtons = document.getElementsByClassName("indicator-button")
        for (let indicatorButton of indicatorButtons) {
            classes(indicatorButton).remove("selected")
        }

        // add new selected to button
        const button = document.getElementById(indicator.id)
        classes(button).add('selected')
        this._eventBus.fire(SELECT_INDICATOR_EVENT, {
            indicator
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

function mapIndicators(indicatorElements, goal) {
    let result = []

    indicatorElements.forEach(indicator => {
        goal.sustainableDevelopmentTargets.forEach(targets => {
            targets.indicators.forEach(SDGIndicator => {
                if (SDGIndicator.code === indicator.sustainableDevelopmentIndicatorRef) {

                }
            })
        })
    })
}

IndicatorOverview.$inject = ['eventBus', "elementRegistry", "canvas"]
