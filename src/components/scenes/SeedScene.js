import * as Dat from 'dat.gui';
import { Scene, Color, CubeTextureLoader, Vector3, Raycaster } from 'three';
import { Flower, Road, Player } from 'objects';
import { BasicLights } from 'lights';
import MAT from './galaxy.jpg';

class SeedScene extends Scene {
    constructor(camera, camera2) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: [],
        };

        // Create background skybox
        const cubeLoader = new CubeTextureLoader();
        const texture = cubeLoader.load([MAT, MAT, MAT, MAT, MAT, MAT]);
        this.background = texture;

        // Create meshes to scene
        const lights = new BasicLights();
        var p1 = new Vector3(1.5, 0.01, 1);
        var p2 = new Vector3(2, 0.01, 1);
        const player = new Player(this, camera, "player1", p1);
        const player2 = new Player(this, camera2, "player2", p2);
        const road = new Road(this);
        this.road = road;
        this.players = [player, player2];
        this.collideableObjects = [];

        // add meshes to scene
        this.add(lights, road, player, player2, player.box, player2.box);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // withinRoad
    checkRoad(timeStamp, player) {
      const EPS = 2;
      var roadParams = this.road.geometry.parameters;
      var iR = roadParams.innerRadius;
      var oR = roadParams.outerRadius;
      var pos = player.position;
      var r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.z, 2));
      if (r - iR < EPS || oR - r < EPS) {
        player.bounce(undefined);
      }
    }

    // check for collisions between each player and collidable objects
    // https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html
    checkCollisions(player) {
      var pos = player.position.clone();
      var box = player.box;

    	for (var i = 0; i < box.geometry.vertices.length; i++) {
    		var v = box.geometry.vertices[i].clone();
    		var gv = v.applyMatrix4(box.matrix);
    		var dv = gv.sub(box.position);

    		var ray = new Raycaster(pos, dv.clone().normalize() );
    		var collisions = ray.intersectObjects(this.collideableObjects);
    		if (collisions.length > 0 && collisions[0].distance < dv.length()) {
          console.log("hit");
        }
    	}
    }

    // check for collisions between players
    checkPlayer(player1, player2) {
      var pos = player1.position.clone();
      var box = player1.box;

    	for (var i = 0; i < box.geometry.vertices.length; i++) {
    		var v = box.geometry.vertices[i].clone();
    		var gv = v.applyMatrix4(box.matrix);
    		var dv = gv.sub(box.position);

    		var ray = new Raycaster(pos, dv.clone().normalize() );
    		var collisions = ray.intersectObject(player2.box);
    		if (collisions.length > 0 && collisions[0].distance < dv.length()) {
          player1.bounce(collisions[0].face.normal);
          player2.bounce(collisions[0].face.normal);
        }
    	}
    }

    // update scene
    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        // checking for collisions
        for (var player of this.players) {
          // check player is within road
          if (timeStamp > 3000) this.checkRoad(timeStamp, player);

          // check for collisions
          if (timeStamp > 3000) this.checkCollisions(player);
        }

        // checking for collisions between players
        if (timeStamp > 3000) this.checkPlayer(this.players[0], this.players[1]);
    }
}

export default SeedScene;
