import {useService} from "bpmn-js-properties-panel";
import {SelectEntry} from "@bpmn-io/properties-panel";
import {loadSustainableDevelopmentGoals} from "../helpers/extensions-helper";
import axios from "axios";
// import hooks from the vendored preact package
import {useEffect, useState} from '@bpmn-io/properties-panel/preact/hooks';

export function SDGTitle(props) {
    const {id, element, sustainabilityGoalElement} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')
    const commandStack = useService('commandStack')
    const [sdgs, setSdgs] = useState([]);

    const setValue = (value) => {
        const sdg = sdgs.find(value1 => value1.title === value)

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: sustainabilityGoalElement,
            properties: {
                title: sdg.title,
                code: sdg.code,
                description: sdg.description
            }
        });
    }

    const getValue = () => {
        return sustainabilityGoalElement.title || ''
    }


    useEffect(() => {
        function fetchSpells() {
            fetch('https://unstats.un.org/sdgapi/v1/sdg/Goal/List?includechildren=false')
                .then(res => {
                    return res.json()
                })
                .then(sdgs => {
                    return setSdgs(sdgs)
                })
                .catch(error => console.error(error));
        }

        fetchSpells();
    }, [setSdgs]);

    const getOptions = () => {
        return [
            ...sdgs.map(spell => ({
                label: spell.title,
                value: spell.title
            }))
        ];
    }

    return SelectEntry({
        element: sustainabilityGoalElement,
        id,
        description: sustainabilityGoalElement.description ? sustainabilityGoalElement.description : '' ,
        label: translate('Sustainable Development Goal'),
        getOptions,
        getValue,
        setValue
    })
}
