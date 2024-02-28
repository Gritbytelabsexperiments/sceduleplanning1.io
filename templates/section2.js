// section2.js
import * as THREE from 'three';
import { model,updateMainHierarchy,getSelectedObj,linkedListHead,getPositionByName } from './main3.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 1500000);
let objecttoremove;
let section2Model;
const section2Renderer = new THREE.WebGLRenderer();
section2Renderer.setSize(window.innerWidth * 0.45, window.innerHeight*0.5);
const section2RendererContainer = document.querySelector('.frame-item');
section2RendererContainer.appendChild(section2Renderer.domElement);
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
let controls=new OrbitControls(camera2,section2Renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 1).normalize();
scene2.add(ambientLight);
scene2.add(directionalLight);

function createskybox(){
const box1 = new THREE.Box3().setFromObject(model);
//const size1 = box1.getSize(new THREE.Vector3()).length();
const modelSize1 = box1.getSize(new THREE.Vector3());

const skyboxSize = Math.max(modelSize1.x, modelSize1.y, modelSize1.z) * 10;
console.log(skyboxSize);
for(let i=0;i<6;i++)
  materialArray[i].side=THREE.BackSide;
let skyboxGeo=new THREE.BoxGeometry(skyboxSize,skyboxSize,skyboxSize);
let skybox=new THREE.Mesh(skyboxGeo,materialArray);
scene2.add(skybox);
}

const hierarchyContainer = document.getElementById('hierarchy-container1');
hierarchyContainer.style.display = 'none';

window.addEventListener('resize',function(){
  var width = window.innerWidth*0.45;
  var height = window.innerHeight*0.5;
  section2Renderer.setSize(width,height) ;
  camera2.aspect = width/height;
  camera2.updateProjectionMatrix();
});

function handleSection2Drop(event) {
  event.preventDefault();
  section2RendererContainer.style.border = 'none';

  const partName = event.dataTransfer.getData('text/plain');
  const selectedPart = model.getObjectByName(partName);

  if (selectedPart) {
    const clonedPart = selectedPart.clone(true);

    clonedPart.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.visible = true;
      }
    });
    createskybox();
    controls.reset();
    controls.enableDamping=true;
    controls.screenSpacePanning = false;
    const box = new THREE.Box3().setFromObject(clonedPart);
    const box2 = new THREE.Box3().setFromObject(model);
    const size1 = box2.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    let targetName=clonedPart.name;
    let position = getPositionByName(linkedListHead, targetName);
    clonedPart.position.copy(position);
    controls.maxDistance = size1 * 4.3;
    controls.minDistance = size1;
    camera2.near = size1 / 100;
    camera2.far = size1 * 100;
    camera2.updateProjectionMatrix();
    camera2.position.copy(center);
    camera2.lookAt(center);
    camera2.updateMatrixWorld(true);
    hierarchyContainer.style.display = 'block';
    createHierarchy(clonedPart, hierarchyContainer);
    scene2.add(clonedPart);
    section2Model = clonedPart;
    console.log(camera2.position);
    //section2Renderer.render(scene2, camera2);
    objecttoremove=selectedPart;
    removeObject3D(objecttoremove);
    updateMainHierarchy();
    animate();
  }
}

//let isActionPerformed = false;
let selectedObjectArray = [];

function handleSection2Drop1(event){
  event.preventDefault();
  let selectedObj;
  const selectedObjChangeListener = () => {
    selectedObj = getSelectedObj();
    section2RendererContainer.style.border = 'none';
    const selectedPart = selectedObj;
    if (selectedPart && !selectedObjectArray.includes(selectedPart)) {
    selectedObjectArray.push(selectedPart);
    document.removeEventListener('selectedObjChange', selectedObjChangeListener);
        const clonedPart = selectedPart.clone(true);
        clonedPart.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.visible = true;
            }
        });
        createskybox();
        controls.reset();
        controls.enableDamping = true;
        controls.screenSpacePanning = false;
        //const box = new THREE.Box3().setFromObject(clonedPart);
        const box2 = new THREE.Box3().setFromObject(model);
        //const size = box.getSize(new THREE.Vector3()).length();
        const size1 = box2.getSize(new THREE.Vector3()).length();
        const center = box2.getCenter(new THREE.Vector3());
        let targetName=selectedObj.name;
        let position = getPositionByName(linkedListHead, targetName);
        clonedPart.position.copy(position);
        controls.maxDistance = size1 * 4.3;
        controls.minDistance = size1;
        camera2.near = size1 / 100;
        camera2.far = size1 * 100;
        camera2.updateProjectionMatrix();
        camera2.position.copy(center);
        camera2.lookAt(center);
        camera2.updateMatrixWorld(true);
        hierarchyContainer.style.display = 'block';
        createHierarchy(clonedPart, hierarchyContainer);
        scene2.add(clonedPart);
        section2Model = clonedPart;
        objecttoremove = selectedPart;
        removeObject3D(objecttoremove);
        updateMainHierarchy();
        animate();
    }
};
document.addEventListener('selectedObjChange', selectedObjChangeListener);
}

function createHierarchy(object, parentElement) {
  // Check if the model is loaded before creating the hierarchy
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

}
function removeObject3D(object) {
  if (!(object instanceof THREE.Object3D)) return false;
  // for better memory management and performance
  if (object.geometry) {
      object.geometry.dispose();
  }
  if (object.material) {
      if (object.material instanceof Array) {
          // for better memory management and performance
          object.material.forEach(material => material.dispose());
      } else {
          // for better memory management and performance
          object.material.dispose();
      }
  }
  if (object.parent) {
      object.parent.remove(object);
  }
  // the parent might be the scene or another Object3D, but it is sure to be removed this way
  return true;
}
function handleSection2Zoom(event) {
  const delta = event.deltaY;

  if (delta < 0) {
    // Zoom in
    camera2.position.z -= 10;
  } else {
    // Zoom out
    camera2.position.z += 10;
  }

  section2Renderer.render(scene2, camera2);
}
function handleSection2Keydown(event) {
  if (event.key === 'f' || event.key === 'F') {
    // Zoom in
    camera2.position.z -= 10;
    section2Renderer.render(scene2, camera2);
  }
}
window.addEventListener('keydown', handleSection2Keydown);
section2RendererContainer.addEventListener('wheel', handleSection2Zoom);

section2RendererContainer.addEventListener('dragover', (event) => {
  event.preventDefault();
  section2RendererContainer.style.border = '2px dashed #000';
});

section2RendererContainer.addEventListener('dragleave', () => {
  section2RendererContainer.style.border = 'none';
});

const toggleHierarchyBtn = document.getElementById('toggleHierarchyBtn1');


toggleHierarchyBtn.addEventListener('click', toggleHierarchy);

function toggleHierarchy() {
   const isHidden = hierarchyContainer.style.left === '-200px';
   hierarchyContainer.style.left = isHidden ? '10px' : '-200px';
}
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render the scene
  section2Renderer.render(scene2, camera2); 
}
section2RendererContainer.addEventListener('mouseover', handleSection2Drop1);
section2RendererContainer.addEventListener('drop', handleSection2Drop);
section2RendererContainer.addEventListener('drop', createskybox);
