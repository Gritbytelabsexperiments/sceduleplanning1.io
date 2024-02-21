import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 1500000);

camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.45, window.innerHeight * 0.5);
const rendererContainer = document.querySelector('.frame-child');
rendererContainer.appendChild(renderer.domElement);
let controls=new OrbitControls(camera,renderer.domElement);

let materialArray=[];
let texture_ft =new THREE.TextureLoader().load('Sky_01/Skybox01_Front+Z.png');
let texture_bk =new THREE.TextureLoader().load('Sky_01/Skybox01_Back-Z.png');
let texture_up =new THREE.TextureLoader().load('Sky_01/Skybox01_Up+Y.png');
let texture_dn =new THREE.TextureLoader().load('Sky_01/Skybox01_Down-Y.png');
let texture_rt =new THREE.TextureLoader().load('Sky_01/Skybox01_Right-X.png');
let texture_lf =new THREE.TextureLoader().load('Sky_01/Skybox01_Left+X.png');
materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const hierarchyContainer = document.getElementById('hierarchy-container');
hierarchyContainer.style.display = 'none'; // Initially hide the hierarchy

const dropZone = document.getElementById('drop-zone');
const modelImage = document.querySelector(' img.frame');

let modelLoaded = false; // Flag to track whether the model is loaded
let model;

window.addEventListener('resize',function(){
  var width = window.innerWidth*0.45;
  var height = window.innerHeight*0.5;
  renderer.setSize(width,height) ;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
});

function handleFileDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];

  if (file) {
    loadModel(file);
    // Hide the image when a file is dropped
    modelImage.style.display = 'none';
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0]; // Access the uploaded file
  if(file){
    loadModel(file);
    modelImage.style.display= 'none';
  }
  dropZone.style.display= 'none';
}

function loadModel(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.obj')) {
    loadOBJModel(file);
  } else if (fileName.endsWith('.fbx')) {
    loadFBXModel(file);
  } else {
    console.error('Unsupported file format');
  }
}

function loadOBJModel(file) {
  const loader = new OBJLoader();
  loader.load(
    URL.createObjectURL(file),
    (obj) => {
      handleLoadedModel(obj);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('Error loading OBJ model', error);
    }
  );
}

function loadFBXModel(file) {
  const loader = new FBXLoader();
  loader.load(
    URL.createObjectURL(file),
    (obj) => {
      handleLoadedModel(obj);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('Error loading FBX model', error);
    }
  );
}

function handleLoadedModel(obj) {
  if (!obj) {
    console.error('Error: Loaded FBX model is undefined');
    return;
  }
  if (model) {
    scene.remove(model);
  }
  model = obj;
  if (model.material) {
    model.material.visible = true;
  }
  controls.reset();
  controls.enableDamping=true;
  controls.screenSpacePanning = false;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()).length();
  const modelSize = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  model.position.x += (model.position.x - center.x);
  model.position.y += (model.position.y - center.y);
  model.position.z += (model.position.z - center.z);

  controls.maxDistance = size * 3.8;
  controls.minDistance = size;

  const skyboxSize = Math.max(modelSize.x, modelSize.y, modelSize.z) * 10;
  
  for(let i=0;i<6;i++)
    materialArray[i].side=THREE.BackSide;
  let skyboxGeo=new THREE.BoxGeometry(skyboxSize,skyboxSize,skyboxSize);
  let skybox=new THREE.Mesh(skyboxGeo,materialArray);
  scene.add(skybox);

  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();
  camera.position.copy(center);
  camera.lookAt(center);
  // Handle animations if applicable (for both OBJ and FBX)
  handleAnimations(model);
  camera.updateMatrixWorld(true);
  // Set the flag to true when the model is loaded
  modelLoaded = true;
  // Show the hierarchy after loading the model
  hierarchyContainer.style.display = 'block';
  createHierarchy(model, hierarchyContainer);
  scene.add(model);
  // Hide the image after loading the model
  modelImage.style.display = 'none';
  animate();
}

function handleAnimations(obj) {
  // Check if the model has animations
  if (obj.animations && obj.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(obj);
    const action = mixer.clipAction(obj.animations[0]); // Assuming there is only one animation
    action.play();

    // Update animations in the animate loop
    function animateAnimations() {
      mixer.update(0.0167); // Should be called with the time difference between frames
      requestAnimationFrame(animateAnimations);
    }

    animateAnimations();
  }
}

function createHierarchy(object, parentElement) {
  // Check if the model is loaded before creating the hierarchy
  if (!modelLoaded) {
    return;
  }

  const hierarchyNode = document.createElement('div');
  hierarchyNode.className = 'hierarchy-node';

  const nodeNameContainer = document.createElement('div');
  nodeNameContainer.className = 'node-name-container';
  hierarchyNode.appendChild(nodeNameContainer);

  const arrowIcon = document.createElement('span');
  arrowIcon.textContent = '▶';
  arrowIcon.className = 'arrow-icon';
  nodeNameContainer.appendChild(arrowIcon);

  const nodeName = document.createElement('span');
  nodeName.textContent = object.name || 'Object';
  nodeName.className = 'node-name';
  nodeNameContainer.appendChild(nodeName);

  let childList;

  if (object.children.length > 0) {
    childList = document.createElement('span');
    childList.className = 'child-list';
    hierarchyNode.appendChild(childList);

    arrowIcon.addEventListener('click', () => {
      childList.style.display = childList.style.display === 'none' ? 'block' : 'none';
      arrowIcon.textContent = childList.style.display === 'none' ? '▶' : '▼';
    });

    // Recursive call to create hierarchy for children
    object.children.forEach((child) => {
      createHierarchy(child, childList);
    });
  } else {
    // If there are no children, hide the arrow icon
    arrowIcon.style.display = 'none';
  }

  if (parentElement) {
    parentElement.appendChild(hierarchyNode);
  } else {
    hierarchyContainer.appendChild(hierarchyNode);
  }
  console.log('Hierarchy node created:', hierarchyNode);

  // Event listener for clicking on the hierarchy node

  nodeName.addEventListener('mousedown', (event) => {
    handleNodeNameMouseDown(event, nodeNameContainer); // Pass the nodeName directly
    highlightObject(object);
  });

  // Add drag event listener to enable drag and drop
  nodeNameContainer.setAttribute('draggable', true);
  nodeNameContainer.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', nodeName.textContent);
  });

}

function handleNodeNameMouseDown(event, nodeNameContainer) {
  const allNodeContainers = document.querySelectorAll('.node-name-container');
  // Reset background color of all node name containers to white
  allNodeContainers.forEach(container => {
    container.style.backgroundColor = 'white';
  });
  // Set background color of the clicked node name container to blue
  nodeNameContainer.style.backgroundColor = 'lightgray';
  const nodeName = event.target.textContent;
  navigator.clipboard.writeText(nodeName)
    .then(() => {
      console.log('Text copied to clipboard:', nodeName);
    })
    .catch(err => {
      console.error('Failed to copy text to clipboard:', err);
    });
}

function highlightObject(object) {
  const originalMaterial = object.material;
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  object.material = highlightMaterial;

  // Reset the material after a brief delay (e.g., 1 second)
  setTimeout(() => {
    object.material = originalMaterial;
  }, 500);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}


function handleZoom(event) {
  const delta = event.deltaY;

  if (delta < 0) {
    // Zoom in
    camera.position.z -= 10;
  } else {
    // Zoom out
    camera.position.z += 10;
  }
  console.log(camera.position);
  animate();
}



function handleup(event) {
  if (event.key === 'w' || event.key === 'W') {
    // Zoom in
    camera.position.y += 10;
    animate();
  }
}

function handledown(event) {
  if (event.key === 's' || event.key === 'S') {
    // Zoom in
    camera.position.y -= 10;
    animate();
  }
}

function handleleft(event) {
  if (event.key === 'a' || event.key === 'A') {
    // Zoom in
    camera.position.x += 10;
    animate();
  }
}
function handleright(event) {
  if (event.key === 'd' || event.key === 'D') {
    // Zoom in
    camera.position.x -= 10;
    animate();
  }
}
function handleF(event) {
  if (event.key === 'f' || event.key === 'F') {
    // Zoom in
    const pos = model.position;
    camera.lookAt(pos);
    camera.position.set( pos.x+10,  pos.y+200, pos.z+200);
    camera.updateProjectionMatrix();
  }
}

window.addEventListener('keydown',handleright);
window.addEventListener('keydown',handleleft);
window.addEventListener('keydown', handledown);
window.addEventListener('keydown', handleup);
window.addEventListener('keydown', handleF);
renderer.domElement.addEventListener('wheel', handleZoom);

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.style.display = 'flex';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.display = 'none';
});

const handleModelClick = (event) => {
  // Calculate mouse coordinates in normalized device space (-1 to +1)
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  console.log("x", mouse.x);
  // Raycast from the camera to the scene
  raycaster.setFromCamera(mouse, camera);
  // Find intersected objects
  const intersects = raycaster.intersectObject(model, true);
  console.log("intersect",intersects);

  if (intersects.length > 0) {
    // Handle the intersected object(s) as needed
    const clickedObject = intersects[0].object;
    highlightObject(clickedObject);
    console.log('Clicked on:', clickedObject.name || 'Unnamed Object');
  }
}

renderer.domElement.addEventListener('click', handleModelClick);

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileUpload);
dropZone.addEventListener('drop', handleFileDrop);

const toggleHierarchyBtn = document.getElementById('toggleHierarchyBtn');
toggleHierarchyBtn.addEventListener('click', toggleHierarchy);

function toggleHierarchy() {
   const isHidden = hierarchyContainer.style.left === '-200px';
   hierarchyContainer.style.left = isHidden ? '10px' : '-200px';
}

animate();
camera.updateWorldMatrix(true);

var saveMatrix = new THREE.Matrix4();

saveMatrix.copy(camera.matrixWorld);

function updateMainHierarchy() {
  hierarchyContainer.innerHTML = '';
  createHierarchy(model, hierarchyContainer);
}

const cameraPosition = camera.position.clone();
const cameraRotation = camera.rotation.clone();
//console.log(cameraPosition);
export { model,cameraPosition,cameraRotation,updateMainHierarchy };
