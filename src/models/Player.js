import { Vector3 } from 'three';
import { Controller } from 'controllers'

<<<<<<< HEAD
// player object stores information about players physical attriubtes
class Player {
  constructor(parent) {

=======
class Player {
  constructor() {
>>>>>>> e7eaea3aa31908279050d6d93f85d19a47103232
    this._id = 'player-1';
    this._speed = 0;        // current speed
    this.topSpeed = 10;     // how fast the player can go
    this.mass = 1;          // weight of the kart
    this.steering = 0.1;    // how efficient steering of kart is (in radians)
    this.netForce = new Vector3(0, 0, 0);
    this._acceleration = 0;
    this._travelledDistance = 0;
    this._coordinates = new Vector3(0, 0, 0);
    this._previous = new Vector3(0, 0, 0);
    this.direction = new Vector3(0, 0, 1);
    this.controller = new Controller(this);

    parent.addToUpdateList(this);
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  getSpeed() {
    return this._speed;
  }

  setCoordinates(coord) {
    this._coordinates = coord;
  }

  getCoordinates() {
    return this._coordinates;
  }

  addDistance(newDist) {
    this.travelledDistance += newDist;
  }

  // use verlet integration to update position depending on forces acting on kart
  integrate(deltaT) {
    const DAMPING = 0.03;

    // update previous position
    var pos = this._coordinates.clone();
    var previous = this._previous;
    this._previous = pos;

    // update new position
    var v = pos.clone().sub(previous).divideScalar(deltaT);
    this.setSpeed(v.length());
    var vdt = v.multiplyScalar(deltaT);
    var a = this.netForce.clone().divideScalar(this.mass);
    this._coordinates.add(vdt.multiplyScalar(1-DAMPING)).add(a.multiplyScalar(deltaT*deltaT));

    // reset the netforce
    this.netForce = new Vector3(0, 0, 0);
    // ----------- STUDENT CODE END ------------
  }

  // adds a force f to the player
  addForce(f) {
    this.netForce.add(f);
  }

  // rotate the kart by a given angle
  rotate(theta) {
    var x = this.direction.x;
    var z = this.direction.z;
    this.direction.x = x*Math.cos(theta) + z*Math.sin(theta);
    this.direction.z = z*Math.cos(theta) - x*Math.sin(theta);
    this.direction.normalize();
  }

  // apply force to player to move in direction it is facing
  moveForward() {
    var f = this.direction.clone();
    this.addForce(f);
    console.log('forward:', this._coordinates);
  }

  // apply force to player to move in the opposite direction that it is facing
  moveBackward() {
    var f = this.direction.clone();
    this.addForce(f.negate());
    console.log('back:', this._coordinates);
  }

  // move player direction left
  steerLeft() {
    this.rotate(this.steering);
    console.log('left:', this.direction);
  }

  // move player direction right
  steerRight() {
    // change direction
    this.rotate(-this.steering);
    console.log('right:', this.direction);
  }

  // update the players attributes
  update(timeStamp) {
    this.integrate(timeStamp / 10000);
  }
}

export default Player;
