/***********
 * MC1.js
 * D Bruccoleri
 * Feb 2015
 ***********/

var camera, scene, renderer;
var cameraControls;

var currentMat, currentMesh;
var clock = new THREE.Clock();

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
	        mat.materials.push(new THREE.MeshLambertMaterial({color: new THREE.Color().setHSL(j/(nbrSegments-1), 1.0, 0.5),
																side: THREE.DoubleSide}));

			// push vertices to form first side edge of a segment
			geom.vertices.push( new THREE.Vector3(0, heights[j+1], scales[j+1]));
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

function createTorus(n, nbrKnots, outerRadius, innerRadius, startAngle, endAngle){
	var heights = [];
	var scales = [];
	const angleInc = (endAngle-startAngle)/(nbrKnots-1);

	for (var i = 0, angle=startAngle; i<nbrKnots ; i++, angle += angleInc){
		heights[i] = innerRadius * Math.sin( angle);
		scales[i] = outerRadius + innerRadius * Math.cos( angle);
	}

	return createKnottedCylinder(n, heights, scales);
}

function createScene() {
	var n = 20;
	var nbrKnots = 24;
	var startAngle = 0;
	var endAngle =  2 * Math.PI;
	var outerRadius = 8;
	var innerRadius = 2;
	var geom = createTorus(n, nbrKnots, outerRadius, innerRadius, startAngle, endAngle);

	// triangle geometry
	
	scene.add(geom);
	
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

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 20, 30);
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
