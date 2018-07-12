/***********
 * oscillatingSquaresMany.js
 * M. Laszlo
 * December 2014
 ***********/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var squares;
var projector = new THREE.Projector();
var theWaveObjects = [];
var maxNbrWaveObjects = 3;
var theObjects = [];
var canvasWidth, canvasHeight;

/***
a wave object:
    freq: frequency of sin wave
    amp: amplitude of sin wave
    rate: speed of wave
    limit: when wave dies
    anchor: center of wave
***/

var m = 80, n = 80;
var offset = 2.4;

var plainColor = null;
var nbrColors = 201, nbrColors2 = 100;
var colors;


function squareGeom(len) {
    var len2 = len / 2;
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

var maxHeight;
var minHeight;
var heightRange;

function updateHeightRange() {
    maxHeight = 0;
    for (var w = 0; w < theWaveObjects.length; w++) {
        maxHeight += theWaveObjects[w].amp;
    }
    minHeight = -maxHeight;
    heightRange = maxHeight - minHeight;
}

function heightFunction(delta, amp, freq) {
        return amp * Math.sin(freq*delta);
}

function colorFunction(ht) {
    var colorIndex = Math.floor(((ht - minHeight) / heightRange) * nbrColors);
    return colors[colorIndex];
} 


function updateSquares() {
    var changed = [];
    for (var w = 0; w < theWaveObjects.length; w++)
        changed.push(false);
    for (var i = 0; i < theObjects.length; i++) {
        var obj = theObjects[i];
        var ht = 0;
        for (var w = 0; w < theWaveObjects.length; w++) {
            var wave = theWaveObjects[w];
            var dist = distance(obj, wave.anchor);
            var delta = wave.curWave - dist;
            if ((delta > 0) && (wave.limit >= delta)) {
                ht += heightFunction(delta, wave.amp, wave.freq);
                changed[w] = true;
            }
        }
        obj.position.z = ht;
        obj.material.color = colorFunction(ht);
    }
    for (var w = 0; w < theWaveObjects.length; w++) {
        if (!changed[w]) {
            theWaveObjects.splice(w, 1);
            updateHeightRange();
        }
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

var hues = [Math.random(), Math.random()];

var timeToColorChange = 0;
var changeColorEvery = 2.0;

function initializeColors() {
    colors = new Array(nbrColors);
    if (nbrColors % 2 == 0) {
        nbrColors++;
    }
    nbrColors2 = (nbrColors - 1) / 2;
    // random walk on hues
    for (var i = 0; i < 2; i++) {
        hues[i] += getRandomFloat(-0.1, 0.1);
        if (hues[i] > 1.0)
            hues[i] -= 1.0;
        else if (hues[i] < 0.0)
            hues[i] += 1.0;
    }

    for (var j = 0; j < nbrColors2; j++) {
        colors[j] = new THREE.Color().setHSL(hues[0], 1-(j/nbrColors2), 0.5);
        colors[nbrColors-j-1] = new THREE.Color().setHSL(hues[1], (j/nbrColors2), 0.5);
    }
    plainColor = colors[nbrColors2] = new THREE.Color().setHSL(0, 0, 0.5);
}


function onDocumentMouseDown(event) {
    var mouseVec = new THREE.Vector3(
        2*(event.clientX/canvasWidth)-1,
        1-2*(event.clientY/canvasHeight), 0);
    var raycaster = projector.pickingRay(mouseVec.clone(), camera);
    var intersects = raycaster.intersectObjects(theObjects);
    if ((theWaveObjects.length < maxNbrWaveObjects) && (intersects.length > 0)) {
        var aWave = new Object();
        aWave.anchor = intersects[0].object;
        aWave.curWave = 0;
        aWave.freq = getRandomFloat(0.2, 0.6);
        aWave.amp = getRandomFloat(1.5, 3.0);
        aWave.limit = getRandomInt(10, 30);
        aWave.rate = getRandomFloat(1.0, 10.0);
        theWaveObjects.push(aWave);
        updateHeightRange();
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);


function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    var delta = clock.getDelta();
    for (var w = 0; w < theWaveObjects.length; w++) {
        var wave = theWaveObjects[w];
        wave.curWave += (wave.rate * delta);
    }
    if (theWaveObjects.length > 0)
        updateSquares();
    timeToColorChange += delta;
    if (timeToColorChange >= changeColorEvery) {
        initializeColors();
        timeToColorChange = 0;
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



init();
createScene();
addToDOM();
render();
animate();

