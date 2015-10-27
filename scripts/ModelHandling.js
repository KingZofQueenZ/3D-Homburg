var controls;
var scene;
var camera; 
var renderer;
var clock;

function createBaseScene() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
  camera.position.set(-800,700,1300);
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
function loadColladaModel(spinnerClass){
  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load( 'model.dae', function ( collada ) {
    var dae = collada.scene;
    
    dae.traverse(function(child){
      if (child instanceof THREE.Mesh){        
        child.material.side = THREE.DoubleSide;        
      }        
    });          
    
    
    var skin = collada.skins[ 0 ];
    dae.position.set(0,0,0);
    dae.scale.set(1.5,1.5,1.5);
    scene.add(dae);
    
    animate();
    $(spinnerClass).hide();
  });
}

// Set orbit contorls
function setOrbitControls(){  
  camera.position.set(-800,700,1300);
  camera.lookAt(new THREE.Vector3(1, 1, 1));
  
  if(controls != undefined)
    controls.dispose();
    
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI/2;
  controls.maxDistance = 2500;
}

function setFPVControls(){
  camera.position.set(-800,700,1300);
  camera.lookAt(new THREE.Vector3(1, 1, 1));
  
  if(controls != undefined)
    controls.dispose();
    
  controls = new THREE.FirstPersonControls(camera);
  controls.lookSpeed = 0.12;
  controls.movementSpeed = 250;
  controls.noFly = true;
  controls.flightModeWithClick = true;
  controls.lookVertical = true;
  controls.constrainVertical = false;
  controls.verticalMin = 1.0;
  controls.verticalMax = 2.0;
  controls.lon = 300;
  controls.lat = -20;
}

// Animate scene
function animate() {
  var delta = clock.getDelta();
  renderer.clear();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update(delta);
}