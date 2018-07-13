/***********
 * MC2.js
 * D Bruccoleri
 * Feb 2015
 ***********

Challenge MC.2 
Ziggurats are rectangular, stepped pyramids that date back to 
sixth century B.C. Mesopotamia (though don't quote me on that). 
Here we'll attempt ziggurats that are more modern and insubstantial. 
The function ziggurat(n, zheight, sf) returns a scene graph 
representing an n-step ziggurat. Each step is scaled by a factor 
of sf in x and z relative to the step on which it sits (the bottom 
step is 2×2 in the xz-plane), and every step has height zheight. 
Use the color scheme of your choice. The ziggurat pictured below 
was created with the call ziggurat(30, .2, .9).
*/


var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var nbrSegments;


function ziggurat(n, zheight, sf){

	var mat = new THREE.MeshLambertMaterial({ side: THREE.FrontSide });
	mat.color = new THREE.Color().setHSL( n/nbrSegments, 1, .5);
	if (typeof geom == 'undefined')  geom = new THREE.BoxGeometry(2, zheight, 2);
	var parentmesh = new THREE.Mesh(geom,mat);
	if(n>1){
		var mesh = ziggurat(n-1, zheight, sf);
		mesh.position.y = zheight;//shift whole stack of children 1 segment up
		mesh.scale.set(sf,1,sf); //scale whole stack of children
		parentmesh.add(mesh); // tack on base
	}
	return parentmesh;
}


function createScene() {
	nbrSegments = 30; //global
	scene.add(ziggurat(nbrSegments, 0.2, 0.9));

    var light = new THREE.DirectionalLight(0xFFFFFF, 0.8, 1000 );
    light.position.set(0, 0, 10);
    var light2 = new THREE.DirectionalLight(0xFFFFFF, 0.7, 1000 );
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
    //mat.color = new THREE.Color(controls.color);
    //mat.opacity = controls.opacity;
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
	camera.position.set(8, 8, 15);
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
//    showGrids();
	addToDOM();
    render();
	animate();
