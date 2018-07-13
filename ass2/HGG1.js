/***********
 * HGG1.js
 * Stairway with Lambert and lighting
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createSteps( geom, riser, tread, width, nbrSteps) { 
	
	if(nbrSteps){
		// create steps below this one
		createSteps(geom, riser, tread, width, nbrSteps-1);
	}else{
		// when we get to bottom we need two vertices. 
		geom.vertices.push(new THREE.Vector3(tread*nbrSteps, riser*nbrSteps, width));
		geom.vertices.push(new THREE.Vector3(tread*nbrSteps, riser*nbrSteps, 0));
	}
		
	// create a step 
	var inx = geom.vertices.length;
	
	// use the two vertices of the step below this one, plus add two more for tread
	geom.vertices.push(new THREE.Vector3(tread*nbrSteps, riser*(nbrSteps+1), width));
	geom.vertices.push(new THREE.Vector3(tread*nbrSteps, riser*(nbrSteps+1), 0));

	geom.faces.push( new THREE.Face3( inx-1, inx-2, inx));
	geom.faces.push( new THREE.Face3( inx-1, inx, inx+1));

	geom.vertices.push(new THREE.Vector3(tread*(nbrSteps+1), riser*(nbrSteps+1), width));
	geom.vertices.push(new THREE.Vector3(tread*(nbrSteps+1), riser*(nbrSteps+1), 0));

	geom.faces.push( new THREE.Face3(inx+1, inx, inx+2));
	geom.faces.push( new THREE.Face3(inx+1, inx+2, inx+3));
}

function createStairs(riser, tread, width, nbrSteps){
	var geom = new THREE.Geometry();

	createSteps( geom, riser, tread, width, nbrSteps-1);
	
	geom.computeFaceNormals();
    mat = new THREE.MeshLambertMaterial({ color: "red"   , side: THREE.DoubleSide, overdraw: true  });
	var mesh = new THREE.Mesh(geom,mat);
    return mesh;
}


function createScene() {

	var mesh = createStairs(1,2,4,5);

      // add subtle ambient lighting
      var ambientLight = new THREE.AmbientLight(0x1f1F1F);
      scene.add(ambientLight);
      
      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0xffffff,1);
      directionalLight.position = camera.position;
      scene.add(directionalLight);

      // directional lighting from camera
      var directionalLight2 = new THREE.DirectionalLight(0xffffff,1);
      directionalLight2.position.set(0, -10, 1).normalize();
      scene.add(directionalLight2);

      scene.add(mesh);
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
    camera.position.set(-10, 20, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
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


    init();
    showGrids();
    createScene();
    addToDOM();
    render();
    animate();
