import {
  registerBpmnJSModdleExtension,
  registerBpmnJSPlugin, registerPlatformBpmnJSPlugin
} from 'camunda-modeler-plugin-helpers';

import sustainabilityExtension from "../resources/KeySustainabilityIndicator.json"
import BpmnExtensionModule from './bpmn-js-extension';
import SDGExtension from "./SDGPropertiesPanel";
import SDGRenderer from "./SDGRenderer";
import ToolTipService from './ToolTipService';
import HeatMapService from "./HeatMapService";
import ToggleMode from "./HeatMapService/features/ToggleMode";
import GoalsOverview from "./HeatMapService/features/GoalsOverview";
import IndicatorOverview from "./HeatMapService/features/indicatorOverview";

registerBpmnJSPlugin(BpmnExtensionModule);
registerPlatformBpmnJSPlugin(SDGExtension)
registerPlatformBpmnJSPlugin(SDGRenderer)
registerBpmnJSModdleExtension(sustainabilityExtension)
registerPlatformBpmnJSPlugin(ToolTipService);
registerPlatformBpmnJSPlugin(HeatMapService)
registerPlatformBpmnJSPlugin(ToggleMode)
registerPlatformBpmnJSPlugin(GoalsOverview)
registerPlatformBpmnJSPlugin(IndicatorOverview)
