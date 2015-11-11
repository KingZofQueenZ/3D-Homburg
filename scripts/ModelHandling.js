var BASE_CAM_POSITION = [-800, 700, 1300];
var CAM_ORBIT = 0;
var CAM_FPV = 1;
var MODEL_WIDTH = 1478;
var MAX_CAM_HEIGHT = 2550;
var MIN_MAP_WIDTH = 300;
var MAP_WIDTH_DELTA = 700;
var mapWidth;
var mapHeight;
var mapModelWidth;
var baseMarginX;
var baseMarginY;
var mapPixelFactor;

var controls;
var currentControl;
var orbitCam;
var fpvCam;
var scene;
var camera; 
var renderer;
var clock;
var daeModel;

function createBaseScene() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(windowWidth, windowHeight);
  document.body.appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 10000);
  camera.position.set(BASE_CAM_POSITION[0],BASE_CAM_POSITION[1],BASE_CAM_POSITION[2]);
  fpvCam = [camera.position.x, camera.position.y, camera.position.z];
  orbitCam = [camera.position.x, camera.position.y, camera.position.z];
  camera.lookAt(new THREE.Vector3(1, 1, 1));
  scene.add(camera);
  
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });
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

// Add three point light to the scene
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
function loadColladaModel(spinnerClass, overlayClass){
  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load( 'assets/model.dae', function ( collada ) {
    daeModel = collada.scene;
    
    daeModel.traverse(function(child){
      if (child instanceof THREE.Mesh){        
        child.material.side = THREE.DoubleSide;        
      }        
    });          
    
    
    var skin = collada.skins[ 0 ];
    daeModel.position.set(0,0,0);
    daeModel.scale.set(1.5,1.5,1.5);
    scene.add(daeModel);
    
    var box = new THREE.Box3().setFromObject(daeModel);
    console.log(box.min, box.max, box.size());
    
    animate();
    $(spinnerClass).hide();
    $(overlayClass).hide();
  });
}

// Set orbit contorls
function setOrbitControls(restoreCam){  
  if(restoreCam)
    restoreOrbitCam();
  
  if(controls != undefined)
    controls.dispose();
    
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI/2;
  controls.maxDistance = 2500;
  
  currentControl = CAM_ORBIT;
}

function restoreOrbitCam(){
  fpvCam = [camera.position.x, camera.position.y, camera.position.z];
  camera.position.set(orbitCam[0],orbitCam[1],orbitCam[2]);
  camera.lookAt(new THREE.Vector3(1, 1, 1));  
}

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

function restoreFPVCam(){
  orbitCam = [camera.position.x, camera.position.y, camera.position.z];
  camera.position.set(fpvCam[0],fpvCam[1],fpvCam[2]);
  camera.lookAt(new THREE.Vector3(1, 1, 1));  
}

function resetCameraPositionOnModel(){
  camera.position.set(BASE_CAM_POSITION[0],BASE_CAM_POSITION[1],BASE_CAM_POSITION[2]);
  camera.lookAt(new THREE.Vector3(1, 1, 1));  
  
  if(currentControl == CAM_ORBIT){
    setOrbitControls(false);    
  } else if(currentControl == CAM_FPV){
    setFPVControls(false);
  }    
}

function calculateMapValues(width){
  mapWidth = width;
  mapHeight = mapWidth / 1.846;
  mapModelWidth = mapWidth / 1.52;
  baseMarginX = -(mapWidth / 2 - 125);
  baseMarginY = -(mapHeight / 2 - 125); 
  mapPixelFactor = mapModelWidth / MODEL_WIDTH;
}

// Animate scene
function animate() {
  updateMap();
  detectCollision();

  renderer.clear();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update(clock.getDelta());
}

function updateMap(){
  var width = MIN_MAP_WIDTH  + MAP_WIDTH_DELTA - (MAP_WIDTH_DELTA / MAX_CAM_HEIGHT * camera.position.y);
  calculateMapValues(width);
  
  $('#map').width(mapWidth);
  $('#map').height(mapHeight);
  
  var marginX = -(camera.position.x * mapPixelFactor) + baseMarginX;
  var marginY = -(camera.position.z * mapPixelFactor) + baseMarginY;
  var marginXFull = -(camera.position.x * mapPixelFactor) +  mapWidth / 2;
  var marginYFull = -(camera.position.z * mapPixelFactor) + mapHeight / 2;
  
  if(marginXFull > mapWidth - 18){
    marginXFull = mapWidth - 18;
  } else if(marginXFull < 0){
    marginXFull = 0;
  }
  
  if(marginYFull > mapHeight - 18){
    marginYFull = mapHeight -18;
  } else if(marginYFull < 0){
    marginYFull = 0;
  }
  
  $('#map').css('margin-left', marginX + 'px');
  $('#map').css('margin-top', marginY + 'px');
  $('#full-map-point').css('margin-right', marginXFull + 'px');
  $('#full-map-point').css('margin-bottom',  marginYFull + 'px');
  
  console.log(marginX + " / " + marginY);
}

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

function resetBlockings(){
    controls.blockForward = false;
    controls.blockBackward = false;
    controls.blockRight = false;
    controls.blockLeft = false;
}

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

function detectCollisionUsingVector(x, y, z){
  var cameraDirection = new THREE.Vector3( x, y, z );
  cameraDirection.applyQuaternion( camera.quaternion );
  
  var rayCaster = new THREE.Raycaster(camera.position, cameraDirection);    
  var intersects = rayCaster.intersectObject(daeModel, true);  
  return (intersects.length > 0 && intersects[0].distance < 25);
}
