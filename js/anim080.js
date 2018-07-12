/***********
 * anim080.js
 * Box rotates around the z-axis.
 *
 * M. Laszlo
 * October 2014
 ***********/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var box = null;
var curAngle = 0;	// current rotation around y axis 
var angleStep = Math.PI/2;  	// radians rotation per second



function createScene() {
    var mat = new THREE.MeshLambertMaterial({color: 'blue'});
    var geom = new THREE.CubeGeometry(4, 1, 1);
    box = new THREE.Mesh(geom, mat);

	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(light);
	scene.add(ambientLight);
	scene.add(box);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
	var delta = clock.getDelta();
	curAngle += (angleStep * delta);
    if (curAngle >= 2*Math.PI)
        curAngle -= 2*Math.PI;
	box.rotation.z = curAngle;

	cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x0, 1.0);

	camera = new THREE.PerspectiveCamera(40, canvasWidth/canvasHeight, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function showGrids() {
    Coordinates.drawAllAxes({axisLength:11, axisRadius:0.05});
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
    showGrids();
	createScene();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
