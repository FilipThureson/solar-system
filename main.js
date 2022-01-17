import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { Vector3 } from 'three';


const scene = new THREE.Scene();
const G = 0.01;
var dir = new THREE.Vector3();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#bg')
});

const sunTexture = new THREE.TextureLoader().load('Solarsystemscope_texture_2k_sun.jpg');
const earthTexture = new THREE.TextureLoader().load('earth.jpg');


renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setY(500);
camera.rotateY(Math.PI);
const sun = new Body(1000, sunTexture, {x: 0, y: 0, z: 0}, {x:0, z:0, y:0}, 25,);
const planet = new Body(50, earthTexture, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 300},5);
const planet2 = new Body(50, earthTexture, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 100},5);
const planet3 = new Body(50, earthTexture, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 500},5);
const planet4 = new Body(50, earthTexture, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 800},5);


//const gridHelper = new THREE.GridHelper(1000,500)
//scene.add(gridHelper)

scene.add(sun.body);
scene.add(planet.body);
scene.add(planet2.body);
scene.add(planet3.body);
scene.add(planet4.body);




const arrowHelper = new THREE.ArrowHelper(sun.body.position, planet.body.position , 100, 0xffff00);
console.log(arrowHelper);
//scene.add(arrowHelper);

const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0xffffff);

pointLight.position.set(0,0,0);

scene.add(pointLight, ambientLight);


const controls = new OrbitControls(camera, renderer.domElement);


var t = 0; 
function animate(){
  requestAnimationFrame( animate );

  sun.body.rotation.y += G;
  planet.body.rotation.y += G*2;
  //planet.body.position.x += 0.05;

  planet.update();
  planet2.update();
  planet3.update();
  planet4.update();

  sun.attract(planet);
  sun.attract(planet2);
  sun.attract(planet3);
  sun.attract(planet4);


  renderer.render(scene, camera);
}

function Body(_mass, _color, _vel, _pos, _r){

  this.mass = _mass;
  this.color = _color;
  this.vel = _vel;

  if(_pos.x != 0){
    this.vel.z = Math.sqrt((G*1000)/_pos.x);
  }
  if(_pos.z != 0){
    this.vel.x = Math.sqrt((G*1000)/_pos.z);
  }



  let geometry = new THREE.SphereGeometry(_r);
  let material = new THREE.MeshStandardMaterial({map: _color});

  this.body = new THREE.Mesh( geometry, material);
  this.body.position.x = _pos.x;
  this.body.position.z = _pos.z;
  this.body.position.y = _pos.y;



  this.update = () => {

    this.body.position.x += this.vel.x
    this.body.position.y += this.vel.y
    this.body.position.z += this.vel.z

    //console.log(this.vel);

  }

  this.test = (f)=>{

    //console.log(f);
    
    this.vel.x -= f.x / this.mass;
    this.vel.z -= f.z / this.mass;
  }

  this.attract = (child)=>{
    let parentV = this.body.position;
    let childV = child.body.position;
    let r = new Vector3();

    r.subVectors(childV, parentV);
    //console.log(r.length());
    dir.subVectors(parentV, childV );
    dir.setLength((G * this.mass * child.mass) / (r.length() * r.length()));

    

    arrowHelper.setDirection(dir);
    arrowHelper.position.set(childV.x, childV.y, childV.z);
    arrowHelper.setLength(dir.length() * 10000 );

    let vinkel = Math.atan2(child.body.position.z , child.body.position.x);

    console.log(vinkel * (180/Math.PI));
    
    let f = new Vector3(dir.length()*Math.cos(vinkel), 0, (dir.length()*Math.sin(vinkel)));
    console.log(f);
    
    child.test(f);
  }

  return this;
}


animate();
