// ---- Constants ----
var BASE_CAM_POSITION = [-800, 700, 1300];
var CAM_ORBIT = 0;
var CAM_FPV = 1;
var MARKERS_FILENAME = "data/markers.txt";

// ---- Map values ----
var MODEL_WIDTH = 1478;
var MAP_FULL_WIDTH = 960;
var FULL_MAP_DELTA = 445;
var MAP_FULL_HEIGHT = 520;
var MAP_MINI_WIDTH = 250;
var MAP_MINI_HEIGHT = 250;

var mapWidth;
var mapHeight;
var mapModelWidth;
var baseMarginX;
var baseMarginY;
var mapPixelFactor;

// ---- Edit mode values ----
var clickInfo = {
	x: 0,
	y: 0,
	userHasClicked: false
};
var currentMousePos = { x: -1, y: -1 };
var raycaster = new THREE.Raycaster();
var directionVector = new THREE.Vector3();
var markerListContainerId;

// ---- Model values ----
var windowWidth;
var windowHeight;
var editmode;
var controls;
var currentControl;
var orbitCam;
var fpvCam;
var scene;
var camera; 
var renderer;
var clock;
var daeModel;
var model;
var markers = [];

// -------------------- Scene & model initialization --------------------

// Init base scene
function createBaseScene(editmode) {
	clock = new THREE.Clock();
	// Create three.js Scene
	scene = new THREE.Scene();
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(windowWidth, windowHeight);
	document.body.appendChild(renderer.domElement);
	camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 10000);
	camera.position.set(BASE_CAM_POSITION[0],BASE_CAM_POSITION[1],BASE_CAM_POSITION[2]);
	fpvCam = [camera.position.x, camera.position.y, camera.position.z];
	orbitCam = [camera.position.x, camera.position.y, camera.position.z];
	camera.lookAt(new THREE.Vector3(1, 1, 1));
	scene.add(camera);
  
    // Handle size and ration on window resize
	window.addEventListener('resize', function() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		renderer.setSize(windowWidth, windowHeight);
		camera.aspect = windowWidth / windowHeight;
		camera.updateProjectionMatrix();
	});
  
	// Set if Edit Mode or not
	this.editmode = editmode;
	
	if(editmode){
		$(document).keypress(function(e) {
      var code = e.charCode || e.keyCode;
			if(code != 32)
				return;
			
			// If user presses space, save x & y
			clickInfo.userHasClicked = true;
			clickInfo.x = currentMousePos.x;
			clickInfo.y = currentMousePos.y;
		});
    
		$(document).mousemove(function(event) {
			// Always save current mouse position
			currentMousePos.x = event.pageX;
			currentMousePos.y = event.pageY;
		});
	} else {
		window.addEventListener('click', function (evt) {
			clickInfo.userHasClicked = true;
			clickInfo.x = evt.clientX;
			clickInfo.y = evt.clientY;
		}, false);
	}
}

// Add ligths to scene
function addDirectinalLights(){
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );

	dirLight.castShadow = true;

	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;

	var d = 50;

	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;

	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
}

// Add three point lights to the scene
function addThreePointLighting(){
	var d = 50;
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );
	
	dirLight.castShadow = true;
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;
	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;
	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
	
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 1, -1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );
	
	dirLight.castShadow = true;
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;
	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;
	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;
	
	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( 1, -1.75, -1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );
	
	dirLight.castShadow = true;
	dirLight.shadowMapWidth = 2048;
	dirLight.shadowMapHeight = 2048;
	dirLight.shadowCameraLeft = -d;
	dirLight.shadowCameraRight = d;
	dirLight.shadowCameraTop = d;
	dirLight.shadowCameraBottom = -d;
	dirLight.shadowCameraFar = 3500;
	dirLight.shadowBias = -0.0001;
	dirLight.shadowDarkness = 0.35;

}

// Add ground to scene
function addGround(color){
	var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	groundMat.color = new THREE.Color( color );
	
	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = -33;
	scene.add( ground );
}

// Add skydome to scene
function addSkydome(){
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:		 { type: "f", value: 33 },
		exponent:	 { type: "f", value: 0.6 }
	};
	
	var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	
	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );
}

// Load collada model and add to scene
function loadColladaModel(spinnerClass, overlayClass, topoId){
	// Create new collada loader - can be replaced
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( 'assets/model/model.dae', function ( collada ) {
		daeModel = collada.scene;
		
		// Always show both sides of mesh (Model has errors)
		daeModel.traverse(function(child){
			if (child instanceof THREE.Mesh){        
				child.material.side = THREE.DoubleSide;        
			}        
		});         
				
		var skin = collada.skins[ 0 ];
		daeModel.position.set(0,0,0);
		daeModel.scale.set(1.5,1.5,1.5);
		scene.add(daeModel);
		
		addSavedMarkersToScene();
		animate();
		
		// Hide the spinner and overlay. Show topobox
		$(spinnerClass).hide();
		$(overlayClass).hide(); 
		$(topoId).slideDown( "fast");
	});
}

// Load JSON model and add to scene
function loadJSONModel(spinnerClass, overlayClass, topoId){
	var loader = new THREE.ObjectLoader(); 
	loader.load("assets/model/model.json", function( obj ){ 
		model = obj;
		
		// Always show both sides of mesh (Model has errors)
		model.traverse(function(child){
			if (child instanceof THREE.Mesh){        
				child.material.side = THREE.DoubleSide;        
			}        
		}); 
		
		model.position.set(0,0,0);
		model.scale.set(1.5,1.5,1.5);
		scene.add( model ); 
		
		addSavedMarkersToScene();
    
		// Show marker list if editmode
		if(editmode)
			updateMarkerList();
    
		animate();
		
		// Hide the spinner and overlay. Show topobox
		$(spinnerClass).hide();
		$(overlayClass).hide(); 
		$(topoId).slideDown( "fast");
	});
}



// Add Markers to the scene
function addSavedMarkersToScene(){
	// Get markers from File
	var text = readTextFile(MARKERS_FILENAME);
	
	if(text == "")
		return;
	
	// Parse to array
	var savedMarkers = JSON.parse(text);
	
	$.each(savedMarkers, function (index, value){
		// Create new Sphere Mesh at position from file
		var marker = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
		marker.position.x = value.position.x;
		marker.position.y = value.position.y;
		marker.position.z = value.position.z;
		marker.id = index;
		marker.name = value.name;
		
		// Add marker from file to local array
		markers.push(marker);
		
		// Add marker from file to scene
		scene.add(marker);
	});
}

// Read the Json Markers from File
function readTextFile(file){
	// Get File from XMLHttpRequest
	var rawFile = new XMLHttpRequest();
	var text = "";
	rawFile.open("GET", file, false);
	// If reading successful, get responseText
	rawFile.onreadystatechange = function ()
	{
		if(rawFile.readyState === 4)
		{
			if(rawFile.status === 200 || rawFile.status == 0)
			{
				text = rawFile.responseText;
			}
		}
	}
  
	rawFile.send(null);
	
	// Return the Json String
	return text;
}

// -----------------------------------------------------

// -------------------- Controllers --------------------

// Set orbit contorls
function setOrbitControls(restoreCam){  
	if(restoreCam)
		restoreOrbitCam();
	
	if(controls != undefined)
		controls.dispose();
		
	// Create new Orbit Controller
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	// Set maxPolarAngle and maxDistance, that user can't get out of skybox
	controls.maxPolarAngle = Math.PI/2;
	controls.maxDistance = 2500;
	
	currentControl = CAM_ORBIT;
}

// Reset orbit camera position
function restoreOrbitCam(){
	fpvCam = [camera.position.x, camera.position.y, camera.position.z];
	camera.position.set(orbitCam[0],orbitCam[1],orbitCam[2]);
	camera.lookAt(new THREE.Vector3(1, 1, 1));  
}

// Set FPV controller
function setFPVControls(restoreCam){
	if(restoreCam)
		restoreFPVCam();
	
	if(controls != undefined)
		controls.dispose();
		
	controls = new THREE.FirstPersonControls(camera);
	controls.lookSpeed = 0.12;
	controls.movementSpeed = 250;
	controls.noFly = true;
	controls.flightModeWithClick = true;
	controls.lookVertical = true;
	controls.constrainVertical = false;
	controls.blockUpDown = true;
	controls.verticalMin = 1.0;
	controls.verticalMax = 2.0;
	controls.lon = 300;
	controls.lat = -20;
	
	currentControl = CAM_FPV;
}

// Reset FPV camera
function restoreFPVCam(){
	orbitCam = [camera.position.x, camera.position.y, camera.position.z];
	camera.position.set(fpvCam[0],fpvCam[1],fpvCam[2]);
	camera.lookAt(new THREE.Vector3(1, 1, 1));  
}

// Save and restore camera position on controller change
function resetCameraPositionOnModel(){
	camera.position.set(BASE_CAM_POSITION[0],BASE_CAM_POSITION[1],BASE_CAM_POSITION[2]);
	camera.lookAt(new THREE.Vector3(1, 1, 1));  
	
	if(currentControl == CAM_ORBIT){
		setOrbitControls(false);    
	} else if(currentControl == CAM_FPV){
		setFPVControls(false);
	}    
}

// Animate scene
function animate() {
	var updateControls = true;
	
	if(editmode)
		setBoxOnUserClick();
	else
		updateControls = detectIfMarkerClicked();
		
	renderer.clear();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	
	// Update the minimap and detect the collisions (only fpv mode)
	if(updateControls){
		updateMap();
		detectCollision();
		controls.update(clock.getDelta());
	}
}

// ------------------------------------------------------

// -------------------- Map handling --------------------

// Update camera position on map
function updateMap(){  
	var mapPixelFactorMini = MAP_MINI_WIDTH / MODEL_WIDTH;
	var mapPixelFactorFull = (MAP_FULL_WIDTH - FULL_MAP_DELTA) / MODEL_WIDTH;
		
	var marginXMini = MAP_MINI_WIDTH / 2 - (camera.position.x * mapPixelFactorMini);
	var marginYMini = MAP_MINI_HEIGHT / 2 - (camera.position.z * mapPixelFactorMini);
	var marginXFull = MAP_FULL_WIDTH / 2 - (camera.position.x * mapPixelFactorFull);
	var marginYFull = MAP_FULL_HEIGHT / 2 - (camera.position.z * mapPixelFactorFull);
	
	if(marginXMini > MAP_MINI_WIDTH - 18){
		marginXMini = MAP_MINI_WIDTH - 18;
	} else if(marginXMini < 0){
		marginXMini = 0;
	}
	
	if(marginYMini > MAP_MINI_HEIGHT - 18){
		marginYMini = MAP_MINI_HEIGHT - 18;
	} else if(marginYMini < 0){
		marginYMini = 0;
	}
	
	if(marginXFull > MAP_FULL_WIDTH - 18){
		marginXFull = MAP_FULL_WIDTH - 18;
	} else if(marginXFull < 0){
		marginXFull = 0;
	}
	
	if(marginYFull > MAP_FULL_HEIGHT - 18){
		marginYFull = MAP_FULL_HEIGHT - 18;
	} else if(marginYFull < 0){
		marginYFull = 0;
	}
	
	$('#mini-map-point').css('margin-right', marginXMini + 'px');
	$('#mini-map-point').css('margin-bottom',  marginYMini + 'px');
	$('#full-map-point').css('margin-right', marginXFull + 'px');
	$('#full-map-point').css('margin-bottom',  marginYFull + 'px');
}

// ----------------------------------------------------------

// -------------------- Marker detection --------------------

// Check if user click hit a marker
function detectIfMarkerClicked(){
	if (!clickInfo.userHasClicked) {
		return true;
	}
	clickInfo.userHasClicked = false;
	
	// Shoot ray from center of screen to the mouse position
	var mouse = new THREE.Vector2();
	mouse.x = ( clickInfo.x / windowWidth ) * 2 - 1;
	mouse.y = -( clickInfo.y / windowHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	
	// Check if the ray intersected with a marker object
	var intersects = raycaster.intersectObjects(markers, true);
	if (intersects.length > 0) {
		// Show Overlay of Marker if successful hit
		showContentOverlay(intersects[0].object.name);
		return false;
	}
	return true;
}

// Load html file with the same name as the marker in content div
function showContentOverlay(markerName){
	$( "#content" ).load( "content/" + markerName + ".html" );
	$( "#content-container" ).fadeIn( 300 );
}

// -------------------------------------------------------------

// -------------------- Collision detection --------------------

// Detect collision
function detectCollision(){
	resetBlockings();
	
	if(controls.moveForward && controls.moveRight){
		detectFR();
		return;
	}
	
	if(controls.moveForward && controls.moveLeft){
		detectFL();
		return;
	}
	
	if(controls.moveBackward && controls.moveRight){
		detectBR();
		return;
	}
	
	if(controls.moveBackward && controls.moveLeft){
		detectBL();
		return;
	}  
	
	if(controls.moveForward){
		detectF();
		return;
	} 
	
	if(controls.moveBackward){
		detectB();
		return;
	} 
	
	if(controls.moveRight){
		detectR(); 
		return;
	} 
	
	if(controls.moveLeft){
		detectL();
		return;
	}
}

// Reset block direction from previous collision detection
function resetBlockings(){
    controls.blockForward = false;
    controls.blockBackward = false;
    controls.blockRight = false;
    controls.blockLeft = false;
}

// Execute collsion detection on each direction
function detectF(){
	if(detectCollisionUsingVector(0, 0, -1)){
		controls.blockForward = true;
	} 
}

function detectB(){  
	if(detectCollisionUsingVector(0, 0, 1)){
		controls.blockBackward = true;
	} 
}

function detectR(){
	if(detectCollisionUsingVector(1, 0, 0)){
		controls.blockRight = true;
	}	 
}

function detectL(){
	if(detectCollisionUsingVector(-1, 0, 0)){
		controls.blockLeft = true;
	}
}

function detectFR(){
	if(detectCollisionUsingVector(1, 0, -1)){
		controls.blockForward = true;
		controls.blockRight = true;
	} 
}

function detectFL(){
	if(detectCollisionUsingVector(-1, 0, -1)){
		controls.blockForward = true;
		controls.blockLeft = true;
	} 
}

function detectBR(){
	if(detectCollisionUsingVector(1, 0, 1)){
		controls.blockBackward = true;
		controls.blockRight = true;
	}
}

function detectBL(){
	if(detectCollisionUsingVector(-1, 0, 1)){
		controls.blockBackward = true;
		controls.blockLeft = true;
	} 
}

// Detect collsion using a vector
function detectCollisionUsingVector(x, y, z){
	// Create Vector in the direction of the movement
	var cameraDirection = new THREE.Vector3( x, y, z );
	cameraDirection.applyQuaternion( camera.quaternion );
	
	var rayCaster = new THREE.Raycaster(camera.position, cameraDirection);    
	var intersects = rayCaster.intersectObject(model, true);   
	return (intersects.length > 0 && intersects[0].distance < 25);
}

// --------------------------------------------------------------------

// -------------------- EDITMODE: Add marker boxes --------------------

// Get coordinates to add marker
function setBoxOnUserClick(){
	// Check if user has clicked - keypress function
	if (!clickInfo.userHasClicked) 
		return;
	
	// Reset click if user clicked
	clickInfo.userHasClicked = false;
	
	// Shoot ray from center of screen to the mouse position
	var mouse = new THREE.Vector2();
	mouse.x = ( clickInfo.x / windowWidth ) * 2 - 1;
	mouse.y = -( clickInfo.y / windowHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	
	// If Ray intersects the 3D Model show Marker Dialog
	var intersects = raycaster.intersectObject(model, true);
	if (intersects.length > 0) 
		showAddMarkerDialog(intersects[0].point);
}

// Show marker in markers list
function updateMarkerList(){
	var markerListContent = "";
	markers.forEach(function(marker){
		markerListContent += "<div class='marker-list-entry'>" +
			"<p>" + marker.name + "</p>" +
			"<div onclick='deleteMarkerFromModel(" + marker.id + ");' >" +
				"<img src='assets/delete.png'/>" +
			"</div>" + 
		"</div>"
	});
  
	$(markerListContainerId).empty();
	$(markerListContainerId).html(markerListContent);
}

// Show marker dialog
function showAddMarkerDialog(point){
	// Show bootbox dialog to name the marker
	bootbox.prompt("Bitte geben Sie dem Marker einen Namen", function(result) {    
		if (result === null || result.length == 0) {    
			return;                                        
		} else {      
			addMarkerToModel(point, result);               
		}
	});
}

// Add marker to scene
function addMarkerToModel(point, name){
	// Create new Sphere at x,y,z position
	var marker = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	marker.position.x = point.x;
	marker.position.y = point.y;
	marker.position.z = point.z;
	marker.id = markers.length + 1;
	marker.name = name;
	
	// Write marker to file
	markers.push(marker);
	saveMarkersToFile(marker);
		
	// Update marker list
	updateMarkerList();
		
	// Add marker mesh to scene
	scene.add(marker);
}

// Remove marker from scene
function deleteMarkerFromModel(id){
	// Get marker to delete
	var markersToKeep = [];
	
	markers.forEach(function(marker){
		if(marker.id != id){
			markersToKeep.push(marker);
		} else {
			// Remove marker from scene
			scene.remove(marker);
		}
	});
	
	markers = markersToKeep;
	
	// Write markers to file
	saveMarkersToFile();
	
	// Update markers list
	updateMarkerList();
}


// Write marker to the file
function saveMarkersToFile(){
	// Create saveable objects
	var objectsToSave = [];
	$.each(markers, function(index, value){
		objectsToSave.push({name: value.name, position: value.position});
	});
	
	// Serialize Array to JSON
	var serializedMarkers = JSON.stringify(objectsToSave);
	
	// Start ajax request which calls php filewriter function (Javascript can't access filesystem)
	$.ajax({
		url: "scripts/php/fwrite.php",
		data: { obj: serializedMarkers },
		dataType: "json",
		cache: false,
		async: true,
		type: 'post',
		timeout : 5000,
	});
}

// --------------------------------------------------------------------