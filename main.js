import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { IntType, Vector3 } from 'three';


const scene = new THREE.Scene();
let G = 5;
let numOfPlanets = 100;
var dir = new THREE.Vector3();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#bg')
});

renderer.render(scene, camera);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setY(500);
camera.rotateY(Math.PI);

document.querySelector('#sim').addEventListener('click',function(){
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
  numOfPlanets = document.querySelector('#nOP').value;
  run();
});



function run(){
  document.querySelector('#planetsList').innerHTML = "";
  const sunTexture = new THREE.TextureLoader().load('Solarsystemscope_texture_2k_sun.jpg');
  const earthTexture = new THREE.TextureLoader().load('earth.jpg');

  const sun = new Body(1000, sunTexture, {x: 0, y: 0, z: 0}, {x:0, z:0, y:0}, 25,);

  //const gridHelper = new THREE.GridHelper(1000,500)
  //scene.add(gridHelper)
  var planets = [];
  scene.add(sun.body);

  for(let i = 0; i < numOfPlanets; i++){
    planets.push( new Body((Math.random()*40)+10, earthTexture, {x: 0, y: 0, z: 0}, {x: 0, y: Math.random()*50 + 10, z: (Math.random()*1000) + 100}, (Math.random()*10)+10) );
    planets[i].body.name = ''+ i;
  }

  for(let i = 0; i < planets.length; i++){
    scene.add(planets[i].body);
    document.querySelector('#planetsList').innerHTML += `
    <div class="listObj" id="${i}div">
      ${planets[i].body.id}
      <p id="${i}" class="rmvBtn">X</p>
    </div>
    `;
  }


  const pointLight = new THREE.PointLight(0xffffff);
  const ambientLight = new THREE.AmbientLight(0xffffff);

  pointLight.position.set(0,0,0);

  scene.add(pointLight, ambientLight);


  const controls = new OrbitControls(camera, renderer.domElement);


  var t = 0; 
  function animate(){
    requestAnimationFrame( animate );

    sun.body.rotation.y += G;


    for(let i = 0; i < planets.length; i++){

      planets[i].body.rotation.y += G*2;
      planets[i].update();
      sun.attract(planets[i]);
      if(i != 0){
        planets[i].attract(planets[i-1]);
      }
    }

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
  /*
    let orbitG = new THREE.TorusGeometry(_pos.z, 1, 16, 650)
    let orbitM = new THREE.MeshStandardMaterial({color: 0xffffff});
    let orbit = new THREE.Mesh( orbitG, orbitM);
    scene.add(orbit);
    orbit.rotateX(300);
  */
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
      
      this.vel.x -= f.x / this.mass;
      this.vel.z -= f.z / this.mass;
      this.vel.y -= f.y / this.mass;

    }

    this.attract = (child)=>{
      let parentV = this.body.position;
      let childV = child.body.position;
      let r = new Vector3();

      r.subVectors(childV, parentV);
      //console.log(r.length());
      dir.subVectors(parentV, childV );
      dir.setLength((G * this.mass * child.mass) / (r.length() * r.length()));

      



      let vinkel = Math.atan2(child.body.position.z , child.body.position.x);

      let vinkelY = Math.asin((child.body.position.y/r.length()));

      
      let f = new Vector3(dir.length()*Math.cos(vinkel), dir.length()*Math.sin(vinkelY) , (dir.length()*Math.sin(vinkel)));
      child.test(f);
    }

    return this;
  }


  animate();
}

$(document.body).on('click', '.rmvBtn' ,function(e){
  console.log(e.target.id);
  let object = scene.getObjectByName(e.target.id)
  scene.remove(object);
  console.log(object);
  document.getElementById(e.target.id + 'div').remove();
});