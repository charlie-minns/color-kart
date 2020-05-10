import * as Dat from 'dat.gui';
import { Scene, CubeTextureLoader, Vector3, Raycaster } from 'three';
import { Road, Player, Lap } from 'objects';
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
        const p1 = road.start.position.clone();
        const p2 = road.start.position.clone();
        p1.x -= 5;
        p1.y += 0.1;
        p1.z += 5;
        p2.x += 5;
        p2.y += 0.1;
        p2.z += 2.5;

        // Create Players
        const player1 = new Player(this, camera1, "player1", p1, road);
        const player2 = new Player(this, camera2, "player2", p2, road);
        this.players = [player1, player2];
        this.collideableObjects = [this.walls];

        // Create the lap counters for the players
        this.createLapCounter(player1);
        this.createLapCounter(player2);
        this.nlaps = 5;

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
          player.roadBounce(collisions[0].face.normal.clone(), timeStamp);
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

    // Initialize the Lap Counter for the player
    createLapCounter(player) {
      // Create the HTML div
      this.element = document.createElement("DIV");
      //this.element.innerText = "Lap: " + player.lap + "/" + this.nlaps;
      document.body.appendChild(this.element);

      // CSS Styling
      this.element.style.color = "hotpink";
      this.element.style.position = "fixed";
      this.element.style.top = "2%";
      if (player.name === "player1") this.element.style.left = "2%";
      else this.element.style.left = "52%";
      this.element.style.fontSize = "xx-large";
      this.element.style.fontFamily = "fantasy";
    }

    // End the game- player won the game
    endGame(winner) {
      var name;
      if (winner.name == "player1") name = document.getElementById("name1").value;
      else name = document.getElementById("name2").value;
      if (name == "") name = winner.name;

      console.log(name + " has won!");
      // can we somehow call 'app.main()' to restart? Add a button to trigger?
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

        // Check whether a player has finished, pass the winner
        if (this.players[0].lap == this.nlaps+1) this.endGame(this.players[0]);
        if (this.players[1].lap == this.nlaps+1) this.endGame(this.players[1]);


        // Update the lap counter for each player
        document.body.getElementsByTagName("div")[0].innerText = "Lap: " + this.players[0].lap + "/" + this.nlaps;
        document.body.getElementsByTagName("div")[1].innerText = "Lap: " + this.players[1].lap + "/" + this.nlaps;
    }
}

export default SeedScene;
