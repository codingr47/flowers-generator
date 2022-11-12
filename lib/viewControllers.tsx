import * as React from "react";
import { useState } from "react";
import { Box, InputLabel, List, MenuItem, Select, Slider, Tab, Tabs, Typography } from "@mui/material";
import { ConstructionModeEnum, GraphicsProps, ViewMode } from "./types";
import { ChromePicker } from "react-color";

const css = require("./css/viewControllers.css");


type Props = {
	viewMode: ViewMode;
	mutateGraphicsParams: (data: Partial<GraphicsProps>) => void;
	values: GraphicsProps;
};

type SliderProps = ControllerProps & {
	min: number;
	max: number;
	step: number;
}

type ControllerProps = {
	text: string;
	defaultVal: number;
	id: keyof GraphicsProps;
	mutateGraphicsParams: Props["mutateGraphicsParams"];
	onChange?: (value: any) => void;
}

type SelectBoxProps<T> = Omit<ControllerProps, "defaultVal"> & {
	defaultVal: string;
	options: T;
}

type ColorPickerProps = ControllerProps;

function ColorPicker({ mutateGraphicsParams, id, defaultVal, text }: ColorPickerProps) {
	const [currentColor, setCurrentColor] = useState<string>(`#${defaultVal.toString(16)}`)
	return (
		<Box 
			flex={1}
			flexGrow={1}
			display={"flex"}
			flexDirection={"column"}
			marginTop="30px"
		>
			<Typography
				marginLeft="20px"
				marginRight="40px"
			>
				{text}
			</Typography>
			{<ChromePicker 
				color={currentColor}
				onChangeComplete={(color) => { 
					setCurrentColor(color.hex);
					mutateGraphicsParams({ [id]: parseInt(color.hex.substring(1), 16) });
					
				}}
			/>}
		</Box>
	)
}

function SelectBoxComponent<T>({ mutateGraphicsParams, id, defaultVal, text, options, onChange}: SelectBoxProps<T>) {
	const [value, setValue] = useState<string>(defaultVal);
	const optionEntries = Object.entries(options);
	return (
		<Box 
			marginTop="30px"
		>
			 <InputLabel id={`label-${id}`}>{text}</InputLabel>
			<Select
				labelId={`label-${id}`}
				value={value}
				label={text}
				onChange={onChange ? (e) => { const value = e.target.value as string; setValue(value); onChange(value as string) } : (e) => { 
					    const value = (e.target.value as string);
						setValue(value); 
						mutateGraphicsParams({ [id]: value });
				}}
			>
				{optionEntries.map(([k, v]) => <MenuItem value={v}>{k}</MenuItem>)}
			</Select>
		</Box>
	);
}

function SliderComponent({min, max, step, text, defaultVal, id, mutateGraphicsParams, onChange }: SliderProps) {
	return (
		<Box 
		flex={1}
		flexGrow={1}
		display={"flex"}
		marginTop="30px"
	>
		<Typography
			marginLeft="20px"
			marginRight="40px"
		>
			{text}
		</Typography>
		<Slider 
			defaultValue={defaultVal}
			step={step}
			min={min}
			max={max}
			valueLabelDisplay="auto"
			onChange={onChange ? (e, value) => { onChange(value); } : (e, value) => { mutateGraphicsParams({ [id]: value }); }}
			id=""
			classes={{
				root: css.sliderRoot,
			}}
		/>
	</Box>
	);
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
  }

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`simple-tabpanel-${index}`}
		aria-labelledby={`simple-tab-${index}`}
		{...other}
	  >
		{value === index && (
		  <Box sx={{ p: 3 }}>
			<Typography>{children}</Typography>
		  </Box>
		)}
	  </div>
	);
}

function twoDComponents({ mutateGraphicsParams, values }: { mutateGraphicsParams: Props["mutateGraphicsParams"]; values: Props["values"] }) {
	const [currentTab, setCurrentTab] = React.useState(0);
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
	};
	return (
		<>
			 <Tabs value={currentTab} onChange={handleTabChange} aria-label="basic tabs example">
				<Tab label="Shape Properties" />
				<Tab label="Colors" />
			</Tabs>
			<TabPanel value={currentTab} index={0}>
				<List>
					<SliderComponent 
						step={0.5}
						defaultVal={values["radius"]}
						max={10}
						min={0.5}
						text="Elipse Radius"
						id="radius"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SliderComponent 
						step={0.1}
						defaultVal={values["elipseW"]}
						max={10}
						min={0.5}
						text="Elipse Width"
						id="elipseW"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SliderComponent 
						step={0.1}
						defaultVal={values["elipseH"]}
						max={10}
						min={0.2}
						text="Elipse Height"
						id="elipseH"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SliderComponent 
						step={1}
						defaultVal={values["numberLeaves"]}
						max={12}
						min={2}
						text="Number of leaves"
						id="numberLeaves"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SliderComponent 
						step={1}
						defaultVal={values["elipseScaler"]}
						max={120}
						min={1}
						text="Elipse Size Scaler"
						id="elipseScaler"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SliderComponent 
						step={0.01}
						defaultVal={values["smoothIndex"]}
						max={0.99}
						min={0}
						text="Smoothing Index"
						id="smoothIndex"
						mutateGraphicsParams={mutateGraphicsParams}
					/>
					<SelectBoxComponent<typeof ConstructionModeEnum>
						id="constructionMode"
						text="Rendering Mode"
						defaultVal={values["constructionMode"]}
						mutateGraphicsParams={mutateGraphicsParams}
						options={ConstructionModeEnum}
						onChange={(v) =>  { 
							const newObj: Partial<GraphicsProps> = {}
							if ("lines" === (v as GraphicsProps["constructionMode"])) {
								newObj.wireFrame = false;
							}
							newObj.constructionMode = v;
							mutateGraphicsParams(newObj); 
						}}

					/>
					{ "polygons" === values["constructionMode"] &&
					<SliderComponent 
						step={1}
						defaultVal={values["wireFrame"] ? 1 : 0}
						max={1}
						min={0}
						text="Wireframe ?"
						id="wireFrame"
						mutateGraphicsParams={mutateGraphicsParams}
						onChange = {(v) => { 
							mutateGraphicsParams({ wireFrame: 1 === v ? true : false }); 
						}}
					/>
					}
				</List>
			</TabPanel>
			<TabPanel value={currentTab} index={1}>
				<List>
					<ColorPicker 
						id="backgroundColor"
						mutateGraphicsParams={mutateGraphicsParams}
						text="Background Color"
						defaultVal={values["backgroundColor"]}
					/>
					<ColorPicker 
						id="lineColor"
						mutateGraphicsParams={mutateGraphicsParams}
						text="Lines Color"
						defaultVal={values["lineColor"]}
					/>
				</List>
			</TabPanel>
		</>
	);
}

function threeDComponents() {
	return (
		<div>
			asdzxcvmasdkj
		</div>
	);
}

export default function ({ viewMode, mutateGraphicsParams, values }: Props) {
	const getComponentsByViewMode = () => { 
		if ("Step1_2DView" === viewMode) {
			return twoDComponents({
				mutateGraphicsParams,
				values,
			});
		} else if("Step2_3DView" === viewMode) {
			return threeDComponents();
		} else {
			return <div />;
		}
	}
	return (
		<Box>
			{getComponentsByViewMode()}
		</Box>
	);
}