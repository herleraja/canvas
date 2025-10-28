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

import React, { useState } from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import StateNodeWrapper from "./wrapper-state-node.jsx";
import UsertaskNodeWrapper from "./wrapper-usertask-node.jsx";

// import ReactNodesFlow from "./workflow-flow.json";
import ReactNodesPalette from "./workflow-palette.json";
import NodeProperties from "./node-properties.jsx";
import LinksProperties from "./link-properties.jsx";

const WorkflowCanvas = (props) => {
	const [selectedObject, setSelectedObject] = useState(null); // 👈 track selected node/link

	const canvasController = React.useMemo(() => {
		const instance = new CanvasController();
		// instance.setPipelineFlow(ReactNodesFlow);
		instance.setPipelineFlowPalette(ReactNodesPalette);
		instance.openPalette();
		return instance;
	}, []);

	const getConfig = () => {
		const config = Object.assign({}, props.config, {
			editDecorationLabel: true,
			enableParentClass: "workflow",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableSnapToGridType: "After",
			enableLinkSelection: "LinkOnly",
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
				links: false,
				decorations: true,
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
		if (node?.op && node.op.includes("usertask")) {
			const config = {
				nodeExternalObject: UsertaskNodeWrapper,
			};
			return config;
		}
		return null;
	};

	const clickActionHandler = (source) => {
		if (source.objectType === "node" && source.clickType === "DOUBLE_CLICK") {
			setSelectedObject({
				type: "node",
				id: source.id,
				pipelineId: source.pipelineId,
			});
		} else if (source.objectType === "link" && source.clickType === "SINGLE_CLICK") {
			setSelectedObject({
				type: "link",
				id: source.id,
				pipelineId: source.pipelineId,
			});
		} else {
			setSelectedObject(null);
		}
	};

	const rightFlyoutContent = () => {
		if (selectedObject?.type === "node") {
			return (<NodeProperties
				canvasController={canvasController}
				selectedNodeId={selectedObject.id}
				pipelineId={selectedObject.pipelineId}
			/>);
		} else if (selectedObject?.type === "link") {
			return (<LinksProperties
				canvasController={canvasController}
				selectedLinkId={selectedObject.id}
				pipelineId={selectedObject.pipelineId}
			/>);
		}

		return null;
	};

	return (
		<CommonCanvas
			canvasController={canvasController}
			config={getConfig()}
			layoutHandler={layoutHandler}
			clickActionHandler={clickActionHandler}
			rightFlyoutContent={rightFlyoutContent()}
			showRightFlyout={Boolean(selectedObject)}
		/>
	);
};

WorkflowCanvas.propTypes = {
	config: PropTypes.object
};

export default WorkflowCanvas;
