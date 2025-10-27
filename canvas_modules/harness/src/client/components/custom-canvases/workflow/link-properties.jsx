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

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { isEmpty } from "lodash";
import FormsService from "../../../services/FormsService";
import { PARAMETER_DEFS, CUSTOM } from "../../../constants/harness-constants.js";
import CustomTableControl from "../../../components/custom-controls/CustomTableControl";

const LinkProperties = ({ canvasController, selectedLinkId, pipelineId }) => {
	console.log("🚀 ~ LinkProperties ~ pipelineId:", pipelineId)
	console.log("🚀 ~ LinkProperties ~ selectedNodeId:", selectedLinkId)
	const [propertiesInfo, setPropertiesInfo] = useState({});
	const [availableParamDefs, setAvailableParamDefs] = useState([]);
	const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);

	useEffect(() => {
		// load parameter definitions once
		FormsService.getFiles(PARAMETER_DEFS).then(setAvailableParamDefs);
	}, []);

	useEffect(() => {
		if (selectedLinkId) {
			loadNodeProperties(selectedLinkId);
		} else {
			setShowPropertiesDialog(false);
			setPropertiesInfo({});
		}
	}, [selectedLinkId, pipelineId]);

	const getPropertyDefName = (link) => {
		console.log("🚀 ~ getPropertyDefName ~ link:", link)
		
		// if (node?.op) {
		// 	const foundName = availableParamDefs.find((name) => name.startsWith(node.op));
		// 	if (foundName) {
		// 		return { fileName: foundName, type: PARAMETER_DEFS };
		// 	}
		// }
		return { fileName: "default.json", type: PARAMETER_DEFS };
	};

	const loadNodeProperties = (linkId) => {
		const link = canvasController.getLink(linkId, pipelineId);
		const propertyDef = getPropertyDefName(link);
		FormsService.getFileContent(propertyDef.type, propertyDef.fileName).then((properties) => {
			if (link) {
				properties.current_parameters = link.parameters || {};
				properties.current_ui_parameters = link.uiParameters || {};
				properties.titleDefinition = { title: link.label };
			}
			setPropertiesInfo({
				title: <FormattedMessage id="dialog.nodePropertiesTitle" />,
				formData: properties.formData,
				parameterDef: properties,
				appData: { link, pipelineId, inExtraCanvas: false },
				initialEditorSize: "small"
			});
			setShowPropertiesDialog(true);
		});
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

	console.log("🚀 ~ LinkProperties ~ propertiesInfo:", propertiesInfo)
	console.log("🚀 ~ LinkProperties ~ showPropertiesDialog:", showPropertiesDialog)
	if (!showPropertiesDialog || isEmpty(propertiesInfo)) {
		return null;
	}

	return (
		<CommonProperties
			propertiesInfo={propertiesInfo}
			propertiesConfig={getPropertiesConfig()}
			customControls={[CustomTableControl]}
			callbacks={{
				applyPropertyChanges: (form, appData, additionalInfo, undoInfo, uiProperties) => {
					console.log("🚀 ~ LinkProperties ~ appData:", appData);
					if (appData?.link?.id) {
							console.log("🚀 ~ LinkProperties ~ appData: SAVED");
						// canvasController.setLinkProperties(appData.linkId, form, appData.pipelineId);
						// canvasController.setLinkProperties(appData.link.id, { test: 123 }, appData.pipelineId);
						canvasController.setLinkDecorations(appData.link.id,
							[{ "id": "dec1", "position": "source", "class_name": "dec-class", "hotspot": true, label: "asdasdasdasdasd" }
							], appData.pipelinId);


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

LinkProperties.propTypes = {
	canvasController: PropTypes.object.isRequired,
	selectedLinkId: PropTypes.string,
	pipelineId: PropTypes.string
};

export default LinkProperties;
