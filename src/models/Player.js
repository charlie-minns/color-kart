import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';

class Player {
  constructor() {
    this._id = 'player-1';
    this._speed = 1;
    this._acceleration = 0;
    this._travelledDistance = 0;
    this._coordinates = new Vector3(0, 0, 0);
  }

  set speed(speed) {
    this._speed = speed; 
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
}

export default Player;
