/***********
 * project.js
 * D. Bruccoleri
 * March 2015
 ***********/


var audio = new Audio('wave.wav');
var cheese = 0xbdc0a0;
var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var	scene = new THREE.Scene();
var width =200;
var depth=100;
var square, geom, mat;
var projector = new THREE.Projector();
var touchProcessed = true;
var theSelectedFace3;
var theSelectedPoint;
var touchedVertex={
		index :0,
		x : 0,
		y : 0,
		time : 0,
		touched : false};
var spec = new THREE.Color();
var emissive = new THREE.Color();
		
function Controls() {
    this.shininess = 100;
    this.specular = '#000000';
	this.emissive = '#000000';
	this.moon_y = 25;
	this.metal = false;
	this.wireframe = false;
}

function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    gui.add(controls, 'shininess', 0, 100).step(5);
    gui.addColor(controls, 'specular');
	gui.addColor(controls,'emissive');
	gui.add(controls,'moon_y', 0, 100).step(1);
	gui.add(controls,'metal');
	gui.add(controls,'wireframe');
} 

function createMatrix(m, n) {
	    // array of square meshes

	geom = new THREE.PlaneGeometry(width, depth, width-1, depth-1);
	
    mat = new THREE.MeshPhongMaterial({color: 'darkblue', shading: THREE.SmoothShading, 
				side: THREE.FrontSide, shininess: controls.shininess});//0x454545});
	spec.set(controls.specular);
	mat.specular = spec;
	emissive.set(controls.emissive);
	mat.emissive = emissive;

    square = new THREE.Mesh(geom, mat);
	square.rotation.x= -Math.PI/2;
	geom.computeFaceNormals();
	geom.computeVertexNormals();
    scene.add(square);
	
	var edgegeom = new THREE.BoxGeometry( m+1, 1, 1 );
	var edgemat = new THREE.MeshBasicMaterial( {color: 0x7f7f7f} );
	var edge = new THREE.Mesh( edgegeom, edgemat );
	edge.position.set(0,0,-n/2);
	scene.add( edge );
	var edge2 = edge.clone();
	edge2.position.set(0,0,n/2);
	scene.add( edge2 );
	var sedgegeom = new THREE.BoxGeometry( 1, 1, n );
	var sedgemat = new THREE.MeshBasicMaterial( {color: 0x7f7f7f} );
	var sedge = new THREE.Mesh( sedgegeom, sedgemat );
	sedge.position.set(-m/2,0,0);
	scene.add( sedge );
	var sedge2 = sedge.clone();
	sedge2.position.set(m/2,0,0);
	scene.add( sedge2 );
}

var tc = 2.0;  // 2 second exponential wave decay time constant  (5*tc = 98% initial value)
var dc = 20; // distance decay constant
var A = 5; // wave initial amplitude
var lambda = 8; // wavelength
var c = 7; // wave speed
var PI2 = 2*Math.PI;

function heightFunction(d, t) {
	if(d < (c*t+lambda/4)) // create wavefront
        return A * Math.exp(-t/tc-d/dc)* Math.cos(PI2/lambda*(d - c*t)); // traveling wave
	else
		return 0;
}

function updateSquares(deltat) {
	if( !touchProcessed ){
		var a_vertex_index = geom.faces[theSelectedFace3].a;
		touchedVertex.index = a_vertex_index;
		touchedVertex.x = a_vertex_index % width ;
		touchedVertex.y = Math.round(a_vertex_index / width );
		touchedVertex.time = 0;
		touchedVertex.touched = true;
		touchProcessed=true;
		audio.play();
	}
	
	if(touchedVertex.touched){
		touchedVertex.time += deltat;
		if(touchedVertex.time> 10*tc) // looks to go to 0 after 10 time constants
			touchedVertex.touched = false;
		for (var i = 1; i < depth-1 ; i++)
			for( var j = 1; j<width-1 ; j++){
				if(!touchedVertex.touched){ // looks to go to 0 after 10 time constants
					geom.vertices[i*width+j].z = 0;
				}else{
					dist = Math.sqrt(Math.pow(touchedVertex.x-j,2)+Math.pow(touchedVertex.y-i,2));
					geom.vertices[i*width+j].z  = heightFunction(dist,touchedVertex.time);
				}
			}
	}
	mat.shininess = controls.shininess;
	spec.set(controls.specular);
	emissive.set(controls.emissive);
	mat.metal = controls.metal;
	mat.wireframe = controls.wireframe;
	mat.needsUpdate = true;
	moon.position.set(0,controls.moon_y,-100);
	directionalLight.position.set(0, controls.moon_y, -200).normalize();
	geom.computeFaceNormals();
	geom.computeVertexNormals();
	geom.verticesNeedUpdate=true;
	geom.normalsNeedUpdate = true;
}

function createScene() {
    createMatrix(width, depth);

	var ambientLight = new THREE.AmbientLight(0x1f1F1F);
    scene.add(ambientLight);
      
    // directional lighting
    directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(0, controls.moon_y, -200).normalize();
    scene.add(directionalLight);

	// add moon object
	var moongeom = new THREE.CircleGeometry( 10, 100 );
    moon = new THREE.Mesh( moongeom, new THREE.MeshBasicMaterial({ color: cheese,map: THREE.ImageUtils.loadTexture('moon.jpg' )}));
	moon.position.set(0,controls.moon_y,-100);
	moon.rotation.set(0,0,Math.PI);
	scene.add(moon);
}


function onDocumentMouseDown(event) {
    var mouseVec = new THREE.Vector3(
        2*(event.clientX/canvasWidth)-1,
        1-2*(event.clientY/canvasHeight), 0);
    var raycaster = projector.pickingRay(mouseVec.clone(), camera);
    var intersects = raycaster.intersectObject(square);
    if (touchProcessed && (intersects.length > 0)) {
        // select the closest intersected objects
        theSelectedFace3 = intersects[0].faceIndex;
		theSelectedPoint = intersects[0].point;
		touchProcessed = false;
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();

	updateSquares(delta);
    cameraControls.update(delta);
    renderer.render(scene, camera);
}


function init() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;
	touchedVertex.touched = false;
	
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 30, 90);
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

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	init();
    createScene();
    addToDOM();
    render();
    animate();


