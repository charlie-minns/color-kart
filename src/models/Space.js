import { Player } from 'models';
import { Road } from 'models';

class Space {
  constructor() {
    this._player = new Player();
    this._road = new Road();
  }
}

export default Space;
