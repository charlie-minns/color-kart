import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Road, Player } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: [],
        };

        // Set background to a nice color
        // this.background = new Color(0x7ec0ee);
        this.background = new Color(0x2d2c2e);

        // Create meshes to scene
        const lights = new BasicLights();
        const player = new Player(this, camera);
        const road = new Road(this);
        this.road = road;
        this.player = player;

        // add meshes to scene
        this.add(lights, road, player);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // withinRoad
    checkRoad(timeStamp) {
      var roadParams = this.road.geometry.parameters;
      var iR = roadParams.innerRadius;
      var oR = roadParams.outerRadius;
      var pos = this.player.position;
      var r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.z, 2));
      if ((r < iR || r > oR) && timeStamp > 3000) {
        var prev = this.player.previous;
        this.player.position.set(prev.x, prev.y, prev.z);
      }
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        // check player is within road, if not set to previous player position
        this.checkRoad(timeStamp);
    }
}

export default SeedScene;
