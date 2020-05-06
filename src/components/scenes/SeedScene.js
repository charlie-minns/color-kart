import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Flower, Road, Player } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor(camera, camera2) {
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
        const player = new Player(this, camera, "player1");
        const player2 = new Player(this, camera2, "player2");
        const road = new Road(this);
        this.road = road;
        this.players = [player, player2];

        // add meshes to scene
        this.add(lights, road, player, player2);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // withinRoad
    checkRoad(timeStamp, player) {
      const EPS = 1;
      var roadParams = this.road.geometry.parameters;
      var iR = roadParams.innerRadius;
      var oR = roadParams.outerRadius;
      var pos = player.position;
      var r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.z, 2));
      // could we check mesh collisions instead of positions?
      if ((r - iR < EPS || oR - r < EPS) && timeStamp > 3000) {
        var prev = player.previous;
        player.position.set(prev.x, prev.y, prev.z);

        // bounce off side of road
        /*
        var theta = this.rotation.y;
        var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
        if (r - iR < EPS) f.negate();
        this.player.addForce(f);*/
      }
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        // check player is within road, if not set to previous player position
        for (var player of this.players) {
          this.checkRoad(timeStamp, player);
        }
    }
}

export default SeedScene;
