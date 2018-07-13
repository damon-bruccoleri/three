/***********
 * MC3.js
 * D Bruccoleri
 * Feb 2015
 ***********

Challenge MC.3 
For this challenge we ally our ziggurat with a GUI 
widget with controls for varying the constructor's 
three parameters. The user varies settings with 
these controls but they take effect only when the 
Create button is pressed—the old ziggurat is replaced 
with a new one constructed on the current settings
*/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();


function Controls() {
    this.levels = 30;
    this.height = 0.2;
    this.scale = 0.9;
	this.create = function() {
		if(currentmesh)
			scene.remove(currentmesh);
		geom = new THREE.BoxGeometry(2, this.height, 2);
		currentmesh = ziggurat(this.levels, this.height, this.scale);
		scene.add(currentmesh);
	}
}

function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    gui.add(controls, 'levels', 1, 50).step(1);
    gui.add(controls, 'height', 0.1, 2).step(0.1);
    gui.add(controls, 'scale', 0.5, 0.99).step(0.01);
	gui.add(controls,'create');
}

function ziggurat(n, zheight, sf){

	var mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, overdraw: true  });
	mat.color = new THREE.Color().setHSL(n/controls.levels,1,0.5);
	var parentmesh = new THREE.Mesh(geom,mat);
	if(n>1){
		var mesh = ziggurat(n-1, zheight, sf);
		mesh.position.y = zheight;//shift whole stack of children 1 segment up
		mesh.scale.set(sf,1,sf); //scale whole stack of children
		parentmesh.add(mesh);
	}
	return parentmesh;
}


function createScene() {
	geom = new THREE.BoxGeometry(2, controls.height, 2);
	currentmesh = ziggurat(controls.levels, controls.height, controls.scale);
	scene.add(currentmesh);

    var light = new THREE.DirectionalLight(0xFFFFFF, 0.8, 1000 );
    light.position.set(0, 0, 10);
    var light2 = new THREE.DirectionalLight(0xFFFFFF, 0.7, 1000 );
    light2.position=camera.position;
    var ambientLight = new THREE.AmbientLight(0x222222);

    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
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
	renderer.setClearColor(0x000000, 1.0);
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(5, 30, 20);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

	initGui();
}


function showGrids() {
    // Grid step size is 1; axes meet at (0,0,0)
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
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


	init();
	createScene();
//    showGrids();
	addToDOM();
    render();
	animate();
