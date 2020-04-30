class Player {
  constructor() {
    this._id = 'player-1';
    this._speed = 1;
    this._acceleration = 0;
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
}

export default Player;
