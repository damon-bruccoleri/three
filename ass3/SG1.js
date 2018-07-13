/***********
 * SG1.js
 * Torus Explorer
 * 
 * Damon Bruccoleri
 * Feb 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var gui, controls;
var currentMat, currentMesh;
var clock = new THREE.Clock();

function createScene() {
   
	currentMat = new THREE.MeshPhongMaterial({color: "blue", shading: THREE.FlatShading}); 
    var geom = new THREE.TorusGeometry(controls.radius,controls.tube,controls.radialsegments,controls.tubularsegments);
    currentMesh = new THREE.Mesh(geom, currentMat);
    scene.add(currentMesh);
    var light = new THREE.PointLight(0xFFFFFF, 0.5, 1000 );
    light.position.set(40, 0, 40);
    var light2 = new THREE.PointLight(0xFFFFFF, 1, 1000 );
    light2.position = camera.position;
    var ambientLight = new THREE.AmbientLight(0x333333);
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

    renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1.0);

    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 20, 70);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    initGui();
}

function Controls() {
    this.radius = 4.5;
    this.tube = 4.0;
	this.radialsegments = 8;
	this.tubularsegments = 6;
	this.arc = 360;
	this.go = function() {
		if(currentMesh)
			scene.remove(currentMesh);
		var geom = new THREE.TorusGeometry(this.radius, this.tube, this.radialsegments, this.tubularsegments, this.arc*2*Math.PI/360); 
		currentMesh = new THREE.Mesh(geom, currentMat);
		scene.add(currentMesh);};
}


function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    gui.add(controls, 'radius', 0.1, 25).step(0.1);
    gui.add(controls, 'tube',1, 10).step( 0.1 );
	gui.add(controls, 'radialsegments', 4, 40).step(1);
	gui.add(controls, 'tubularsegments', 6, 40).step(1);
	gui.add(controls,'arc', 0, 360).step(5);
	gui.add(controls,'go');
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
//    render();
    animate();
