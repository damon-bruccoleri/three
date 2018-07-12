/***********
 * trans060B.js
 * Setting an Object3D's position, rotation, and scale properties
 *   transforms it in object coordinates thus: T.R.S(object).
 * In the 'object-based interpretation', we create the object centered 
 *   and aligned in object space, then scale it, then rotate it, and 
 *   then translate 
 * In the 'system-based interpretation', we translate, then rotate,
 *   then scale the higher-level coordinate system, and then create
 *   the object centered and aligned in this system.
 *
 *
 * M. Laszlo
 * October 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
// manipulated by gui:
var redBox;

function createScene() {
    // geometry
    var geom = new THREE.CubeGeometry(1, 1, 1);
    var redMat = new THREE.MeshLambertMaterial( {color: 'red', transparent: true, opacity: 0.8})
    redBox = new THREE.Mesh(geom, redMat);

    var light = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light.position.set(0, 0, 10);
    var ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(ambientLight);
    scene.add(redBox);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}

var controls = new function() {
    this.Reset = function () {
        this.xtrans = this.ytrans = this.zrot = 0;
        this.xscale = this.yscale = 1.0;
    }
    this.Reset();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    redBox.position.x = controls.xtrans;
    redBox.position.y = controls.ytrans;
    redBox.rotation.z = (controls.zrot / 360.0) * 2 * Math.PI;
    redBox.scale.x = controls.xscale;
    redBox.scale.y = controls.yscale;
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
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    var gui = new dat.GUI();
    gui.add(controls, 'xtrans', -20, 20).step(1).listen();
    gui.add(controls, 'ytrans', -20, 20).step(1).listen();
    gui.add(controls, 'zrot', 0, 360).step(1).listen();
    gui.add(controls, 'xscale', 0.1, 4.0).step(0.1).listen();
    gui.add(controls, 'yscale', 0.1, 4.0).step(0.1).listen();
    gui.add(controls, 'Reset');
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
    render();
	animate();
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
