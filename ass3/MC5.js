/***********
 * MC5.js
 * D Bruccoleri
 * Feb 2015
 ***********

Challenge MC.5
Generalize function createHelix so that its first argument obj 
is a scene graph (i.e., an Object3D or some subtype) as before, 
or a function that, when called, returns a new scene graph. Each 
time createHelix calls obj(n) where n is the number of times obj 
has been called, it adds the returned scene graph to the helix 
under construction. The image below was produced with this code 
fragment:

var knotGen = generateKnots(49);
var helix = createHelix(knotGen, 49, 2, Math.PI / 4, 0.5);

Here, the call to generateKnots returns a function knotGen that, 
on each successive call to knotGen(n), produces a torus knot 
(with geometry new THREE.TorusKnotGeometry(5, 2)) whose hue 
depends on n.
*/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function generateKnots(max){
	
	var geom = new THREE.TorusKnotGeometry(5, 2);
	return function(n){ 
		var mat = new THREE.MeshLambertMaterial();//{color: 'hsl( ' +Math.round(n/max)+ ',1,.5)'});
        mat.color = new THREE.Color().setHSL(n/max, 1, .5);
		var mesh = new THREE.Mesh(geom, mat);
		mesh.scale = new THREE.Vector3(0.1, 0.1, 0.1);
		return mesh;
	}
}

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
			child.add(child2);
			child.rotation.z = angle*i;
			helix.add(child);
		}
	return helix;
}

/*
function createHelix(object, n, radius, angle, dist){

	var helix = new THREE.Object3D();
	
	for( var i = 0, inc = 0 ; i<n ; i++, inc += angle){
		if(object instanceof Function)
			var child= object(i);
		else
			var child = object.clone();
		child.position.z = dist*i;
		child.position.x = radius*Math.cos(inc);
		child.position.y = radius*Math.sin(inc);
		child.rotation.z = inc;  //this rotation is optional
							// it keeps the same side facing in
		helix.add( child );
	}
	return helix;
}
*/

function createScene() {

	var knotGen = generateKnots(49);
	var helix = createHelix(knotGen, 49, 2, Math.PI / 4, 0.5);

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
	camera.position.set(-20, 0, 40);
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
    showGrids();
	addToDOM();
    render();
	animate();
