/***********
 * ba2.js
 * Animated Solar System.
 *
 * D Bruccoleri
 * March 2015
 ***********/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var sun = null; // universe root

function EulerAddMult( E, a, m){  //E passed by ref so E gets updated too
	const PI2 = Math.PI*2;
	return E.set((E.x+a[0]*m)%PI2, (E.y+a[1]*m)%PI2, (E.z+a[2]*m)%PI2 );
}

function createsatellite( name, size, satcolor, distance, rps_speed){
	// each satellite consists of two objects. An object3D that is used to make
	// the satellite revolve, and its child.  The child does the translation and
	// holds the mesh of the object geometry/material.  It also has an optional
	// rotation to simulate "day/night" roll of the satellite.
	if(name=='sun') // seperate material for sun so it does not have dark side
		var satellite = new THREE.Mesh(new THREE.SphereGeometry(size,40,40), 
				new THREE.MeshBasicMaterial({color:satcolor}));
	else
		var satellite = new THREE.Mesh(new THREE.SphereGeometry(size,40,40), 
				new THREE.MeshPhongMaterial({color:satcolor}));
	satellite.position.set(distance.x, distance.y, distance.z);
	satellite.userData.rps_speed = [0,0,0];
	satellite.userData.rps = new THREE.Euler(0,0,0);
	var satelliteParent = new THREE.Object3D(); // each sat has a parent obj to allow
	satelliteParent.add(satellite);		// translation before rotation
	satelliteParent.userData.rps_speed = rps_speed;  // store animation info in obj
	satelliteParent.userData.rps = new THREE.Euler(0,0,0);
	satelliteParent.name = name;
	return satelliteParent;
}


function createScene() {
	const PI = Math.PI;

	var dist = new THREE.Vector3( 0,3,0);
	var rps = [0,0,PI];
	var moon  = createsatellite('moon', 0.3, 'LightGray', dist, rps);

	dist.set(10,0,0);
	rps= [0, PI/16,0];
	var earth  = createsatellite('earth', 1, 'blue', dist, rps);
	earth.children[0].add(moon);

	rps = [0, -PI/128, 0];
	dist.set(-25.0,0,0);
	var pluto = createsatellite('pluto', 0.1,'Gray', dist, rps);

	dist.set(0,0,0);
	rps = [0,0,0];
	sun = createsatellite('sun', 3, 'yellow', dist, rps);
	sun.children[0].add(pluto);
	sun.children[0].add(earth);

	light = new THREE.PointLight(0xFFFFFF, 1.0);
	light.position.set(0, 0, 0);

     	var ambientLight = new THREE.AmbientLight(0x444444);
	scene.add(light);
	scene.add(ambientLight);
	scene.add(sun);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
	var delta = clock.getDelta();
	sun.traverse( function ( obj ){
		obj.rotation = 	EulerAddMult( obj.userData.rps, obj.userData.rps_speed,delta);} );
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
	camera.position.set(0, 0, 50);
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



	init();
//	showGrids();
	createScene();
	addToDOM();
	animate();
