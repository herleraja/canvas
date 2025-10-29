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

const LinkProperties = ({ canvasController, selectedLinkId, pipelineId }) => {
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
		if (selectedLinkId && availableParamDefs.length > 0) {
			loadLinkProperties(selectedLinkId);
		} else {
			setShowPropertiesDialog(false);
			setPropertiesInfo({});
		}
	}, [selectedLinkId, pipelineId, availableParamDefs]);


	useEffect(() => {
		// load parameter definitions once
		FormsService.getFiles(PARAMETER_DEFS).then(setAvailableParamDefs);
	}, []);

	const getPropertyDefName = (link, node) => {
		if (node?.op) {
			const foundName = availableParamDefs.find((name) => name.startsWith("link") && name.toLowerCase().includes(node.op.toLowerCase()));

			if (foundName) {
				return { fileName: foundName, type: PARAMETER_DEFS };
			}
		}
		return null;
	};

	const loadLinkProperties = (linkId) => {
		const link = canvasController.getLink(linkId, pipelineId);
		const sourceNode = canvasController.getNode(link.srcNodeId, pipelineId);
		const propertyDef = getPropertyDefName(link, sourceNode);

		// eslint-disable-next-line no-unused-vars
		const { id, srcNodeId, srcNodePortId, trgNodeId, trgNodePortId, type, ...linkProperties } = link;

		if (propertyDef) {
			FormsService.getFileContent(propertyDef.type, propertyDef.fileName).then((properties) => {
				if (link) {
					properties.current_parameters = linkProperties || {};
					properties.titleDefinition = { title: "Link with source: " + sourceNode.op };
				}
				setPropertiesInfo({
					title: <FormattedMessage id="dialog.nodePropertiesTitle" />,
					formData: properties.formData,
					parameterDef: properties,
					appData: { linkId, pipelineId, inExtraCanvas: false },
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
			key={selectedLinkId}
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
					const decorations = [{ "position": "middle", "label": form.workflowState }];

					if (appData?.linkId) {
						canvasController.setLinkProperties(appData.linkId, form, appData.pipelineId);
						canvasController.setLinkDecorations(appData.linkId, decorations, appData.pipelineId);
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
	pipelineId: PropTypes.string,
};

export default LinkProperties;
