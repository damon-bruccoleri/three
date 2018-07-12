/***********
 * trans060.js
 * Setting an Object3D's position, rotation, and scale properties
 *   transforms it in object coordinates thus: T.R.S(object).
 * In the 'object-based interpretation', we create the object centered 
 *   and aligned in object space, then scale it, then rotate it, and 
 *   then translate 
 * In the 'system-based interpretation', we translate, then rotate,
 *   then scale the higher-level coordinate system, and then create
 *   the object centered and aligned in this system.
 *
 * Transformation: T.R(box) in two ways
 * Object-based interpretation:
 *   In object coordinates, create box, then rotate it and then translate it
 * System-based intepretation:
 *   Translate WCS, then rotate WCS, then create box
 *
 * Note that the blueBoxinherits its coordinate system from its parent,
 *   blueParent. This is a simple scene graph.
 *
 * M. Laszlo
 * September 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createScene() {
    // geometry
    var geom = new THREE.CubeGeometry(3, 1, 1);
    // material
    var redMat = new THREE.MeshLambertMaterial( {color: 'red', transparent: true, opacity: 0.8})
    var blueMat = new THREE.MeshLambertMaterial( {color: 'blue', transparent: true, opacity: 0.8})
    var thirtyDegs = Math.PI / 6;
    
    // red box
    var redBox = new THREE.Mesh(geom, redMat);
    redBox.position.x = 4;
    redBox.rotation.z = thirtyDegs;

    // blue box
    var blueParent = new THREE.Object3D();
    blueParent.position.x = 8;
    var blueBox = new THREE.Mesh(geom, blueMat);
    blueParent.add(blueBox);
    blueBox.rotation.z = thirtyDegs;

    // light
    //   args: color, intensity, range (0 if limitless)
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(redBox);
    scene.add(blueParent);
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

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0xFFFFFF, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function showGrids() {
//	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
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
    render();
	animate();
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
