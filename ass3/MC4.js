/***********
 * MC4.js
 * D Bruccoleri
 * Feb 2015
 ***********

Challenge MC.4 
Write a function createHelix(object, n, radius, angle, dist) that 
returns an Object3D representing a helix of objects, where each 
object has type Object3D or some subtype (i.e., object is a scene 
graph). Each object will be defined in its own coordinate system 
such that they jointly form a helix. The helix is centered on the
z-axis and each of the n objects gets positioned at distance 
radius from that axis. Each object is dist units farther along 
the z-axis from its predecessor, and turns angle radians farther
around the z-axis from its predecessor. The images below arise 
from this code fragment: 

var mat = new THREE.MeshLambertMaterial({color: 'blue'});
var geom = new THREE.SphereGeometry(1, 12, 12);
var mesh = new THREE.Mesh(geom, mat);
var helix = createHelix(mesh, 49, 2, Math.PI / 4, 0.5);

The first image looks down the z-axis.
*/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createHelix(object, n, radius, angle, dist){

		var helix = new THREE.Object3D();
		for(var i = 0; i<n ; i++){
			if(object instanceof Function)
				var child2= object(i);
			else
				var child2 = object.clone();
			child2.position.z = dist*i;
			child2.position.x = radius;
			var child = new THREE.Object3D();
			child.add(child2);  // force rotation to happen after translation
			child.rotation.z = angle*i;
			helix.add(child);
		}
	return helix;
}


function createScene() {

	var mat = new THREE.MeshLambertMaterial({color: 'blue'});
	var geom = new THREE.SphereGeometry(1, 12, 12);
	var mesh = new THREE.Mesh(geom, mat);
	var helix = createHelix(mesh, 49, 2, Math.PI / 4, 0.5);
	scene.add(helix);

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
	camera.position.set(30, 0, 40);
	camera.lookAt(new THREE.Vector3(50, 0, 0));
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
    showGrids();
	addToDOM();
    render();
	animate();
