/***********
 * ST1.js
 * A flat square
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function square(){
	var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(1, 1, 1));
    geom.vertices.push(new THREE.Vector3(1, -1, 1));
    geom.vertices.push(new THREE.Vector3(-1, -1, 1));
    geom.vertices.push(new THREE.Vector3(-1, 1, 1));
	var face = new THREE.Face3(1, 0, 2);
	geom.faces.push(face);
	var face = new THREE.Face3(3, 2, 0);
	geom.faces.push(face);
    // material
	return geom;
}


function createScene() {
    // triangle geometry
    var mat = new THREE.MeshBasicMaterial( {color: 'blue', side: THREE.DoubleSide })
    //  mesh
    var mesh = new THREE.Mesh(square(), mat);

    scene.add(mesh);
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
	camera.position.set(10, 0, 10);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function showGrids() {
    // Grid step size is 1; axes meet at (0,0,0)
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
    Coordinates.drawAllAxes({axisLength:5, axisRadius:0.05});
}


function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}


//try {
	init();
    showGrids();
	createScene();
	addToDOM();
    render();
	animate();
/*
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
*/
