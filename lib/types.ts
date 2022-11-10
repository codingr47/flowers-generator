export type ViewMode = "2DView" | "3DView"; 

export const ConstructionModeEnum = {
	Lines: "lines",
	Polygons: "polygons"
} as const;

type ReverseMap<T> = T[keyof T];

export type GraphicsProps = {
	radius: number;
	elipseW: number;
	elipseH: number;
	numberLeaves: number;
	elipseScaler: number;
	smoothIndex: number;
	backgroundColor: number;
	lineColor: number;
	constructionMode: ReverseMap<typeof ConstructionModeEnum>;
	wireFrame?: boolean;
} 

export type PostRenderParams = {
	overallTriangles?: number;
	overallPoints?: number;
	overallLines?: number;
}

export type AutomaticallyComputedProps = {
	width: number;
	height: number;
}

export type MutateGraphicParamsFunction = (data: Partial<GraphicsProps>) => void;

export type MutatePostRenderParamsFunction = (data: Partial<PostRenderParams>) => void;


export type HandlerProps = {
	mutatePostRenderParams: MutatePostRenderParamsFunction;
}