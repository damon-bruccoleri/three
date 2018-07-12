/***********
 * triangleStroke005.js
 * A simple triangle
 * M. Laszlo
 * October 2014
 ***********/

var camera, scene, renderer;

function createScene() {
    // triangle geometry
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0, 0, 0.1));
    geom.vertices.push(new THREE.Vector3(4, 0, 0.1));
    geom.vertices.push(new THREE.Vector3(0, 6, 0.1));
    geom.vertices.push(new THREE.Vector3(0, 0, 0.1));
    // material
    //   note linewidth does not work on Windows
    var mat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 20});
    //  mesh
    var line = new THREE.Line(geom, mat, THREE.LineStrip);

    scene.add(line);
}


function render() {
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
	renderer.setClearColor(0xFFFFFF, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
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
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
