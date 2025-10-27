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
import { Button } from "@carbon/react";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import CardNodeWrapper from "../wrapper-card-node.jsx";
import ShapeNodeWrapper from "../wrapper-shape-node.jsx";

import ReactNodesFlow from "./react-nodes-carbon-canvas-with-bpmn-flow.json";
import ReactNodesPalette from "./react-nodes-carbon-canvas-with-bpmn-palette.json";
import FlowsProperties from "../../flows/flows-properties.jsx";

import JavascriptFileDownload from "js-file-download";

const ReactNodesCarbonBPMNCanvas = (props) => {

	const propertiesRef = React.createRef();

	const canvasController = React.useMemo(() => {
		const instance = new CanvasController();
		instance.setPipelineFlow(ReactNodesFlow);
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
			enableKeyboardNavigation: true,
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
				nodeExternalObject: CardNodeWrapper,
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

				inputPortLeftPosX: -1,
				inputPortLeftPosY: 50,
				inputPortObject: "image",
				inputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				inputPortWidth: 20,
				inputPortHeight: 20,

				outputPortRightPosX: 1,
				outputPortRightPosY: 50,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",

				errorXPos: 200,
				errorYPos: 5,
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
		if (node?.op && node.op.includes("Event")) {
			const config = {
				selectionPath: "M -4 -4 h 36 v 36 h -36 Z",
				nodeExternalObject: ShapeNodeWrapper,
				defaultNodeWidth: 28,
				defaultNodeHeight: 60,
				className: "shape-node",
				contextToolbarPosition: "topCenter",
				inputPortDisplay: false,

				inputPortLeftPosX: -1,
				inputPortLeftPosY: 15,

				outputPortRightPosX: 1,
				outputPortRightPosY: 15
			};
			return config;
		}
		return null;
	};

	const clickActionHandler = ({ objectType, clickType, id, pipelineId }) => {
		if (propertiesRef.current && objectType === "node" && clickType === "DOUBLE_CLICK") {

			const node = canvasController.getNode(id, pipelineId);
			if (node?.op === "userTask") {
				propertiesRef.current.editNodeHandler(id, pipelineId);
			}
		}
	};

	const downloadPipelineFlow = () => {
		const pipelineFlow = canvasController.getPipelineFlow();
		const canvas = JSON.stringify(pipelineFlow, null, 2);
		JavascriptFileDownload(canvas, "canvas.json");
	};


	return (
		<>
			<Button onClick={() => downloadPipelineFlow()}>Download Pipeline Flow</Button>
			<CommonCanvas
				canvasController={canvasController}
				config={getConfig()}
				layoutHandler={layoutHandler}
				rightFlyoutContent={<FlowsProperties ref={propertiesRef} canvasController={canvasController} />}
				clickActionHandler={clickActionHandler}
				showRightFlyout
			/>
		</>
	);
};

ReactNodesCarbonBPMNCanvas.propTypes = {
	config: PropTypes.object
};

export default ReactNodesCarbonBPMNCanvas;
