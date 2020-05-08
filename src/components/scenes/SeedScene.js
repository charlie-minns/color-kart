import * as Dat from 'dat.gui';
import { Scene, Color, CubeTextureLoader, Vector3, Raycaster } from 'three';
import { Flower, Road, Player } from 'objects';
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
        this.innerEdge = road.innerEdge;
        this.outerEdge = road.outerEdge;

        // Calculate starting positons of players
        const roadParams = this.road.geometry.parameters;
        const iR = roadParams.innerRadius;
        const oR = roadParams.outerRadius;
        const p1 = new Vector3(1.9, 0.01, 0.05);
        const p2 = new Vector3(2.1, 0.01, 0);

        // Create Players
        const player = new Player(this, camera1, "player1", p1);
        const player2 = new Player(this, camera2, "player2", p2);
        this.players = [player, player2];
        this.collideableObjects = [this.innerEdge, this.outerEdge];

        // add meshes to scene
        this.add(lights, road, player, player2, player.box, player2.box);
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
          player2.bounce(norm.clone().negate(), timeStamp);
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
          // check for collisions
          if (timeStamp > 3000) this.checkCollisions(player, timeStamp);
        }

        // checking for collisions between players
        if (timeStamp > 3000) this.checkPlayer(this.players[0], this.players[1], timeStamp);
    }
}

export default SeedScene;
