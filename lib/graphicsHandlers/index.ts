
import { AutomaticallyComputedProps, GraphicsHandlerReturnType, HandlerProps, ViewMode } from "../types";
import step1Handler from "./handlerStep1";
import step2Handler from "./handlerStep2";

const handlers: { [k in ViewMode]: (params: AutomaticallyComputedProps & HandlerProps) => GraphicsHandlerReturnType} = {
	Step1_2DView: step1Handler,
	Step2_3DView: step2Handler,
} as const;

export default handlers;