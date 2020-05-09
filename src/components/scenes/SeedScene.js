import * as Dat from 'dat.gui';
import { Scene, CubeTextureLoader, Vector3, Raycaster } from 'three';
import { Road, Player } from 'objects';
import { BasicLights } from 'lights';
import MAT from './galaxy.jpg';

class SeedScene extends Scene {
    constructor(camera1, camera2) {
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

        // Create Road
        const lights = new BasicLights();
        const road = new Road(this);
        this.road = road;
        this.walls = road.walls;

        // Calculate starting positons of players
        const p1 = new Vector3(1.90, 0.01, 0.25);
        const p2 = new Vector3(2.13, 0.01, 0.2);

        // Create Players
        const player1 = new Player(this, camera1, "player1", p1);
        const player2 = new Player(this, camera2, "player2", p2);
        this.players = [player1, player2];
        this.collideableObjects = [this.walls];

        // add meshes to scene
        this.add(lights, road, player1, player2, player1.box, player2.box);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    // check for collisions between each player and collidable objects
    // https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html
    checkCollisions(player, timeStamp) {
      var pos = player.position.clone();
      var box = player.box;

    	for (var i = 0; i < box.geometry.vertices.length; i++) {
    		var v = box.geometry.vertices[i].clone();
    		var gv = v.applyMatrix4(box.matrix);
    		var dv = gv.sub(box.position);

    		var ray = new Raycaster(pos, dv.clone().normalize() );
    		var collisions = ray.intersectObjects(this.collideableObjects);
    		if (collisions.length > 0 && collisions[0].distance < dv.length()) {
          collisions[0].face.normal.y = 0;
          player.bounce(collisions[0].face.normal, timeStamp);
        }
    	}
    }

    // check for collisions between players
    checkPlayer(player1, player2, timeStamp) {
      var pos = player1.position.clone();
      var box = player1.box;

    	for (var i = 0; i < box.geometry.vertices.length; i++) {
    		var v = box.geometry.vertices[i].clone();
    		var gv = v.applyMatrix4(box.matrix);
    		var dv = gv.sub(box.position);

    		var ray = new Raycaster(pos, dv.clone().normalize() );
    		var collisions = ray.intersectObject(player2.box);
    		if (collisions.length > 0 && collisions[0].distance < dv.length()) {
          collisions[0].face.normal.y = 0;
          var norm = collisions[0].face.normal;
          player1.bounce(norm.clone(), timeStamp);
        }
    	}
    }

    // check whether the player is within the road boundaries
    isInbounds(pos) {
      const EPS = 1;
      pos.y = 0;
      if (pos.length() - this.road.innerR < EPS) return false;
      if (this.road.outerR - pos.length() < EPS) return false;
      return true;
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
          // check for collisions
          if (timeStamp > 3000) {
            this.checkPlayer(this.players[0], this.players[1], timeStamp);
            this.checkPlayer(this.players[1], this.players[0], timeStamp);
            this.checkCollisions(player, timeStamp);
          }
        }
    }
}

export default SeedScene;
