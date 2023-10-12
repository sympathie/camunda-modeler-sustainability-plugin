import {CollapsibleEntry, ListEntry, SelectEntry, TextFieldEntry} from "@bpmn-io/properties-panel";
import {createElement} from "../helpers/extensions-helper";
import {useService} from "bpmn-js-properties-panel";
import {without} from 'min-dash';
import {SustainableDevelopmentIndicators} from "./SDGIProps";
import {useEffect, useState} from '@bpmn-io/properties-panel/preact/hooks';



export function SustainableDevelopmentTargets(props) {
    const {
        id,
        element,
        listener
    } = props;

    const bpmnFactory = useService('bpmnFactory');
    const commandStack = useService('commandStack');
    const translate = useService('translate');

    const sustainableDevelopmentTargets = listener.get('sustainableDevelopmentTargets');

    function addSustainableDevelopmentTargets() {
        const target = createElement('sustainability:SustainableDevelopmentTarget', {}, listener, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                sustainableDevelopmentTargets: [...listener.get('sustainableDevelopmentTargets'), target]
            }
        });
    }

    function removeSustainableDevelopmentTargets(target) {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: listener,
            properties: {
                sustainableDevelopmentTargets: without(listener.get('sustainableDevelopmentTargets'), target)
            }
        });
    }

    return ListEntry({
        id: id,
        element: element,
        items: sustainableDevelopmentTargets,
        component: Target,
        label: translate('Sustainable Development Targets'),
        onAdd: addSustainableDevelopmentTargets,
        onRemove: removeSustainableDevelopmentTargets,
        autoFocusEntry: true
    })
}

function Target(props) {
    const {
        element,
        id: idPrefix,
        index,
        item: target,
        open
    } = props

    const targetId = `${idPrefix}-target-${index}`

    return CollapsibleEntry({
        id: idPrefix,
        element: element,
        entries: TargetInjection({
            element,
            target,
            idPrefix: targetId
        }),
        label: target.get('code') || '',
        open: true
    })
}

function TargetInjection(props) {

    const {
        element,
        idPrefix,
        target
    } = props;

    return [{
        id: idPrefix + '-name',
        component: TitleProperty,
        target,
        idPrefix,
        element
    }];
}

function TitleProperty(props) {
    const {
        idPrefix,
        element,
        target
    } = props;

    const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

    const [SDGTs, setSDGTs] = useState([]);

    useEffect(() => {
        function fetchSpells() {
            fetch(`https://unstats.un.org/sdgapi/v1/sdg/Goal/${target.$parent.code}/Target/List?includechildren=true`)
                .then(res => {
                    return res.json()
                })
                .then(sdgs => {
                    const targets = sdgs[0].targets
                    return setSDGTs(targets)
                })
                .catch(error => console.error(error));
        }

        fetchSpells();
    }, [setSDGTs]);

    const getOptions = () => {
        return [
            ...SDGTs.map(spell => ({
                label: spell.title,
                value: spell.title
            }))
        ];
    }

    const setValue = (value) => {
        const properties = SDGTs.find(value1 => value1.title === value)
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: target,
            properties: {
                code: properties.code,
                description: properties.description
            }
        });
    };

    const getValue = (target) => {
        return target.title || '';
    };

    return SelectEntry({
        element: target,
        id: idPrefix + '-title',
        label: translate('Description'),
        getValue,
        getOptions,
        setValue,
        debounce
    });
}

function DescriptionProperty(props) {
    const {
        idPrefix,
        element,
        target
    } = props;

    const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

    const setValue = (value) => {
        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: target,
            properties: {
                description: value
            }
        });
    };

    const getValue = (target) => {
        return target.description || '';
    };

    return TextFieldEntry({
        element: target,
        id: idPrefix + '-description',
        label: translate('Description'),
        getValue,
        setValue,
        debounce
    });
}
