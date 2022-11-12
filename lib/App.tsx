import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { render } from "react-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import { MenuItem, Typography } from "@mui/material";
import { GraphicsHandlerReturnType, GraphicsProps, MutateGraphicParamsFunction, MutatePostRenderParamsFunction, PostRenderParams, ViewMode } from "./types";
import ViewControllers from "./viewControllers";
import graphicsHandlers from "./graphicsHandlers";
const css = require("./css/App.css");

const APPLICATION_GRAPHICS_PARAMS_KEY = "graphicsParam";
export default function App() {
	const [viewMode , setViewMode] = useState<ViewMode | undefined>(); 
	const [canvasDimensions, setCanvasDimensions] = useState<{width?: number; height?: number;}>({})
	const toggleViewMode = (mode: ViewMode) =>  {
		if (viewMode === mode) setViewMode(undefined);
		else setViewMode(mode);
	}
	const classesMenuItem = {
		selected: css.menuSelected,
	};
	const storageGraphicsParam = sessionStorage.getItem(APPLICATION_GRAPHICS_PARAMS_KEY);
	const [graphicsParams, setGraphicsParams] = useState<GraphicsProps>(
		storageGraphicsParam ?
		JSON.parse(storageGraphicsParam) :
	{
		radius: 1,
		elipseW: 1.0,
		elipseH: 0.2,
		numberLeaves: 4,
		elipseScaler: 30,
		smoothIndex: 0.97,
		backgroundColor: 0xFFEEEE,
		lineColor: 0xFF0000,
		constructionMode: "lines",
	});

	const [postRenderParams, setPostRenderParams] = useState<PostRenderParams>({});
	
	const mutateGraphicsParams: MutateGraphicParamsFunction = (data) => {
			const newObj = {...graphicsParams, ...data };
			setGraphicsParams(newObj);
			sessionStorage.setItem(APPLICATION_GRAPHICS_PARAMS_KEY, JSON.stringify(newObj));
	}

	const mutatePostRenderParams: MutatePostRenderParamsFunction = (data) => { 
		const newObj = {...postRenderParams, ...data };
		setPostRenderParams(newObj);
	}

	const renderingHandler = useRef<GraphicsHandlerReturnType | undefined>();
	useEffect(() => { 
		if (viewMode) {
			const sidebar = document.querySelector("#sidebar > div");
			const displayPortWidth = document.body.clientWidth - sidebar.clientWidth; 
			const topbar = document.getElementById("topbar");
			const displayPortHeight = document.body.clientHeight - topbar.clientHeight;
			if (!renderingHandler.current) {
				renderingHandler.current = graphicsHandlers[viewMode]({ ...graphicsParams, width: displayPortWidth, height: displayPortHeight, mutatePostRenderParams });
			}
			renderingHandler.current.clear();
			renderingHandler.current.update(graphicsParams);
			renderingHandler.current.draw();
		} else {
			renderingHandler.current?.destroy();
			renderingHandler.current = undefined;
		}
	}, [viewMode, graphicsParams]);

	const getStats = () => { 
		const stats = [
			{ label: "Total Triangles", value: postRenderParams.overallTriangles   },
			{ label: "Total Lines", value: postRenderParams.overallLines   },
			{ label: "Total Points", value: postRenderParams.overallPoints },
		].filter(({ value }) => !!value);
		console.log(stats);
		return stats.map(({ label, value }) => <span>{`${label}: ${value}`}</span>);
	}
	return (
		<Container 
			classes={{
				root: css.containerRoot,
			}}
		>
			<Box>
				<AppBar>
					<Toolbar id="topbar">
						<MenuItem onClick={() => toggleViewMode("Step1_2DView")} selected={"Step1_2DView" === viewMode}
							classes={classesMenuItem}
						>
							<Typography textAlign="center">Design Shape (2D)</Typography>
						</MenuItem>
						<MenuItem 
							onClick={() => toggleViewMode("Step2_3DView")}  selected={"Step2_3DView" === viewMode}
							classes={classesMenuItem}
						>
							<Typography textAlign="center">Design Shape (3D)</Typography>
						</MenuItem>
						<div style={{ position: "absolute", right: 0, width:"300px", backgroundColor: "#000", opacity: 0.5, minHeight:"60px", display:"flex", flexDirection: "column"}}>
							{
								getStats()
							}	
						</div>
					</Toolbar>
				</AppBar>
			</Box>
			<Box>
				<Drawer
						variant="persistent"
						anchor="left"
						id="sidebar"
						open={!!viewMode}
						classes={{
							paperAnchorLeft: css.drawerPaper,
						}}
					>
						<ViewControllers 
							viewMode = {viewMode}
							mutateGraphicsParams={mutateGraphicsParams}
							values={graphicsParams}
						
						/>
				</Drawer>
			</Box>
			<Box>
				<div id="displayPort" style={{width: `${canvasDimensions.width || 0}px`, height: `${canvasDimensions.height || 0}px` }} />
			</Box>
		</Container>
	);
}
render(<App />, document.getElementById("app"))