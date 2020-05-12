import * as Dat from 'dat.gui';
import { Scene, CubeTextureLoader, Vector3, Raycaster, ConeGeometry, MeshBasicMaterial, Mesh, MeshNormalMaterial } from 'three';
import { Road, Player, Lap, Powerup, Overhead, Obstacles } from 'objects';
import { BasicLights } from 'lights';
import MAT from './galaxy.jpg';

class RacingScene extends Scene {
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

        // Add power up boxes to scene
        const pu1 = new Vector3(p1.x, p1.y + 1, p1.z - 7);
        const pu2 = new Vector3(p2.x, p2.y + 1, p2.z - 5);
        const powerup1 = new Powerup(this, "pu1", pu1);
        const powerup2 = new Powerup(this, "pu2", pu2);
        this.powerups = [powerup1, powerup2];
        this.powerUpMeshes = [powerup1.mesh, powerup2.mesh];

        // Add obstacles to scene
        const obstacles = new Obstacles(this);
        this.obstacleMeshes = [obstacles.mesh1, obstacles.mesh2, obstacles.mesh3];

        // Create the lap counters for the players
        this.createLapCounter(player1);
        this.createLapCounter(player2);
        this.nlaps = 5;

        // Create powerup displays for the players
        this.createPowerupDisplay(player1);
        this.createPowerupDisplay(player2);

        // add meshes to scene
        this.add(lights, powerup1);

        // Game does not start off as ended
        this.gameEnded = false;

        // Timer for game start
        this.timer = 0;
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

        // check for collisions with scene objects
    		var collisions = ray.intersectObjects(this.collideableObjects);
    		if (collisions.length > 0 && collisions[0].distance < dv.length()) {
          if (collisions[0].object.name == "spike") {
            if (!collisions[0].object.hit) player.spin = true;
            collisions[0].object.hit = true;
            this.remove(collisions[0].object);
          }
          else player.roadBounce(timeStamp);
        }

        // check for collisions with powerup boxes
        var boxCollisions = ray.intersectObjects(this.powerUpMeshes);
        if (boxCollisions.length > 0 && boxCollisions[0].distance < dv.length()) {
          var name = boxCollisions[0].object.name;
          if (name == "pu1") this.powerups[0].generatePowerUp(player);
          if (name == "pu2") this.powerups[1].generatePowerUp(player);
        }

        // check for collisions with obstacles
        var obstacleCollisions = ray.intersectObjects(this.obstacleMeshes);
        if (obstacleCollisions.length > 0 && obstacleCollisions[0].distance < dv.length()) {
          var theta = player.rotation.y;
          var norm = new Vector3(Math.sin(theta), 0, Math.cos(theta));
          player.bounce(norm.clone(), timeStamp);
        }
    	}
    }

    // Check for collisions between players
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
          var theta = player2.rotation.y;
          var norm = new Vector3(Math.sin(theta), 0, Math.cos(theta));
          player2.bounce(norm.clone(), timeStamp);
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

    // Initialize the power up display
    createPowerupDisplay(player) {
      // Create the HTML div
      this.element = document.createElement("DIV");
      document.body.appendChild(this.element);

      // CSS Styling
      this.element.style.color = "hotpink";
      this.element.style.position = "fixed";
      this.element.style.top = "8%";
      if (player.name === "player1") this.element.style.left = "2%";
      else this.element.style.left = "52%";
      this.element.style.fontSize = "xx-large";
      this.element.style.fontFamily = "fantasy";
    }

    // Displays the players power ups on the screen
    displayPowerup(player, power, control) {
      var ind;
      if (player.name == "player1") ind = 2;
      else ind = 3;
      if (power === undefined) document.body.getElementsByTagName("div")[ind].innerText = "";
      else document.body.getElementsByTagName("div")[ind].innerText = "Press " + control + " to use " + power;
    }

    // Add a spike trap on the road
    createSpike(pos) {
      const geometry = new ConeGeometry(0.5, 1, 32);
      const mat = new MeshNormalMaterial();
      const spike = new Mesh(geometry, mat);
      spike.name = "spike";
      this.hit = false;
      spike.position.set(pos.x, pos.y, pos.z+3);
      this.add(spike);
      this.collideableObjects.push(spike);
    }

    // End the game- player won the game
    endGame(winner) {

      // If the game already ended, don't keep creating things
      if (this.gameEnded) return;
      this.gameEnded = true;

      // Grab the canvases
      let canvases = document.body.getElementsByTagName('canvas');
      let inGame = canvases[2];
      let endGame = canvases[1];
      inGame.style.display = 'none';
      endGame.style.display = 'inline';

      // Remove the lap information and any other text
      let divs = document.body.getElementsByTagName('div');
      for (let i = 0; i < divs.length; i++) divs[i].style.display = 'none';

      // Decide the winner
      var name;
      var color;
      if (winner.name == "player1") {
        name = document.getElementById("name1").value;
        color = 'red';
      }
      else {
        name = document.getElementById("name2").value;
        color = 'green';
      }
      if (name == "") name = winner.name;

      // Display the winner
      let winnerDisplay = document.createElement("div");
      document.body.appendChild(winnerDisplay);
      winnerDisplay.style.top = "30%";
      winnerDisplay.style.left = "37%";
      winnerDisplay.style.color = color;
      winnerDisplay.style.position = "fixed";
      winnerDisplay.style.fontSize = "xxx-large";
      winnerDisplay.style.fontFamily = "fantasy";
      winnerDisplay.innerHTML = name + " wins!!";

      // Create the PLAY AGAIN button that refreshes page
      let button = document.createElement("button");
      button.innerHTML = 'PLAY AGAIN';
      button.onclick = function() {
        window.location.reload();
      };
      document.body.appendChild(button);
      button.style.color = "hotpink";
      button.style.position = "fixed";
      button.style.left = "45%";
      button.style.top = "75%";
      button.style.fontSize = "xx-large";
      button.style.fontFamily = "fantasy";
    }

    // update scene
    update(timeStamp) {
        // Wait for beeps to allow movement
        if (this.timer > 0) {
          this.timer--;
          // add countdown? timer corresponds to number opacity
          return;
        }

        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        // checking for collisions
        for (var player of this.players) {
          // check for collisions
          this.checkPlayer(this.players[0], this.players[1], timeStamp);
          this.checkPlayer(this.players[1], this.players[0], timeStamp);
          this.checkCollisions(player, timeStamp);
        }

        // Check whether a player has finished, pass the winner
        if (this.players[0].lap == this.nlaps+1) this.endGame(this.players[0]);
        if (this.players[1].lap == this.nlaps+1) this.endGame(this.players[1]);


        // Update the lap counter for each player
        document.body.getElementsByTagName("div")[0].innerText = "Lap: " + this.players[0].lap + "/" + this.nlaps;
        document.body.getElementsByTagName("div")[1].innerText = "Lap: " + this.players[1].lap + "/" + this.nlaps;
    }
}

export default RacingScene;
