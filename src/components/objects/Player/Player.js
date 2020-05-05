import { Vector3, Group } from 'three';
import { Controller } from 'controllers';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MODEL from '../Flower/flower.gltf';

class Player extends Group {
  constructor(parent, camera) {
    super();

    this.name = 'player-1';
    this.speed = 0;         // current speed
    this.topSpeed = 10;     // how fast the player can go
    this.mass = 1;          // weight of the kart
    this.steering = 0.1;    // how efficient steering of kart is (in radians)
    this.netForce = new Vector3(0, 0, 0);
    this.position.set(1.4, 0, 0);         // default start position is (0, 0, 0) because of Group
    this.previous = new Vector3(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.controller = new Controller(this);
    this.keys = {};         // keys that are pressed

    // Load object
    const loader = new GLTFLoader();

    loader.load(MODEL, (gltf) => {
        this.add(gltf.scene);
    });

    // Set the camera
    camera.position.set(5, 5, 5);
    camera.lookAt(this.position);
    this.add(camera);

    parent.addToUpdateList(this);
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  // use verlet integration to update position depending on forces acting on kart
  integrate(deltaT) {
    const DAMPING = 0.03;

    // update previous position
    var pos = this.position.clone();
    var previous = this.previous;
    this.previous = pos;

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
  }
}

export default Player;
