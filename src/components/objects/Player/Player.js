import { Vector3, Face3, Group, CubeGeometry, Mesh, MeshBasicMaterial, Vector4, Euler } from 'three';
import { Controller } from 'controllers';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MARIO from './Red Kart.glb';
import LUIGI from './Green Kart.glb';



class Player extends Group {
  constructor(parent, camera, name, pos) {
    super();

    this.name = name;
    this.speed = 0;         // current speed
    this.topSpeed = 10;     // how fast the player can go
    this.mass = 1;          // weight of the kart
    this.steering = 0.03;   // how efficient steering of kart is (in radians)
    this.netForce = new Vector3(0, 0, 0);
    this.position.set(pos.x, pos.y, pos.z);    // default start position is (0, 0, 0) because of Group
    this.previous = new Vector3(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.previousRotation = new Euler(0, 0, 0);
    this.controller = new Controller(this);
    this.keys = {};         // keys that are pressed

    // cube around kart to detect collisions
    var cube = new CubeGeometry(1.5, 1, 3);
    var wireMaterial = new MeshBasicMaterial({color: 0xff0000, transparent:true, opacity:0.0});
    var box = new Mesh(cube, wireMaterial);
	  box.position.set(pos.x, pos.y+0.25, pos.z-0.5);
    box.rotation.set(0, 0, 0);
    this.box = box;

    // Determine which object to load
    let model;
    if (this.name === 'player1') {
      model = MARIO;
    } else {
      model = LUIGI;
    }

    // Load object
    const loader = new GLTFLoader();
    loader.load(model, (gltf) => {
      gltf.scene.rotateY(Math.PI); // Roate to correct orientation
      this.add(gltf.scene);
    });

    // Set the camera
    camera.position.set(this.position.x, this.position.y + 4, this.position.z + 9);
    camera.lookAt(this.position);
    this.add(camera);

    parent.addToUpdateList(this);
  }

  // updates the bounding box depending on the players position
  updateBox() {
    var pos = this.position;
    var r = this.rotation;
    this.box.position.set(pos.x, pos.y+0.25, pos.z-0.5);
    this.box.rotation.set(r.x, r.y, r.z);
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  // use verlet integration to update position depending on forces acting on kart
  integrate(deltaT) {
    const DAMPING = 0.04;

    // update previous position
    var pos = this.position.clone();
    var previous = this.previous;
    this.previous = pos;
    this.previousRotation = this.rotation;

    // update new position
    var v = pos.clone().sub(previous).divideScalar(deltaT);
    this.setSpeed(v.length());
    var vdt = v.multiplyScalar(deltaT);
    var a = this.netForce.clone().divideScalar(this.mass);
    var step = vdt.multiplyScalar(1-DAMPING).add(a.multiplyScalar(deltaT*deltaT));
    var move = new TWEEN.Tween(this.position).to(this.position.add(step), 5);
    move.start();

    // reset the netforce
    this.netForce = new Vector3(0, 0, 0);
    // ----------- STUDENT CODE END ------------
  }

  // adds a force f to the player
  addForce(f) {
    this.netForce.add(f);
  }

  // bounce player after colliding with something
  // bounce away from collided face normal if given
  bounce(normal, timeStamp) {
    var prev = this.previous;
    this.position.set(prev.x, prev.y, prev.z);
    normal.normalize();
    normal.multiplyScalar(5);
    normal.divideScalar(this.mass);
    this.addForce(normal);
    this.update(timeStamp);
  }

  // apply force to player to move in direction it is facing
  moveForward() {
    var theta = this.rotation.y;
    var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    this.addForce(f.negate());
  }

  // apply force to player to move in the opposite direction that it is facing
  moveBackward() {
    var theta = this.rotation.y;
    var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    this.addForce(f);
  }

  // move player direction left
  steerLeft() {
    this.rotation.y += this.steering;
  }

  // move player direction right
  steerRight() {
    this.rotation.y -= this.steering;
  }

  // update the players attributes
  update(timeStamp) {
    this.controller.apply();

    var deltaT = timeStamp % 100;
    // not really sure how to use timeStamp to set deltaT
    this.integrate(deltaT/500);
    TWEEN.update();

    // update position of bounding box
    this.updateBox();
  }
}

export default Player;
