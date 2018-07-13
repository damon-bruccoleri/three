/***********
 * OT1.js
 * A starburst pattern
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function starburst(n, innercolor, outercolor){
	const r = 2.0;
	const PI2 = 2.0*Math.PI;
	var geom = new THREE.Geometry();
	var origin = new THREE.Vector3(0, 0, 0);
	innercolor_obj = new THREE.Color(innercolor);
	outercolor_obj = new THREE.Color(outercolor);
	
	for(i=0;i<n;i++){
		var theta = Math.random()*PI2;
		var psi = Math.random()*PI2;
		geom.vertices.push(origin);
		geom.vertices.push(new THREE.Vector3(r*Math.cos(theta)*Math.sin(psi),
												r*Math.sin(theta)*Math.sin(psi),
												r*Math.cos(psi)));
		geom.colors.push(innercolor_obj);
		geom.colors.push(outercolor_obj);
	}

    var mat = new THREE.LineBasicMaterial({vertexColors: true, linewidth: 20});
    var line = new THREE.Line(geom, mat, THREE.LinePieces);
	
	return line;
}


function createScene() {
    // triangle geometry
    scene.add(starburst(200,'red','green'));
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
	camera.position.set(0, 0, 10);
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

//try {
	init();
    //showGrids();
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

