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
var prev1_squares, prev2_squares;
var frame_period = 1 * 1000;//Hz
var timerID;
var spec = new THREE.Color();
var emissive = new THREE.Color();

/** Fixed-timestep simulation (seconds per substep). ~1/60 matches one step per frame at 60fps. */
var FIXED_DT = 1 / 60;
var MAX_SUBSTEPS = 8;
var simAccumulator = 0;
var MAX_ABS_HEIGHT = 20;

/** Recompute full normals every N frames while vertices move. */
var NORMALS_UPDATE_INTERVAL = 2;
var normalsFrameAcc = 0;

function Controls() {
    this.shininess = 100;
    this.specular = '#000000';
	this.emissive = '#000000';
	this.moon_y = 25;
	this.metal = false;
	this.wireframe = false;
	this.One_Hz = false;
	/** Gaussian impulse: radius in grid cells (integer-ish). */
	this.impulseRadius = 7;
	/** Peak impulse magnitude (depression depth). */
	this.impulseStrength = 3;
	/** Per-step amplitude damping (original used ~1/32 ≈ 0.03125). */
	this.heightDamping = 1 / 32;
	/** Damping proportional to vertex velocity (prev1 − prev2). */
	this.velocityDamping = 0.02;
	/** Extra damping near mesh edges (0 = none, ~0.1 = softer reflections). */
	this.edgeAbsorption = 0.08;
	/** Width in cells over which edge absorption ramps. */
	this.edgeMargin = 5;
}

function syncMaterialFromControls() {
	if (!mat) return;
	mat.shininess = controls.shininess;
	spec.set(controls.specular);
	emissive.set(controls.emissive);
	mat.metal = controls.metal;
	mat.wireframe = controls.wireframe;
	mat.needsUpdate = true;
}

function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    gui.add(controls, 'shininess', 0, 100).step(5).onChange(syncMaterialFromControls);
    gui.addColor(controls, 'specular').onChange(syncMaterialFromControls);
	gui.addColor(controls,'emissive').onChange(syncMaterialFromControls);
	gui.add(controls,'moon_y', 0, 100).step(1);
	gui.add(controls,'metal').onChange(syncMaterialFromControls);
	gui.add(controls,'wireframe').onChange(syncMaterialFromControls);
	var sim = gui.addFolder('Wave simulation');
	sim.add(controls, 'impulseRadius', 2, 16).step(1);
	sim.add(controls, 'impulseStrength', 0.5, 8).step(0.25);
	sim.add(controls, 'heightDamping', 0, 0.15).step(0.005);
	sim.add(controls, 'velocityDamping', 0, 0.15).step(0.005);
	sim.add(controls, 'edgeAbsorption', 0, 0.35).step(0.01);
	sim.add(controls, 'edgeMargin', 2, 12).step(1);
	sim.open();
	var isOne_Hz = gui.add(controls,'One_Hz');
	isOne_Hz.onChange(function(value){
		if (value === true) {
			timerID = setInterval(function () {
				updateSquares(1 / 60);
			}, frame_period);
		} else {
			clearInterval(timerID);
		}
	});
} 

function createMatrix(m, n) {
	    // array of square meshes

    prev1_squares = new Array(m);
    prev2_squares = new Array(m);
	for (var i = 0; i < m; i++){
        prev1_squares[i] = new Array(n);
        prev2_squares[i] = new Array(n);
		for (var j = 0; j < n; j++){
			prev1_squares[i][j] =0;
			prev2_squares[i][j] =0;
		}
	}
		
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

function vertexIndexToGrid(idx) {
	return { j: idx % width, i: Math.floor(idx / width) };
}

/** Soft Gaussian impulse around the face center (more natural than three sharp peaks). */
function applySoftImpulse(faceIndex) {
	var face = geom.faces[faceIndex];
	var a = vertexIndexToGrid(face.a);
	var b = vertexIndexToGrid(face.b);
	var c = vertexIndexToGrid(face.c);
	var jc = Math.round((a.j + b.j + c.j) / 3);
	var ic = Math.round((a.i + b.i + c.i) / 3);
	var R = Math.max(2, Math.round(controls.impulseRadius));
	var peak = -Math.abs(controls.impulseStrength);
	var sigma = Math.max(0.8, R / 2.2);
	var sigma2 = 2 * sigma * sigma;

	for (var di = -R; di <= R; di++) {
		for (var dj = -R; dj <= R; dj++) {
			var ii = ic + di;
			var jj = jc + dj;
			if (ii < 1 || ii >= depth - 1 || jj < 1 || jj >= width - 1) continue;
			var dist2 = di * di + dj * dj;
			var amp = peak * Math.exp(-dist2 / sigma2);
			if (Math.abs(amp) < 1e-6) continue;
			var vi = ii * width + jj;
			geom.vertices[vi].z += amp;
			prev1_squares[jj][ii] += amp;
			prev2_squares[jj][ii] += amp;
		}
	}
}

function edgeDampFactor(i, j) {
	var margin = Math.max(2, Math.round(controls.edgeMargin));
	var d = Math.min(i, depth - 1 - i, j, width - 1 - j);
	var abs = controls.edgeAbsorption;
	if (abs <= 0 || d >= margin) return 1;
	// 1 at inner region; slightly <1 near edges
	var t = d / margin;
	return 1 - abs * (1 - t);
}

/** One discrete wave step (Hugo Elias–style) with tunable damping. */
function waveSimulationStep() {
	var hd = controls.heightDamping;
	var vd = controls.velocityDamping;
	for (var i = 1; i < depth - 1; i++) {
		for (var j = 1; j < width - 1; j++) {
			var y = (prev1_squares[j][i - 1] +
				prev1_squares[j][i + 1] +
				prev1_squares[j - 1][i] +
				prev1_squares[j + 1][i]) / 2;
			y -= prev2_squares[j][i];
			var z = y * (1 - hd);
			// Blend toward previous state for extra damping without injecting energy.
			if (vd > 0) {
				z = z * (1 - vd) + prev1_squares[j][i] * vd;
			}
			z *= edgeDampFactor(i, j);
			if (z > MAX_ABS_HEIGHT) z = MAX_ABS_HEIGHT;
			if (z < -MAX_ABS_HEIGHT) z = -MAX_ABS_HEIGHT;
			geom.vertices[i * width + j].z = z;
		}
	}
	for (var i2 = 1; i2 < depth - 1; i2++) {
		for (var j2 = 1; j2 < width - 1; j2++) {
			prev2_squares[j2][i2] = prev1_squares[j2][i2];
			prev1_squares[j2][i2] = geom.vertices[i2 * width + j2].z;
		}
	}
}

function updateSquares(delta) {
	var dt = (delta !== undefined && delta > 0) ? delta : 1 / 60;

	if (!touchProcessed) {
		applySoftImpulse(theSelectedFace3);
		touchProcessed = true;
	}

	simAccumulator += dt;
	var steps = 0;
	while (simAccumulator >= FIXED_DT && steps < MAX_SUBSTEPS) {
		waveSimulationStep();
		simAccumulator -= FIXED_DT;
		steps++;
	}

	moon.position.set(0, controls.moon_y, -100);
	directionalLight.position.set(0, controls.moon_y, -200).normalize();

	normalsFrameAcc++;
	if (normalsFrameAcc % NORMALS_UPDATE_INTERVAL === 0) {
		geom.computeFaceNormals();
		geom.computeVertexNormals();
		geom.normalsNeedUpdate = true;
	} else {
		geom.normalsNeedUpdate = false;
	}
	geom.verticesNeedUpdate = true;
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

	if (controls.One_Hz === false) {
		updateSquares(delta);
	}
    cameraControls.update(delta);
    renderer.render(scene, camera);
}


function init() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

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

