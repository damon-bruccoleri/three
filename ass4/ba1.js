/***********
 * BA1.js
 * cube matrix color animator
 * cycle cube matrix color.
 *
 * D. Bruccoleri
 * Feb 2014
 **********
 Challenge BA.1
 Write a program that displays a matrix of cubes whose color 
 cycles through the hues. Include a GUI with controls for 
 opacity and rate of color change (seconds per cycle).
  */
 
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var mat = new THREE.MeshLambertMaterial();
 
function Controls() {
    this.opacity = 1;
    this.rate = 0.2;
}

function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    gui.add(controls, 'opacity', .1, 1).step(.1);
    gui.add(controls, 'rate', 0.01, 2).step(0.01);
} 
 
function ExpandObjectDimension( obj, n){
		var newobj = obj.clone();
		if (n>1)
			newobj.add( ExpandObjectDimension(obj, n-1));
		return newobj;
}

// M x N x O matrix of boxes centered in the xyz-plane
function createCube3DMatrix(m, n, o, offset) {
   
    var offset = (offset !== undefined) ? offset : 2.0;
    var geom = new THREE.CubeGeometry(1, 1, 1);
	mat.color.set("red"); // initial color cause renderer is incremental
	mat.transparent = true;
    var protoMesh = new THREE.Mesh(geom, mat);
	protoMesh.position.set(offset,0,0);
	protoMesh = ExpandObjectDimension(protoMesh, m);
	protoMesh.position.set(0,offset,0);
	protoMesh = ExpandObjectDimension(protoMesh, n);
	protoMesh.position.set(0,0, offset);
	protoMesh = ExpandObjectDimension(protoMesh, o);
    var xMin = -offset * ((m-1) / 2.0);
    var yMin = -offset * ((n-1) / 2.0);
    var zMin = -offset * ((o-1) / 2.0);
	protoMesh.position.set( xMin, yMin, zMin);
	scene.add(protoMesh);
}

function render() {
	var delta = clock.getDelta();
	// three wraps the hsl values so no mod function is needed
	mat.color.offsetHSL(delta*controls.rate,0,0);
	mat.opacity = controls.opacity;
	cameraControls.update(delta);
	renderer.render(scene, camera);
}

function createScene() {
	createCube3DMatrix(9,9,9);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position = camera.position;
 	light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light2.position.set(0,0,30);
    var ambientLight = new THREE.AmbientLight(0x222222);
	scene.add(light);
	scene.add(light2);
	scene.add(ambientLight);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
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
	camera.position.set(0, 0, 50);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	
	initGui();
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

	init();
    //showGrids();
	createScene();
	addToDOM();
	animate();

