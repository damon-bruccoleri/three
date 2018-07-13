/***********
 * MFWA1.js
 * D Bruccoleri
 * March 2015
 **********
 Our oscillating squares program 
 admits only one wave at a time; 
 one can click a new wave only 
 after the current wave is 
 exhausted. Modify the program so 
 that it supports multiple waves 
 at once. In my program below, 
 several wave parameters are 
 generated randomly, including 
 amplitude, frequency, and the 
 rate at which the wave advances. 
 All current waves reference the 
 same color table but this table 
 gets reinitialized periodically, 
 hence variation in color over 
 time
 */


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var squares;
var projector = new THREE.Projector();
var SelectedSquares = [];
var touchedSquare;
var theObjects = [];
var canvasWidth, canvasHeight;

var m = 60, n = 60;
var offset = 2.4;
var minFreq = 0.2;
var maxFreq =1.0;
var minWaveRate = 1.0;
var maxWaveRate = 30.0;
var waveLimit = 30;

var plainColor = null;
var nbrColors = 201;
var colors;


function squareGeom() {
    var geom = new THREE.Geometry();
    var vertices = [new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(-1, -1, 0), new THREE.Vector3(-1, 1, 0)];
    for (var i = 0; i < vertices.length; i++)
        geom.vertices.push(vertices[i]);
    var faces = [[0, 1, 3], [3, 1, 2]];
    var normal = new THREE.Vector3(0, 0, 1);
    for (var i = 0; i < faces.length; i++)
        geom.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2], normal));
    return geom;
}

function createMatrixOfSquares(m, n, offset) {
    // fit into 10x10 square
    var root = new THREE.Object3D();
    root.scale.x = 10 / m*offset;
    root.scale.y = 10 / n*offset;

    // array of square meshes
    squares = new Array(m);
    for (var i = 0; i < m; i++) {
        squares[i] = new Array(n);
    }

    offset = offset !== undefined ? offset : 2.0;
    var geom = squareGeom();
    var xMin = -offset * ((m-1) / 2.0);
    var yMin = -offset * ((n-1) / 2.0);
    var mn = m * n;
    for (var i = 0, x = xMin; i < m; i++, x += offset) {
        for (var j = 0, y = yMin; j < n; j++, y += offset) {
            var mat = new THREE.MeshBasicMaterial({color: plainColor, shading: THREE.FlatShading, side: THREE.DoubleSide});
            var square = new THREE.Mesh(geom, mat);
            square.position.x = x;
            square.position.y = y;
            square.i = i;
            square.j = j;
            root.add(square);
            theObjects.push(square);
            squares[i][j] = square;
        }
    }
    scene.add(root);
}

var maxHeight = 5;
var minHeight = 0.5;

function heightFunction(d, max,freq) {
        return ((d > 0)&&(d< waveLimit)) ? max * Math.sin(freq*d) : 0;
}

function colorFunction(ht,max) {
    var colorIndex = Math.floor((ht /max) *(nbrColors/2)+nbrColors/2);
	if (colorIndex<0) colorIndex=0;
	if (colorIndex>200) colorIndex = 200;
    return colors[colorIndex];
} 

var newpress= false;

function updateSquares(deltat) {
		if (newpress){
			if(SelectedSquares.indexOf(touchedSquare) == -1){ // don't allow same square twice
				touchedSquare.curWave = 0;
				touchedSquare.waveRate = minWaveRate+Math.random()*(maxWaveRate-minWaveRate);
				touchedSquare.maxHeight = minHeight + Math.random()*(maxHeight-minHeight);
				touchedSquare.freq = minFreq + Math.random()*(maxFreq-minFreq);
				initializeColors();
				SelectedSquares.push(touchedSquare);
			}
			newpress=false;
		}
		//for (var i = 0; i < theObjects.length; i++)
		//	theObjects[i].position.z=0; 
		for ( var s = 0; s < SelectedSquares.length ; s++){
			var theSquare = SelectedSquares[s];
			var changed = false;
			theSquare.curWave  += (theSquare.waveRate * deltat);
			for (var i = 0; i < theObjects.length; i++) {
				var obj = theObjects[i];
				var dist = distance(theSquare , obj);
				var delta = theSquare.curWave - dist;
				var ht = heightFunction(delta, theSquare.maxHeight, theSquare.freq);
				if (ht!=0)
					changed=true; // if ht non zero then we changed
				if (s==0)
					obj.position.z = 0; // first wave initialize z
				obj.position.z += ht; // waves add
				obj.material.color = colorFunction(obj.position.z, theSquare.maxHeight);
			}
			if(!changed)
				SelectedSquares.splice(s--,1);// its not contributing to the waves
		}
}

function distance(sq1, sq2) {
    dx = sq1.i - sq2.i;
    dy = sq1.j - sq2.j;
    return Math.sqrt(dx*dx + dy*dy);
}


function createScene() {
    initializeColors();
    var matrixOfSquares = createMatrixOfSquares(m, n, offset);
    scene.add(matrixOfSquares);
}

function initializeColors() {
    if (nbrColors % 2 == 0) {
        nbrColors++;
    }
    colors = new Array(nbrColors);    
    nbrColors2 = (nbrColors - 1) / 2;
    var hues = [Math.random(), Math.random()];
    for (var j = 0; j < nbrColors2; j++) {
        var sat = 1 - j/nbrColors2;
        colors[j] = new THREE.Color().setHSL(hues[0], sat, 0.5);
        colors[nbrColors-j-1] = new THREE.Color().setHSL(hues[1], sat, 0.5);
    }
    plainColor = colors[nbrColors2] = new THREE.Color().setHSL(0, 0, 0.5);
}


function onDocumentMouseDown(event) {
    var mouseVec = new THREE.Vector3(
        2*(event.clientX/canvasWidth)-1,
        1-2*(event.clientY/canvasHeight), 0);
    var raycaster = projector.pickingRay(mouseVec.clone(), camera);
    var intersects = raycaster.intersectObjects(theObjects);
    if (!newpress && (intersects.length > 0)) {
        // select the closest intersected object
        touchedSquare = intersects[0].object;
		newpress=true;
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);


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

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, -40, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
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
