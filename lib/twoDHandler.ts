import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import { AutomaticallyComputedProps, GraphicsProps, HandlerProps } from "./types";


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
		elipseW,
		elipseH,
		numberLeaves,
		radius,
		elipseScaler,
		smoothIndex,
		backgroundColor,
		lineColor,
		width,
		height,
		constructionMode, 
		wireFrame,
		mutatePostRenderParams,
	}: GraphicsProps & AutomaticallyComputedProps & HandlerProps ) { 
	const scaler = elipseScaler;
	const screenWidth = width;
	const screenHeight = height;
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({});
	const points: THREE.Vector3[] = [];
	const incremental = 1 - smoothIndex;
	const ELIPSE_W = elipseW;
	const ELIPSE_H = elipseH;
	const r = radius;	
	const minLeft = -0.5;
	const NUM_OF_LEAVES = numberLeaves;
	const maxX = getElipseMaxX(ELIPSE_W, r);
	for(let i = -1 * maxX; i<=maxX; i = i + incremental) {
		if(i >= minLeft) points.push(new THREE.Vector3(i, getElipseY(i, ELIPSE_W, ELIPSE_H,r, true), 0));
	}
	for(let i = maxX; i>=(-1 * maxX); i = i - incremental) {
		if (i >= minLeft - incremental) points.push(new THREE.Vector3(i, getElipseY(i, ELIPSE_W, ELIPSE_H,r, false), 0));
	}
	points.push(points[0]);
	const material = new THREE.MeshBasicMaterial( { color: lineColor, side: THREE.DoubleSide, wireframe: wireFrame || false, } );
	const degrees = 360 / NUM_OF_LEAVES;
	if ("lines" === constructionMode) {
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line( geometry, material );
		line.scale.set(scaler, scaler, 1.0);
		const lines: { obj: THREE.Line; direction: THREE.Vector3 }[] = []; 
		for(let i = 0; i<NUM_OF_LEAVES; i++) {
			const newLine = line.clone();
			const degreesIteration =  degToRad(degrees * i);
			newLine.rotateOnAxis(new THREE.Vector3(0, 0, 1), degreesIteration);
			const direction = new THREE.Vector3(Math.cos(degreesIteration), Math.sin(degreesIteration), 0);
			const newPos = direction.multiplyScalar(scaler * r);
			newLine.position.set(newPos.x, newPos.y, newPos.z);
			scene.add(newLine);
			lines.push({ obj: newLine, direction: direction.normalize() });
		}
	} else {
		const shape = new THREE.Shape(points.map(({ x, y }) => new THREE.Vector2(x, y)));
		const geometry = new THREE.ShapeGeometry(shape);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.scale.set(scaler, scaler, 1.0);
		for(let i = 0; i<NUM_OF_LEAVES; i++) {
			const newMesh = mesh.clone();
			const degreesIteration =  degToRad(degrees * i);
			newMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), degreesIteration);
			const direction = new THREE.Vector3(Math.cos(degreesIteration), Math.sin(degreesIteration), 0);
			const newPos = direction.multiplyScalar(scaler * r);
			newMesh.position.set(newPos.x, newPos.y, newPos.z);
			scene.add(newMesh);
		}
	}
	const displayPort = document.getElementById("displayPort");
	displayPort.appendChild(renderer.domElement);
	const light = new THREE.AmbientLight( 0x808080 ); // soft white light
	scene.add(light);
	renderer.setSize(screenWidth, screenHeight);
	renderer.setClearColor( backgroundColor, 1 );
	renderer.outputEncoding = THREE.sRGBEncoding;
	const camera = new THREE.PerspectiveCamera( 45,screenWidth / screenHeight, 1, -50 );
	camera.position.set(0, 0, 500);
	camera.lookAt( 0, 0, 0);
	let deg = 1;
	setTimeout(() => { 
		mutatePostRenderParams({ 
			overallTriangles: renderer.info.render.triangles, 
			overallPoints: points.length * NUM_OF_LEAVES,
			overallLines: renderer.info.render.lines,
		});
	}, 500);
	const update = (t)  => {
		// lines.forEach((l) => {
		// 	const distance =  l.obj.position.distanceTo(new THREE.Vector3(0,0,0));
		// 	console.log(distance);
		// 	l.obj.translateOnAxis(l.direction.normalize(), distance);
		// 	l.obj.rotateZ(degToRad(deg));
		// 	l.obj.translateOnAxis(l.direction.normalize().multiplyScalar(-1), distance);
		// });
		renderer.render(scene, camera);
		
		requestAnimationFrame(update);
	}
	
	update(0);
}