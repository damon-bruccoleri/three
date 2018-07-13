/***********
 * OT2.js
 * A cylinder made of lines
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function ruledCylinder(n, lcolor){
	const r = 2.0;
	const inc = 2.0*Math.PI/n;
    var mat = new THREE.LineBasicMaterial({ color: lcolor,  linewidth: 20});
	
	var basegeom = new THREE.Geometry();
	var topgeom = new THREE.Geometry();
	var sidegeom = new THREE.Geometry();
	for(var i=0, nxt=0.0 ;i<n;i++, nxt+=inc){
		var tpt = new THREE.Vector3(r*Math.sin(nxt), 2.0, r*Math.cos(nxt));
		var bpt = tpt.clone();
		bpt.y = -2.0;
		basegeom.vertices.push(bpt);
		topgeom.vertices.push(tpt);
		sidegeom.vertices.push(bpt);
		sidegeom.vertices.push(tpt);
	}
	basegeom.vertices[n] = basegeom.vertices[0]; //close base
	topgeom.vertices[n] = topgeom.vertices[0]; //close top
	
    var lines = new THREE.Line(basegeom, mat, THREE.LineStrip);
	lines.add( new THREE.Line(topgeom,mat, THREE.LineStrip));
	lines.add( new THREE.Line(sidegeom, mat, THREE.LinePieces));

	return lines;
}


function createScene() {
    // triangle geometry
    scene.add(ruledCylinder(10,'red'));
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
