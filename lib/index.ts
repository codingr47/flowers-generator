import * as THREE from "three";

(() => { 
	const width = 800;
	const height = 600;
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({});
	const geom = new THREE.BufferGeometry();
	const vertices  = new Float32Array([
		0.0, 0,  0,
		0.0, 0.5,  0,
		0.5, 0.75,  0,
	]);
	const colors = new Float32Array([
		0.2, 0.2, 0.2,
		0.3, 0.3, 0.3,
		0.5, 0.5, 0.5,
	]);
	geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
	geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
	const material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
	const object = new THREE.Mesh( geom, material);
	object.scale.set(50, 50 , 50)
	scene.add(object);
	const displayPort = document.getElementById("displayPort");
	displayPort.appendChild(renderer.domElement);
	const light = new THREE.AmbientLight( 0x808080 ); // soft white light
	scene.add(light);
	renderer.setSize(width, height);
	renderer.setClearColor( 0xFFEEEE, 1 );
	renderer.outputEncoding = THREE.sRGBEncoding;
	const camera = new THREE.PerspectiveCamera( 45,width / height, 1, 500 );
	camera.position.set(0, 0, 500);
	camera.lookAt( 0, 0, 0 );
	scene.add(camera);
	const update = (t)  => {
		renderer.render(scene, camera);
		requestAnimationFrame(update);
	}
	update(0);
})();