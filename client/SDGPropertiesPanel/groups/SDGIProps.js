import {CollapsibleEntry, ListEntry, SelectEntry, TextFieldEntry} from "@bpmn-io/properties-panel";
import {createElement} from "../helpers/extensions-helper";
import {useService} from "bpmn-js-properties-panel";
import {without} from 'min-dash';
import {useEffect, useState} from '@bpmn-io/properties-panel/preact/hooks';


export function SustainableDevelopmentIndicators(props) {
    const {
        id,
        element,
        listener
    } = props;

    const bpmnFactory = useService('bpmnFactory');
    const commandStack = useService('commandStack');
    const translate = useService('translate');

    const sustainableDevelopmentIndicators = listener.get('indicators');

    function addSustainableDevelopmentIndicators() {
        const indicator = createElement('sustainability:SustainableDevelopmentIndicator', {}, listener, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                indicators: [...listener.get('indicators'), indicator]
            }
        });
    }

    function removeSustainableDevelopmentIndicators(target) {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                indicators: without(listener.get('indicators'), target)
            }
        });
    }

    return ListEntry({
        id: id,
        element: element,
        items: sustainableDevelopmentIndicators,
        component: Indicator,
        label: translate('Sustainable Development Indicators'),
        onAdd: addSustainableDevelopmentIndicators,
        onRemove: removeSustainableDevelopmentIndicators,
        autoFocusEntry: true
    })
}

function Indicator(props) {
    const {
        element,
        id: idPrefix,
        index,
        item: indicator,
        open
    } = props

    const indicatorId = `${idPrefix}-indicator-${index}`

    return CollapsibleEntry({
        id: idPrefix,
        element: element,
        entries: IndicatorInjection({
            element,
            indicator,
            idPrefix: indicatorId
        }),
        label: indicator.get('code') || '',
        open: true
    })
}

function IndicatorInjection(props) {

    const {
        element,
        idPrefix,
        indicator
    } = props;

    return [{
        id: idPrefix + '-description',
        component: DescriptionProperty,
        indicator,
        idPrefix,
        element
    }];
}

function DescriptionProperty(props) {
    const {
        idPrefix,
        element,
        indicator
    } = props;

    const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');
    const [SDGIs, setSDGIs] = useState([]);

    const setValue = (value) => {
        const SDGI = SDGIs.find(value1 => value1.description === value)
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: indicator,
            properties: {
                description: value,
                code: SDGI.code,
                tier: SDGI.tier
            }
        });
    };

    useEffect(() => {
        function fetchSpells() {
            fetch(`https://unstats.un.org/sdgapi/v1/sdg/Target/${indicator.$parent.code}/Indicator/List?includechildren=true`)
                .then(res => {
                    return res.json()
                })
                .then(sdgs => {
                    return setSDGIs(sdgs[0].indicators)
                })
                .catch(error => console.error(error));
        }

        fetchSpells();
    }, [setSDGIs]);

    const getOptions = () => {
        return [
            ...SDGIs.map(spell => ({
                label: spell.description,
                value: spell.description
            }))
        ];
    }

    const getValue = (indicator) => {
        return indicator.description || '';
    };

    return SelectEntry({
        element: indicator,
        id: idPrefix + '-description',
        label: translate('Description'),
        getOptions,
        getValue,
        setValue,
        debounce
    });
}
