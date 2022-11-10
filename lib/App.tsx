import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { render } from "react-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import { MenuItem, Typography } from "@mui/material";
import { GraphicsProps, MutateGraphicParamsFunction, MutatePostRenderParamsFunction, PostRenderParams, ViewMode } from "./types";
import ViewControllers from "./viewControllers";
import twoDHandler from "./twoDHandler";
const css = require("./css/App.css");

const APPLICATION_GRAPHICS_PARAMS_KEY = "graphicsParam";
export default function App() {
	const [viewMode , setViewMode] = useState<ViewMode | undefined>(); 
	const [canvasDimensions, setCanvasDimensions] = useState<{width?: number; height?: number;}>({})
	const toggleViewMode = (mode: ViewMode) =>  {
		if (viewMode === mode) setViewMode(undefined);
		else setViewMode(mode);
	}
	const [showViewport, setShowVieport] = useState<boolean>(true);
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

	const viewTimeoutRef = useRef<NodeJS.Timeout | undefined>();
	useEffect(() => { 
		if (viewMode) {
			const sidebar = document.querySelector("#sidebar > div");
			const displayPortWidth = document.body.clientWidth - sidebar.clientWidth; 
			const topbar = document.getElementById("topbar");
			const displayPortHeight = document.body.clientHeight - topbar.clientHeight;

			setShowVieport(false);
			if (viewTimeoutRef.current) {
				clearTimeout(viewTimeoutRef.current);
			}
			viewTimeoutRef.current = setTimeout(() => { 
				setShowVieport(true);
				twoDHandler({ ...graphicsParams, width: displayPortWidth, height: displayPortHeight, mutatePostRenderParams });
			}, 50);
			
		} else {
			setShowVieport(false);
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
						<MenuItem onClick={() => toggleViewMode("2DView")} selected={"2DView" === viewMode}
							classes={classesMenuItem}
						>
							<Typography textAlign="center">2D View</Typography>
						</MenuItem>
						<MenuItem 
							onClick={() => toggleViewMode("3DView")}  selected={"3DView" === viewMode}
							classes={classesMenuItem}
						>
							<Typography textAlign="center">3D View</Typography>
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
				{showViewport && <div id="displayPort" style={{width: `${canvasDimensions.width || 0}px`, height: `${canvasDimensions.height || 0}px` }} />}
			</Box>
		</Container>
	);
}
render(<App />, document.getElementById("app"))