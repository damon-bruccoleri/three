/***********
 * closedPyramid.js
 * M. Laszlo
 * November 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createScene() {
    var pyramidGeom = createPyramid(18, 4, 4);
    var color = new THREE.Color(0, 1, 0);
    var mat = new THREE.MeshLambertMaterial({color: color, side: THREE.FrontSide});
    // try side: THREE.FrontSide and THREE.Backside
    var pyramid = new THREE.Mesh(pyramidGeom, mat);
    var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    var light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(pyramid);
}

function createPyramid(n, rad, len) {
    var len2 = len / 2;
    var geom = new THREE.Geometry();
    // push n + 1 vertices
    //  first the apex...
    geom.vertices.push(new THREE.Vector3(0, len2, 0));
    //  and then the vertices of the base
    var inc = 2 * Math.PI / n;
    for (var i = 0, a = 0; i < n; i++, a += inc) {
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        geom.vertices.push(new THREE.Vector3(rad * cos, -len2, rad * sin));
    }
    // push the n triangular faces...
    for (var i = 1; i < n; i++) {
        var face = new THREE.Face3(i+1, i, 0);
        geom.faces.push(face);
    }
    var face = new THREE.Face3(1, n, 0);
    geom.faces.push(face);
    // and then push the n-2 faces of the base
    for (var i = 2; i < n; i++) {
        var face = new THREE.Face3(i, i+1, 1);
        geom.faces.push(face);
    }
    // set face normals and return the geometry
    geom.computeFaceNormals();
    return geom;
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

	camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 12);
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


// try {
	init();
//    showGrids();
	createScene();
	addToDOM();
    render();
	animate();
/**
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
**/
