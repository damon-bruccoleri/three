/***********
 * ST2.js
 * An open cube with Lambert and lighting
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createCube() {
    var geom = new THREE.Geometry();
    for (var x = -1; x < 2; x+=2)
        for (var y = -1; y < 2; y+=2)
            for (var z = -1; z < 2; z+=2)
                geom.vertices.push(new THREE.Vector3(x, y, z));
    var faces = [[0, 6, 4],  // back
                 [6, 0, 2],
                 [1, 7, 3],  // front
                 [7, 1, 5],
                 [5, 6, 7],  // right
                 [6, 5, 4],
                 [1, 2, 0],  // left
                 [2, 1, 3],
                 [5, 0, 4],   // bottom
                 [0, 5, 1]
                ];
	for (var i = 0; i < 10; i++)
        geom.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]) );
	geom.computeFaceNormals();
    mat = new THREE.MeshLambertMaterial({ color: "red"   , side: THREE.DoubleSide, overdraw: true  });

    var mesh = new THREE.Mesh(geom,mat);
    return mesh;
}


function createScene() {
    

	var mesh = createCube();


	var axes = new THREE.AxisHelper( 20 );
	scene.add(axes);

      // add subtle ambient lighting
      var ambientLight = new THREE.AmbientLight(0x1f1F1F);
      scene.add(ambientLight);
      
      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0x7fffff,1);
      //directionalLight.position.set(0, 10, -1).normalize();
      directionalLight.position = camera.position;
      scene.add(directionalLight);

      // directional lighting from camera
      var directionalLight2 = new THREE.DirectionalLight(0x7fffff,1);
      //directionalLight2.position = camera.position;
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
    camera.position.set(8, 12, 10);
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


// try {
    init();
    showGrids();
    createScene();
    addToDOM();
    render();
    animate();
/*
} catch(e) {
    var errorMsg = "Error: " + e;
    document.getElementById("msg").innerHTML = errorMsg;
}
*/