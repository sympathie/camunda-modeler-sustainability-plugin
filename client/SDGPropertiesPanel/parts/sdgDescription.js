import {useService} from "bpmn-js-properties-panel";
import {TextAreaEntry} from "@bpmn-io/properties-panel";

export function SDGDescription(props) {
    const {id, element, listener} = props

    const modeling = useService('modeling')
    const translate = useService('translate')
    const debounce = useService('debounceInput')

    const setValue = (value) => {
        return listener.description = value
    }

    const getValue = () => {
        return listener.description || ''
    }

    return TextAreaEntry({
        element: listener,
        id,
        label: translate('Description'),
        getValue,
        setValue,
        disabled: true,
        debounce
    })
}
