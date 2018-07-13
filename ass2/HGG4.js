/***********
 * HGG4.js
 * A knotty cylinder
 * D. Bruccoleri
 * Jan 2015
 ***********/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function divColor (index, max){ 
	var freq = 2*Math.PI*index/max;
	var phase120 =  2*Math.PI/3;  // 120 degrees
	var phase240 = 4*Math.PI/3; // 240 degrees
	
	var red   = Math.cos(freq ) * 127 + 128;
	var green = Math.cos(freq + phase120) * 127 + 128;
	var blue  = Math.cos(freq + phase240) * 127 + 128;
    return 'rgb(' + Math.round(red) + ',' + Math.round(green) + ',' + Math.round(blue) + ')';
}

function createKnottedCylinder(n, heights, scales, isCappedBottom, isCappedTop){
		const nbrSegments = heights.length-1;
		const inc = 2.0*Math.PI/n;
		var mesh = new THREE.Mesh();
		var k=0;
		var geom = new THREE.Geometry();
		var mat = new THREE.MeshFaceMaterial();
		var face_ndx = 0;
		
		for( k=0, nxt=0.0; k<n; k++, nxt+=inc)// push base vertices
			geom.vertices.push(new THREE.Vector3(scales[0]*Math.sin(nxt), heights[0], scales[0]*Math.cos(nxt)));
		
		for(var j=0, k=n; j<nbrSegments ; j++, k+=n){
	        mat.materials.push(new THREE.MeshLambertMaterial({color: divColor(j,nbrSegments), side: THREE.DoubleSide}));

			// push vertices to form first side edge of a segment
			geom.vertices.push( new THREE.Vector3(0, heights[j+1],  scales[j+1]));
			for(var i=1, nxt=inc; i<n; i++, nxt+=inc){
				geom.vertices.push(new THREE.Vector3(scales[j+1]*Math.sin(nxt), heights[j+1], scales[j+1]*Math.cos(nxt)));
				
				// two triangles for side from this edge and previous edge
				geom.faces.push( new THREE.Face3(k+ i, k+i-1, k+i-n-1));
				geom.faces[face_ndx++].materialIndex = j;

				geom.faces.push( new THREE.Face3( k+i, k+i-n-1, k+i-n));		
				geom.faces[face_ndx++].materialIndex = j;
			}
			// close cylinder segment
			geom.faces.push( new THREE.Face3( k, k+i-1, k-1));
			geom.faces[face_ndx++].materialIndex = j;
			geom.faces.push( new THREE.Face3( k, k-1, k-n));	
			geom.faces[face_ndx++].materialIndex = j;
		}
		
		if( isCappedBottom )
			for (var i = 0; i<n-2 ; i++){
				geom.faces.push( new THREE.Face3( i+2, i+1, 0));
				geom.faces[face_ndx++].materialIndex = 0;
			}				
		if( isCappedTop )
			for (var i = n*nbrSegments; i< n*(nbrSegments+1)-2 ; i++){
				geom.faces.push( new THREE.Face3( n*nbrSegments, i+1, i+2));
				geom.faces[face_ndx++].materialIndex = nbrSegments-1;
			}

		geom.computeFaceNormals();
		mesh.add( new THREE.Mesh(geom,mat));

		return mesh;
}

function createScene() {
	var heights = [0.0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.1, 4.2, 4.3, 4.3];
	var scales = [1.8, 1.95, 2.0, 1.95, 1.8, 1.5, 1.2, 1.05, 1.0, 1.05, 1.15, 1.25, 1.35, 1.45, 1.5];
	var n = 12;
	var geom = createKnottedCylinder(n, heights, scales, true);
    // triangle geometry
   scene.add(geom);
	
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
	camera.position.set(0, 15, 15);
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

