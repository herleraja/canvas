/*
 * Copyright 2023 Elyra Authors
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

import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import StateNodeWrapper from "./wrapper-state-node.jsx";
import UsertaskNodeWrapper from "./wrapper-usertask-node.jsx";

// import ReactNodesFlow from "./workflow-flow.json";
import ReactNodesPalette from "./workflow-palette.json";
import FlowsProperties from "./flows-properties.jsx";

const WorkflowCanvas = (props) => {

	const propertiesRef = React.createRef();

	const canvasController = React.useMemo(() => {
		const instance = new CanvasController();
		// instance.setPipelineFlow(ReactNodesFlow);
		instance.setPipelineFlowPalette(ReactNodesPalette);
		return instance;
	}, []);

	const getConfig = () => {
		const config = Object.assign({}, props.config, {
			enableParentClass: "react-nodes-carbon",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableLinkReplaceOnNewConnection: true,
			paletteInitialState: true,
			enableResizableNodes: true,
			enableMarkdownInComments: true,
			enableDropZoneOnExternalDrag: true,
			enableContextToolbar: true,
			enableHighlightNodeOnNewLinkDrag: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "node_center",
				drawCommentLinkLineTo: "node_center",
				nodeShapeDisplay: false,
				nodeExternalObject: StateNodeWrapper,
				defaultNodeWidth: 220,
				defaultNodeHeight: 100,
				contextToolbarPosition: "topRight",
				ellipsisPosition: "topRight",
				ellipsisWidth: 30,
				ellipsisHeight: 30,
				ellipsisPosY: -35,
				ellipsisPosX: -30,
				imageDisplay: false,
				labelDisplay: false,

				inputPortObject: "image",
				inputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				inputPortWidth: 20,
				inputPortHeight: 20,

				outputPortRightPosX: 5,
				outputPortRightPosY: 30,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4,
				supernodeTopAreaHeight: 28,
				supernodeSVGAreaPadding: 5
			}
		});
		return config;
	};

	const layoutHandler = (node) => {
		if (node?.op && node.op.includes("shape-node")) {
			const config = {
				// selectionPath: "M -4 -4 h 36 v 36 h -36 Z",
				nodeExternalObject: UsertaskNodeWrapper,
				// defaultNodeWidth: 28,
				// defaultNodeHeight: 60,
				// className: "shape-node",
				// contextToolbarPosition: "topCenter",
				// inputPortDisplay: false,
				// inputPortLeftPosX: -12,
				// inputPortLeftPosY: 15,
				// outputPortRightPosX: 12,
				// outputPortRightPosY: 15
			};
			return config;
		}
		return null;
	};

	const clickActionHandler = (source) => {
		if (propertiesRef.current &&
			source.objectType === "node" &&
			source.clickType === "DOUBLE_CLICK") {
			propertiesRef.current.editNodeHandler(source.id, source.pipelineId);
		}
	};

	return (
		<CommonCanvas
			canvasController={canvasController}
			config={getConfig()}
			layoutHandler={layoutHandler}
			rightFlyoutContent={<FlowsProperties ref={propertiesRef} canvasController={canvasController} />}
			clickActionHandler={clickActionHandler}
			showRightFlyout
		/>
	);
};

WorkflowCanvas.propTypes = {
	config: PropTypes.object
};

export default WorkflowCanvas;
