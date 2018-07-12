/***********
 * triangleStroke006.js
 * A simple triangle with orbit control
 * M. Laszlo
 * September 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();


function createScene() {
    // triangle geometry
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0, 0, 0.1));
    geom.vertices.push(new THREE.Vector3(4, 0, 0.1));
    geom.vertices.push(new THREE.Vector3(0, 6, 0.1));
    geom.vertices.push(new THREE.Vector3(0, 0, 0.1));
    geom.colors.push(new THREE.Color(0xff0000));
    geom.colors.push(new THREE.Color(0x00ff00));
    geom.colors.push(new THREE.Color(0x0000ff));
    geom.colors.push(new THREE.Color(0xff0000));
    // material
    var mat = new THREE.LineBasicMaterial({vertexColors: true, linewidth: 20});
    //  mesh
    var line = new THREE.Line(geom, mat, THREE.LineStrip);
    scene.add(line);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}


try {
	init();
	createScene();
	addToDOM();
    render();
	animate();
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
