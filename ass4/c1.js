/***********
 * MC1.js
 * D Bruccoleri
 * Feb 2015
 ***********/

var camera, scene, renderer;
var cameraControls;

var currentMat, currentMesh;
var clock = new THREE.Clock();

function randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight){
	var base = new THREE.Object3D();
	for ( var i=0; i<nbrBoxes; i++){
		var boxmat = new THREE.MeshLambertMaterial({ transparent : true });
		boxmat.opacity = 0.8;
		boxmat.color = 	new THREE.Color().setHSL(Math.random(), Math.random()*0.15+0.8,Math.random()*0.4+0.3);
		var width = Math.random()*(maxSide-minSide)+minSide;
		var depth = Math.random()*(maxSide-minSide)+minSide;
		var height = Math.random()*(maxHeight-minHeight)+minHeight;
		var boxgeom = new THREE.BoxGeometry(width, height, depth);
		var mesh = new THREE.Mesh(boxgeom, boxmat);
		mesh.position.x = -100 + width/2 + (200-width) * Math.random();
		mesh.position.y = height/2;
		mesh.position.z = -100 + depth/2 + (200-depth) * Math.random();  // box is to sit on the x-z plane
		base.add(mesh);
	}
	return base;
}


function createScene() {
    var planegeom = new THREE.PlaneGeometry( 200, 200 );
	var planemat = new THREE.MeshBasicMaterial({ color : 'grey'});
    var planeMesh = new THREE.Mesh(planegeom, planemat);
	planeMesh.rotation.x = -Math.PI/2; // rotate mesh into x-z plane
    scene.add(planeMesh);
	
	var boxmesh = randomBoxes(100, 5, 20, 5, 60);
	scene.add(boxmesh);
	
    var light = new THREE.PointLight(0xFFFFFF, 0.5, 1000 );
    light.position.set(40, 0, 40);
    var light2 = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light2.position = camera.position;
    var ambientLight = new THREE.AmbientLight(0x333333);
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
	camera.position.set(0, 150, 300);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

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
    //showGrids();
	addToDOM();
    render();
	animate();
