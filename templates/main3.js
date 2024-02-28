import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

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
let childList;
var intersects=[];


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

class Node {
  constructor(name, position) {
      this.name = name;
      this.position = position;
      this.next = null;
  }
}

let linkedListHead ;

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

  camera.near = size /10;
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
  linkedListHead = createLinkedListFromModel(model);
  // Hide the image after loading the model
  modelImage.style.display = 'none';
  animate();
  let currentNode = linkedListHead;
while (currentNode !== null) {
    if (currentNode.name && currentNode.position) {
        console.log('Name:', currentNode.name);
        console.log('Position:', currentNode.position);
    } else {
        console.log('Invalid node:', currentNode);
    }
    currentNode = currentNode.next;
}
}

function createLinkedListFromModel(model) {
  // Head of the linked list
  let head = null;
  // Iterate through the children of the model
  model.traverse(child => {
      if (child instanceof THREE.Mesh) {
          // Create a new node for each child
          let node = new Node(child.name, child.position.clone());
          // Insert the node into the linked list
          if (head === null) {
              head = node;
          } else {
              let current = head;
              while (current.next !== null) {
                  current = current.next;
              }
              current.next = node;
          }
      }
  });

  return head;
}

function getPositionByName(linkedListHead, targetName) {
  let currentNode = linkedListHead;

  while (currentNode !== null) {
      if (currentNode.name === targetName) {
          // Found the node with the target name, return its position
          return currentNode.position;
      }

      currentNode = currentNode.next;
  }

  // If the target name is not found, return null or handle as needed
  return null;
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

  nodeName.addEventListener('mousedown', (event) => {
    handleNodeNameMouseDown(event, nodeNameContainer); 
    highlightObject(object);
  });

  // Add drag event listener to enable drag and drop
  nodeNameContainer.setAttribute('draggable', true);
  nodeNameContainer.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', nodeName.textContent);
  });
  
    renderer.domElement.addEventListener('click', () => {
      if(intersects.length>0){
      arrowIcon.textContent = childList.style.display === 'none' ? '▶' : '▼';
    }
    });
  

}

function handleNodeNameMouseDown(event, nodeNameContainer) {
  const allNodeContainers = document.querySelectorAll('.node-name-container');
  // Reset background color of all node name containers to white
  allNodeContainers.forEach(container => {
    container.style.backgroundColor = '#F5F5F5';
  });
  // Set background color of the clicked node name container to blue
  nodeNameContainer.style.backgroundColor = 'lightgray';
  const nodeName = nodeNameContainer.textContent;
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

let clickedObject;

const handleModelClick = (event) => {
  event.preventDefault();
  mouse.x = (event.offsetX  / event.target.clientWidth ) * 2 - 1;
  mouse.y = -(event.offsetY /  event.target.clientHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObject(model, true);
  console.log("intersect",intersects);
  if (intersects.length > 0) {
    console.log("Intesect object:",intersects[0].object);
    if (intersects[0].object) {
      console.log(intersects[0].object.name);
      clickedObject = intersects[0].object;
      highlightObject(clickedObject);
      hierarchyhighlight(event,clickedObject);
    }
  }
}

function hierarchyhighlight(event,object){
  const nodeName = object.name;
      childList.style.display = 'block' ; 
    // Find the corresponding node name container in the hierarchy
    const nodeContainers = document.querySelectorAll('.node-name');
    nodeContainers.forEach(nodeContainer => {
      if (nodeContainer.textContent === nodeName) {
        // Get the parent node of the node name container (the hierarchy node)
        const hierarchyNode = nodeContainer.closest('.hierarchy-node');
        if (hierarchyNode) {
          // Highlight the node name in the hierarchy
           const nodeNameContainer = hierarchyNode.querySelector('.node-name-container');
          handleNodeNameMouseDown(event, nodeNameContainer);  
        }
      }
    });
}

function cursorstyle(event){
  mouse.x = (event.offsetX  / event.target.clientWidth ) * 2 - 1;
  mouse.y = -(event.offsetY /  event.target.clientHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObject(model, true);
  if (intersects.length > 0) {
    if (intersects[0].object){
      renderer.domElement.style.cursor = " pointer ";
    }
  }
  else {
    renderer.domElement.style.cursor = " auto ";
  }
 
}

let selectedObj;
let isDragging = false;

function onMouseDown(event) {
  event.preventDefault();
  if (!isDragging) {
      handleMouseDown(event);
  }
  
}

function handleMouseDown(event) {
  mouse.x = (event.offsetX / event.target.clientWidth ) * 2 - 1;
  mouse.y = - (event.offsetY / event.target.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObject(model, true);
  if (intersects.length > 0) {
      selectedObj = intersects[0].object;
      //highlightObject(selectedObj);
      isDragging = true;
      hierarchyhighlight(event,selectedObj);
      renderer.domElement.addEventListener('mousemove', onMouseMove, false);
      controls.enableRotate = false;
  }
}

const selectedObjChangeEvent = new Event('selectedObjChange');
function onMouseMove(event) {
  event.preventDefault();
  if (selectedObj) {
      // Calculate mouse position in normalized device coordinates
    mouse.x = (event.offsetX  / event.target.clientWidth ) * 2 - 1;
    mouse.y = -(event.offsetY /  event.target.clientHeight ) * 2 + 1;
    controls.enable = false;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    selectedObj.position.copy(pos);
    const nodeName = selectedObj;
    nodeName.textContent =selectedObj.name ;
    setSelectedObj(selectedObj);
    document.dispatchEvent(selectedObjChangeEvent);
  }
}

function onMouseUp() {
  isDragging = false;
  let targetName=selectedObj.name;
  let position = getPositionByName(linkedListHead, targetName);
  selectedObj.position.copy(position);
  selectedObj=null;
  renderer.domElement.removeEventListener('mousemove', onMouseMove, false);
  controls.enableRotate = true;
}

renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('click', handleModelClick,false);
renderer.domElement.addEventListener('pointermove', cursorstyle ,false);

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

function setSelectedObj(obj) {
  selectedObj = obj;
}

export function getSelectedObj() {
  return selectedObj;
}

export { model,updateMainHierarchy,linkedListHead,getPositionByName};
