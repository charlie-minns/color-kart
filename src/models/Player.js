import { Group } from 'three';
import { Vector3 } from 'three';
import { Controller } from 'controllers'

class Player extends Group {
  constructor() {
    super();

    this._id = 'player-1';
    this._speed = 1;
    this.topSpeed = 10;
    this.mass = 1;
    this.netForce = 0;
    this._acceleration = 0;
    this._travelledDistance = 0;
    this._coordinates = new Vector3(0, 0, 0);
    this.direction = new Vector3(0, 0, 1);
    this.controller = new Controller(this);
  }

  set speed(speed) {
    this._speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  get speed() {
    return this._speed;
  }

	set acceleration(acceleration) {
    this._acceleration = acceleration; // TODO
  }

  get acceleration() {
    return this._acceleration;
  }

  set travelledDistance(dist) {
    this._travelledDistance = dist;
  }

  get travelledDistance() {
    return this._travelledDistance;
  }

  set coordinates(coord) {
    this._coordinates = coord;
  }

  get coordinates() {
    return this._coordinates;
  }

  addDistance(newDist) {
    this.travelledDistance += newDist;
  }

  // adds a force f to the player
  addForce(f) {
    this.netForce.add(f);
  }

  // move player position forward
  moveForward() {
    // S = S0 + Ut + 0.5at^2 : assume t = 1
    let speed = this.direction.clone().multiplyScalar(this._speed);
    let a = this.direction.clone().multiplyScalar(0.5*this._acceleration);
    this._coordinates.add(speed).add(a);
    console.log('forward:', this._coordinates);
  }

  // move player position backward
  moveBackward() {
    let speed = this.direction.clone().multiplyScalar(this._speed);
    let a = this.direction.clone().multiplyScalar(0.5*this._acceleration);
    this._coordinates.sub(speed).add(a);
    console.log('back:', this._coordinates);
  }

  // move player direction left
  steerLeft() {
    // change direction
    console.log('left:', this.direction);
  }

  // move player direction right
  steerRight() {
    // change direction 
    console.log('right:', this.direction);
  }
}

export default Player;
