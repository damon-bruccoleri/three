/***********
 * HGG2.js
 * A cylinder 
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function createCylinder(n, len, rad, isCappedBottom, isCappedTop){
		const inc = 2.0*Math.PI/n;
		
		var geom = new THREE.Geometry();
		
		// push two vertices to form first side edge
		geom.vertices.push( new THREE.Vector3(0, len/2.0, rad));
		geom.vertices.push( new THREE.Vector3(0, -len/2.0, rad));
		for(var i=2, nxt=inc ; i < 2*n ;i+=2, nxt+=inc){
			var tpt = new THREE.Vector3(rad*Math.sin(nxt), len/2.0, rad*Math.cos(nxt));
			var bpt = tpt.clone();
			bpt.y = -len/2.0;
			geom.vertices.push(tpt);
			geom.vertices.push(bpt);
			
			// two triangles for side from this edge and previous edge
			geom.faces.push( new THREE.Face3( i-2, i-1, i));
			geom.faces.push( new THREE.Face3( i-1, i+1, i));		
		}
		// close cylinder
		geom.faces.push( new THREE.Face3( 0,1,i-2));//javascript scoping
		geom.faces.push( new THREE.Face3( 1,i-2,i-1));		

		if( isCappedTop )
			for (i = 0; i<n-2 ; i++)
				geom.faces.push( new THREE.Face3( 0, 2*i+2, 2*i+4));		
		if( isCappedBottom )
			for (i = 0; i<n-2 ; i++)
				geom.faces.push( new THREE.Face3( 2*i+5, 2*i+3, 1));		

		geom.computeFaceNormals();


		return geom;
}

function createScene() {
   
		var mat = new THREE.MeshLambertMaterial({ color: "blue", side: THREE.DoubleSide, overdraw: true  });

		geom = createCylinder(12, 6.0, 2.0);
		var mesh = new THREE.Mesh(geom,mat);	
		scene.add(mesh);
	
		var axes = new THREE.AxisHelper( 20 );
		scene.add(axes);

      // add subtle ambient lighting
      var ambientLight = new THREE.AmbientLight(0x1f1F1F);
      scene.add(ambientLight);
      
      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0xffffff,1);
      //directionalLight.position.set(0, 10, -1).normalize();
      directionalLight.position = camera.position;
      scene.add(directionalLight);

      // directional lighting from camera
      var directionalLight2 = new THREE.DirectionalLight(0xffffff,1);
      //directionalLight2.position = camera.position;
      directionalLight2.position.set(0, -10, 1).normalize();
      scene.add(directionalLight2);

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
	camera.position.set(0, 20, 10);
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


//try {
	init();
    //showGrids();
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
