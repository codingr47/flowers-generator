import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import { 
	AutomaticallyComputedProps,
	GraphicsHandlerReturnType,
	GraphicsProps,
	HandlerProps,
} from "../types";


function getElipseY(x: number, a: number, b: number, r: number,   plus: boolean) { 
	//based on the equation y = SQRT(1 - (x^2 * b^2 ) / a^2)
	const res = Math.sqrt( (Math.pow(r, 2) * b) - ((Math.pow(x, 2) * b) / a));
	if (plus) return res;
	return  -1 * res;
}	
function getElipseMaxX(a: number, r: number) {
	return Math.sqrt(Math.pow(r, 2) * a );
}

export default function({ 
		width,
		height,
		mutatePostRenderParams,
	}: AutomaticallyComputedProps & HandlerProps ) : GraphicsHandlerReturnType { 

	let currentProps: GraphicsProps | undefined;
	const screenWidth = width;
	const screenHeight = height;
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({});
	let points: THREE.Vector3[] = [];
	let mainObjectsGroup: THREE.Group = new THREE.Group();
	const minLeft = -0.5;
	const displayPort = document.getElementById("displayPort");
	let sceneObjects: THREE.Object3D[] = [];
	displayPort.appendChild(renderer.domElement);
	const light = new THREE.AmbientLight( 0x808080 ); // soft white light
	scene.add(light);
	renderer.setSize(screenWidth, screenHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	const camera = new THREE.PerspectiveCamera( 45,screenWidth / screenHeight, 1, -50 );
	camera.position.set(0, 0, 500);
	camera.lookAt( 0, 0, 0);
	const moveMouse = ({ movementX, movementY, buttons }: MouseEvent) => {
		if (1 === buttons) { 
			if (Math.abs(movementY)  > 0) { 
				mainObjectsGroup.rotateZ(degToRad(movementY));
			}
			if (Math.abs(movementX)  > 0) { 
				mainObjectsGroup.rotateX(degToRad(movementX));
				
			}
			renderer.render(scene, camera);
		}
	}
	renderer.domElement.addEventListener("mousemove", moveMouse);
	return {
		update: (props) => {
			currentProps = props;
			const {
				backgroundColor,
				constructionMode,
				elipseH,
				elipseScaler,
				elipseW,
				lineColor,
				numberLeaves,
				radius,
				smoothIndex,
				wireFrame,
				extrudeSettings,
			} = currentProps;
			const scaler = elipseScaler;
			const incremental = 1 - smoothIndex;
			const r = radius;	
			const maxX = getElipseMaxX(elipseW, r);
			for(let i = -1 * maxX; i<=maxX; i = i + incremental) {
				if(i >= minLeft) points.push(new THREE.Vector3(i, getElipseY(i, elipseW, elipseH,r, true), 0));
			}
			for(let i = maxX; i>=(-1 * maxX); i = i - incremental) {
				if (i >= minLeft - incremental) points.push(new THREE.Vector3(i, getElipseY(i, elipseW, elipseH,r, false), 0));
			}
			points.push(points[0]);
			const material = new THREE.MeshBasicMaterial( { color: lineColor, side: THREE.DoubleSide, wireframe: wireFrame || false, } );
			const degrees = 360 / numberLeaves;
			const shape = new THREE.Shape(points.map(({ x, y }) => new THREE.Vector2(x, y)));
			const gemoetryExtruded = new THREE.ExtrudeGeometry(shape, {
				steps: extrudeSettings.steps,
				depth: extrudeSettings.depth,
			});
			const mesh = new THREE.Mesh(gemoetryExtruded, material);
			mesh.scale.set(scaler, scaler, 1.0);
			for(let i = 0; i<numberLeaves; i++) {
				const newMesh = mesh.clone();
				const degreesIteration =  degToRad(degrees * i);
				newMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), degreesIteration);
				const direction = new THREE.Vector3(Math.cos(degreesIteration), Math.sin(degreesIteration), 0);
				const newPos = direction.multiplyScalar(scaler * r);
				newMesh.position.set(newPos.x, newPos.y, newPos.z);
				sceneObjects.push(newMesh);	
				mainObjectsGroup.add(newMesh);			
				//scene.add(newMesh);
			}
			scene.add(mainObjectsGroup);
			renderer.setClearColor( backgroundColor, 1 );
		},
		clear: () => { 
			sceneObjects.forEach(o => o.removeFromParent());
			sceneObjects = [];
			points = [];
		},
		draw: () => { 
			const {
				numberLeaves
			} = currentProps;
			setTimeout(() => { 
				mutatePostRenderParams({ 
					overallTriangles: renderer.info.render.triangles, 
					overallPoints: points.length * numberLeaves,
					overallLines: renderer.info.render.lines,
				});
			}, 500);
			renderer.render(scene, camera);
		},
		destroy: () => { 
			displayPort.removeChild(renderer.domElement);
		}
	}
}