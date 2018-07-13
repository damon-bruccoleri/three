/***********
 * MC1.js
 * D Bruccoleri
 * Feb 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

// M x N x O matrix of boxes centered in the xyz-plane
function createCube3DMatrix(m, n, o, offset) {
   
   var offset = (offset !== undefined) ? offset : 2.0;
    var geom = new THREE.CubeGeometry(1, 1, 1);
    var mat = new THREE.MeshLambertMaterial({color:'red'});
    var protoMesh = new THREE.Mesh(geom, mat);
    var xMin = -offset * ((m-1) / 2.0);
    var yMin = -offset * ((n-1) / 2.0);
    var zMin = -offset * ((o-1) /2.0);
    for (i = 0, x = xMin; i < m; i++, x += offset)
        for (j = 0, y = yMin; j < n; j++, y += offset)
			for(k = 0, z= zMin; k<o; k++, z+= offset){
				var abox = protoMesh.clone();
				abox.position.set(x,y,z);
            	scene.add(abox);
			}
}

function createScene(){
	createCube3DMatrix(9,9,9);
	
    var light = new THREE.DirectionalLight(0xFFFFFF, 0.6);
    light.position.set(0, 0, 10);
    var light2 = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    light2.position=camera.position;
    var ambientLight = new THREE.AmbientLight(0x222222);

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

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 20);
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


	init();
	createScene();
    //showGrids();
	addToDOM();
    render();
	animate();
