// section2.js
import * as THREE from 'three';
import { model, mainCameraPosition } from './main3.js';

const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
camera2.position.copy(mainCameraPosition); // Set camera position from Section 1

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
for(let i=0;i<6;i++)
  materialArray[i].side=THREE.BackSide;
let skyboxGeo=new THREE.BoxGeometry(10000,10000,10000);
let skybox=new THREE.Mesh(skyboxGeo,materialArray);
scene2.add(skybox);
let section2Model;

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
   

    if (section2Model) {
      scene2.remove(section2Model);
    }

    scene2.add(clonedPart);
    section2Model = clonedPart;

    const boundingBox = new THREE.Box3().setFromObject(clonedPart);
    const center = boundingBox.getCenter(new THREE.Vector3());

    camera2.position.copy(mainCameraPosition);
   

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 1).normalize();

    scene2.add(ambientLight);
    scene2.add(directionalLight);

    section2Renderer.render(scene2, camera2);
  }
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

section2RendererContainer.addEventListener('drop', handleSection2Drop);
