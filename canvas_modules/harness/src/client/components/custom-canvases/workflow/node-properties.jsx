/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { isEmpty } from "lodash";
import FormsService from "../../../services/FormsService.js";
import { PARAMETER_DEFS, CUSTOM } from "../../../constants/harness-constants.js";
import CustomTableControl from "../../custom-controls/CustomTableControl.js";

const NodeProperties = ({ canvasController, selectedNodeId, pipelineId }) => {
	const [propertiesInfo, setPropertiesInfo] = useState({});
	const [availableParamDefs, setAvailableParamDefs] = useState([]);
	const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
	const commonPropsRef = useRef(null);

	useEffect(() => {
		if (commonPropsRef?.current) {
			console.log("commonPropsRef methods:", Object.keys(commonPropsRef.current || {}));
		}

	}, [commonPropsRef, commonPropsRef.current]);

	useEffect(() => {
		if (selectedNodeId && availableParamDefs.length > 0) {
			loadNodeProperties(selectedNodeId);


		} else {
			setShowPropertiesDialog(false);
			setPropertiesInfo({});
		}
	}, [selectedNodeId, pipelineId, availableParamDefs]);


	useEffect(() => {
		// load parameter definitions once
		FormsService.getFiles(PARAMETER_DEFS).then(setAvailableParamDefs);
	}, []);

	const getPropertyDefName = (node) => {
		if (node?.op) {
			const foundName = availableParamDefs.find((name) => name.startsWith(node.op));
			if (foundName) {
				return { fileName: foundName, type: PARAMETER_DEFS };
			}
		}
		return null;
	};

	const loadNodeProperties = (nodeId) => {
		const node = canvasController.getNode(nodeId, pipelineId);
		const propertyDef = getPropertyDefName(node);

		if (propertyDef) {
			FormsService.getFileContent(propertyDef.type, propertyDef.fileName).then((properties) => {
				if (node) {
					properties.current_parameters = node.parameters || {};
					properties.current_ui_parameters = node.uiParameters || {};
					properties.titleDefinition = { title: node.label };
				}
				setPropertiesInfo({
					title: <FormattedMessage id="dialog.nodePropertiesTitle" />,
					formData: properties.formData,
					parameterDef: properties,
					appData: { nodeId, pipelineId, inExtraCanvas: false },
					initialEditorSize: "small"
				});
				setShowPropertiesDialog(true);
			});
		}

	};

	const getPropertiesConfig = () => ({
		containerType: CUSTOM,
		rightFlyout: true,
		schemaValidation: true,
		applyPropertiesWithoutEdit: false,
		applyOnBlur: false,
		convertValueDataTypes: false,
		disableSaveOnRequiredErrors: true,
		trimSpaces: true,
		heading: true,
		showRequiredIndicator: true,
		showAlertsTab: true,
		returnValueFiltering: [],
		maxLengthForMultiLineControls: 1024,
		maxLengthForSingleLineControls: 128,
		locale: "en",
		iconSwitch: false
	});

	if (!showPropertiesDialog || isEmpty(propertiesInfo)) {
		return null;
	}


	return (
		<CommonProperties

			key={selectedNodeId}
			light
			ref={(instance) => {
				if (instance) {
					commonPropsRef.current = instance;
					commonPropsRef.current?.PropertiesMain?.propertiesController.validatePropertiesValues();

				}
			}}
			propertiesInfo={propertiesInfo}
			propertiesConfig={getPropertiesConfig()}
			customControls={[CustomTableControl]}
			callbacks={{
				applyPropertyChanges: (form, appData, additionalInfo, undoInfo, uiProperties) => {
					if (appData?.nodeId) {
						canvasController.setNodeParameters(appData.nodeId, form, appData.pipelineId);
						canvasController.setNodeLabel(appData.nodeId, additionalInfo.title, appData.pipelineId);
						canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages, appData.pipelineId);
						canvasController.setNodeUiParameters(appData.nodeId, uiProperties, appData.pipelineId);
					}
				},
				closePropertiesDialog: () => {
					setShowPropertiesDialog(false);
					setPropertiesInfo({});
				}
			}}
		/>
	);
};

NodeProperties.propTypes = {
	canvasController: PropTypes.object.isRequired,
	selectedNodeId: PropTypes.string,
	pipelineId: PropTypes.string,
	setSelectedObject: PropTypes.func
};

export default NodeProperties;


/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import { FormattedMessage } from "react-intl";
// import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
// import { isEmpty } from "lodash";
// import FormsService from "../../../services/FormsService";
// import { PARAMETER_DEFS, CUSTOM } from "../../../constants/harness-constants.js";
// import CustomTableControl from "../../../components/custom-controls/CustomTableControl";

// const FlowsProperties = ({ canvasController, selectedNodeId, pipelineId }) => {
// 	const [availableParamDefs, setAvailableParamDefs] = useState([]);
// 	const [propertiesInfo, setPropertiesInfo] = useState({});
// 	const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);

// 	// Load parameter definitions once
// 	useEffect(() => {
// 		FormsService.getFiles(PARAMETER_DEFS).then(setAvailableParamDefs);
// 	}, []);

// 	// Load node properties when selectedNodeId or pipelineId changes
// 	useEffect(() => {
// 		if (!selectedNodeId || !pipelineId || !availableParamDefs.length) {
// 			setShowPropertiesDialog(false);
// 			setPropertiesInfo({});
// 			return;
// 		}

// 		const node = canvasController.getNode(selectedNodeId, pipelineId);
// 		if (!node) {
// 			setShowPropertiesDialog(false);
// 			setPropertiesInfo({});
// 			return;
// 		}

// 		// Determine property definition file
// 		const propertyDef = availableParamDefs.find((name) => name.startsWith(node.op)) || "default.json";

// 		FormsService.getFileContent(PARAMETER_DEFS, typeof propertyDef === "string" ? propertyDef : propertyDef.fileName)
// 			.then((properties) => {
// 				properties.current_parameters = node.parameters || {};
// 				properties.current_ui_parameters = node.uiParameters || {};
// 				properties.titleDefinition = { title: node.label };

// 				setPropertiesInfo({
// 					title: <FormattedMessage id="dialog.nodePropertiesTitle" />,
// 					formData: properties.formData,
// 					parameterDef: properties,
// 					appData: { nodeId: selectedNodeId, pipelineId, inExtraCanvas: false },
// 					initialEditorSize: "small"
// 				});
// 				setShowPropertiesDialog(true);
// 			});
// 	}, [selectedNodeId, pipelineId, availableParamDefs, canvasController]);

// 	const handleApplyPropertyChanges = (form, appData, additionalInfo, undoInfo, uiProperties) => {
// 		if (appData?.nodeId) {
// 			canvasController.setNodeParameters(appData.nodeId, form, appData.pipelineId);
// 			canvasController.setNodeLabel(appData.nodeId, additionalInfo.title, appData.pipelineId);
// 			canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages, appData.pipelineId);
// 			canvasController.setNodeUiParameters(appData.nodeId, uiProperties, appData.pipelineId);
// 		}
// 	};

// 	const handleClose = () => {
// 		setShowPropertiesDialog(false);
// 		setPropertiesInfo({});
// 		canvasController.setSelections([]);
// 	};

// 	const getPropertiesConfig = () => ({
// 		containerType: CUSTOM,
// 		rightFlyout: true,
// 		schemaValidation: true,
// 		applyPropertiesWithoutEdit: false,
// 		applyOnBlur: false,
// 		convertValueDataTypes: false,
// 		disableSaveOnRequiredErrors: true,
// 		trimSpaces: true,
// 		heading: true,
// 		showRequiredIndicator: true,
// 		showAlertsTab: true,
// 		returnValueFiltering: [],
// 		maxLengthForMultiLineControls: 1024,
// 		maxLengthForSingleLineControls: 128,
// 		locale: "en",
// 		iconSwitch: false
// 	});

// 	if (!showPropertiesDialog || isEmpty(propertiesInfo)) {
// 		return null;
// 	}

// 	return (
// 		<CommonProperties
// 			propertiesInfo={propertiesInfo}
// 			propertiesConfig={getPropertiesConfig()}
// 			customControls={[CustomTableControl]}
// 			callbacks={{
// 				applyPropertyChanges: handleApplyPropertyChanges,
// 				closePropertiesDialog: handleClose
// 			}}
// 			light
// 		/>
// 	);
// };

// FlowsProperties.propTypes = {
// 	canvasController: PropTypes.object.isRequired,
// 	selectedNodeId: PropTypes.string,
// 	pipelineId: PropTypes.string
// };

// export default FlowsProperties;
