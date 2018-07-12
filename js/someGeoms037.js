/***********
 * someGeoms037.js
 * Some three.js geometries
 * M. Laszlo
 * October 2014
 ***********/

var camera, scene, renderer;
var cameraControls;
var gui, controls;
var currentMat, currentMesh;
var clock = new THREE.Clock();


function Controls() {
    this.type = 'Sphere';
    this.wireframe = false;
}

function createScene() {
    currentMat = new THREE.MeshLambertMaterial({ambient: 0x222222, color: "blue", shading: THREE.FlatShading}); 
    updateObject('Sphere');
    var light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    var light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
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
    camera.position.set(0, 0, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    initGui();
}

function updateObject(objectType) {
    var geom;     
    if (currentMesh)
        scene.remove(currentMesh);
    switch (objectType) {
        case 'Sphere':  geom = new THREE.SphereGeometry(10, 24, 24);
                        break;
        case 'Torus':   geom = new THREE.TorusGeometry(10, 3, 24, 36);
                        break;
        case 'Octahedron': geom = new THREE.OctahedronGeometry(8);
                        break;
        case 'Knot':    geom = new THREE.TorusKnotGeometry(5, 2);
                        break;
        case 'Icosahedron': geom = new THREE.IcosahedronGeometry(7);
                        break;
        case 'Cylinder': geom = new THREE.CylinderGeometry(5, 5, 20, 16);
                        break;
    }
    if (geom) {
        currentMesh = new THREE.Mesh(geom, currentMat);
        scene.add(currentMesh);
    }
}

function initGui() {
    gui = new dat.GUI();
    controls = new Controls();
    var objectTypes =  ['Sphere', 'Torus', 'Octahedron', 'Icosahedron', 'Cylinder', 'Knot']
    var typeItem = gui.add(controls, 'type', objectTypes);
    typeItem.onChange(updateObject);
    var isWireframe = gui.add(controls, 'wireframe');
    isWireframe.onChange(function(value) { currentMat.wireframe = value; });
}


function showGrids() {
    // Grid step size is 1; axes meet at (0,0,0)
    // Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
    // Coordinates.drawAllAxes({axisLength:11, axisRadius:0.05});
}


function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}


try {
    init();
    showGrids();
    createScene();
    addToDOM();
//    render();
    animate();
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}