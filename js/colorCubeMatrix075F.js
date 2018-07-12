/***********
 * cubeMatrix070F.js
 * M. Laszlo
 * November 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var controls, sliderIndex;
var clock = new THREE.Clock();
var mats;
var m = 80, n = 80;

var snake;


controls = new function() {
    this.colorDimension = 'Lightness';
    this.val = 0.8;
    sliderIndex = 2;  // lightness
}

function squareGeom() {
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(-0.5, -0.5, 0.0));
    geom.vertices.push(new THREE.Vector3(0.5, -0.5, 0.0));
    geom.vertices.push(new THREE.Vector3(0.5, 0.5, 0.0));
    geom.vertices.push(new THREE.Vector3(-0.5, 0.5, 0.0));
    geom.faces.push(new THREE.Face3(0, 1, 2));
    geom.faces.push(new THREE.Face3(0, 2, 3));
    return geom;
}

function createScene(m, n, offset) {
    // fit into 10x10 square
    var root = new THREE.Object3D();
    root.scale.x = 10 / m*offset;
    root.scale.y = 10 / n*offset;

    // array of materials
    mats = new Array(m);
    for (var i = 0; i < m; i++) {
        mats[i] = new Array(n);
    }

    offset = offset !== undefined ? offset : 2.0;
    var geom = squareGeom();
    var xMin = -offset * ((m-1) / 2.0);
    var yMin = -offset * ((n-1) / 2.0);
    var mn = m * n;
    for (var i = 0, x = xMin; i < m; i++, x += offset) {
        for (var j = 0, y = yMin; j < n; j++, y += offset) {
            mats[i][j] = new THREE.MeshBasicMaterial({shading: THREE.FlatShading, side: THREE.DoubleSide});
            var square = new THREE.Mesh(geom, mats[i][j]);
            square.position.x = x;
            square.position.y = y;
            root.add(square);
        }
    }
    updateMaterials(m, n);
    scene.add(root);
}

function updateMaterials(m, n) {
    var a = [null, null, null];
    var h = s = l = null;
    if (sliderIndex == 0) {h = 0; s = 1; l = 2;}
    else if (sliderIndex == 1) {h = 1; s = 0; l = 2;}
    else {h = 1; s = 2; l = 0;}
    a[0] = controls.val;
    for (var i = 0; i < m; i++) {
        a[1] = i/(m-1);
        for (var j = 0; j < n; j++) {
            a[2] = j/(n-1);
            mats[i][j].color.setHSL(a[h], a[s], a[l]);
        }
    }
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    updateSnake();
    var delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}

function updateColorDimension(sliderType) {
    if (sliderType === 'Hue') sliderIndex = 0;
    else if (sliderType === 'Saturation') sliderIndex = 1;
    else sliderIndex = 2;
    updateMaterials(m, n);
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
	camera.position.set(0, 0, 15);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    var gui = new dat.GUI();
    var dimensionTypes = ['Hue', 'Saturation', 'Lightness'];
    var dimensionItem = gui.add(controls, 'colorDimension', dimensionTypes);   
    dimensionItem.onChange(updateColorDimension); 
    gui.add(controls, 'val', 0.0, 1.0).onChange(function (val) {updateMaterials(m, n);});

    initSnake(40);
}

function initSnake(len) {
    snake = [];
    var last = [getRandomInt(0, m-1), getRandomInt(0, n-1)];
    snake.push(last);
    for (var i = 1; i < len; i++) {
        last = snakeNext(last);
        snake.push(last);
    }
}

function snakeNext(xy) {
    var rnd = (Math.random() < 0.7) ? preferredDirection : getRandomInt(0, 3);
    preferredDirection = rnd;
    var next = xy.slice(0);
    if (rnd === 0) {
        next[0] -= 1; 
        if (next[0] < 0) 
            next[0] = m-1;
    } else if (rnd === 1) {
        next[0] = (next[0] + 1) % m;
    } else if (rnd === 2) {
        next[1] -= 1; 
        if (next[1] < 0) 
            next[1] = n-1;
    } else {
        next[1] = (next[1] + 1) % n;
    }
    return next;
}


var snakeColor = new THREE.Color(0x757575);
var preferredDirection = getRandomInt(0, 3);

function updateSnake() {
    var last = snake[snake.length-1];
    var next = snakeNext(last);
    snake.push(next);
    mats[next[0]][next[1]].color.copy(snakeColor);
    var first = snake[0];
    snake.shift();
    // restore color of first
    var h = null;
    if (sliderIndex == 0) {h = 0; s = 1; l = 2;}
    else if (sliderIndex == 1) {h = 1; s = 0; l = 2;}
    else {h = 1; s = 2; l = 0;}
    var i = first[0];
    var j = first[1];
    var a = []; a.push(controls.val); a.push(i/(m-1)); a.push(j/(n-1));
    mats[i][j].color.setHSL(a[h], a[s], a[l]);
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
	createScene(m, n, 1);
	addToDOM();
	animate();
/**
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
**/
