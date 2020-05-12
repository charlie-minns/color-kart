import { Vector3, Group, CubeGeometry, Mesh, MeshBasicMaterial, Box3 } from 'three';
import { Controller } from 'controllers';
import { Missile } from 'objects';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MARIO from './Red Kart.glb';
import LUIGI from './Green Kart.glb';

class Player extends Group {
  constructor(parent, camera, name, pos, road) {
    super();

    this.scene = parent;
    this.name = name;
    this.speed = 0;           // current speed
    this.topSpeed = 2;        // how fast the player can go
    this.mass = 1;            // weight of the kart
    this.steering = 0.03;     // how efficient steering of kart is (in radians)
    this.netForce = new Vector3(0, 0, 0);
    this.reset = pos;
    this.position.set(pos.x, pos.y, pos.z);
    this.previous = pos;
    this.rotation.set(0, 0, 0);
    this.controller = new Controller(this);
    this.keys = {};           // keys that are pressed
    this.road = road;         // The road the player is racing on
    this.lap = 1;             // lap number that the player is on
    this.distInLap = 0.0;     // How far have they drove so far this lap?
    this.powerup = undefined; // The power up the player is holding
    this.zoom = false;        // player's speed increases until time is up
    this.zoomTime = 0;
    this.freeze = false;      // player can't move until time is up
    this.freezeTime = 0;
    this.zap = false;         // player's speed decreases until time is up
    this.zapTime = 0;
    this.spin = false;        // player does a 360
    this.spinOrigin = 0;
    this.reverse = false;     // player's controls reversed until time is up
    this.reverseTime = 0;
    this.missileFired = false; // missile object fired from player
    this.missile = undefined; // fire a missile towards another player

    // cube around kart to detect collisions
    var cube = new CubeGeometry(1.5, 1, 3);
    var wireMaterial = new MeshBasicMaterial({color: 0xff0000, transparent:true, opacity:0.0});
    var box = new Mesh(cube, wireMaterial);
	  box.position.set(pos.x, pos.y + 0.25, pos.z - 0.5);
    box.rotation.set(0, 0, 0);
    this.box = box;
    parent.add(box);

    // Determine which object to load
    let model;
    if (this.name === 'player1') {
      model = MARIO;
    } else {
      model = LUIGI;
    }

    // Load object
    const loader = new GLTFLoader();
    loader.load(model, (gltf) => {
      gltf.scene.rotateY(Math.PI); // Roate to correct orientation
      this.add(gltf.scene);
    });

    // Set camera
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0, 0);
    this.add(camera);

    parent.add(this);
    parent.addToUpdateList(this);
  }

  // updates the bounding box depending on the players position
  updateBox() {
    var pos = this.position;
    var r = this.rotation;
    this.box.position.set(pos.x, pos.y+0.25, pos.z-0.5);
    this.box.rotation.set(r.x, r.y, r.z);
  }

  // Updates the lap number that the player is on
  updateLap() {
    // Establish the distance threshold
    // removed 0.75 factor- smallest possible distance to complete a lap uses innerR
    let DIST_THRESHOLD = Math.PI * this.road.innerR * 2;

    // Return if player has not drove enough to get a new lap
    if (this.distInLap < DIST_THRESHOLD) return;

    // Check if player has hit the "start line" box
    // If yes, update lap count and refresh distance for next lap
    if (this.isOnStartLine()) {
      this.lap++;
      this.distInLap = 0.0;
    }
  }

  // Return true if the player is on the start line
  isOnStartLine() {
    // Establish the bounding box for the start line
    let min = new Vector3(this.road.innerR, -0.5, -1);
    let max = new Vector3(this.road.outerR, 0.5, 1);
    let startLine = new Box3(min, max);
    return startLine.containsPoint(this.position);
  }

  setSpeed(speed) {
    this.speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  // use verlet integration to update position depending on forces acting on kart
  integrate(deltaT) {
    const DAMPING = 0.04;

    // update previous position
    var pos = this.position.clone();
    var previous = this.previous;
    this.previous = pos;
    this.previousRotation = this.rotation;

    // update new position
    var v = pos.clone().sub(previous).divideScalar(deltaT);
    this.setSpeed(v.length());
    var vdt = v.multiplyScalar(deltaT);
    var a = this.netForce.clone().divideScalar(this.mass);
    var step = vdt.multiplyScalar(1-DAMPING).add(a.multiplyScalar(deltaT*deltaT));
    var next = this.position.clone().add(step);
    var move = new TWEEN.Tween(this.position).to(this.position.add(step), 5);
    move.start();

    // reset the netforce
    this.netForce = new Vector3(0, 0, 0);
  }

  // adds a force f to the player
  addForce(f) {
    this.netForce.add(f);
  }

  // bounce player off other player
  bounce(normal, timeStamp) {
    var prev = this.previous;
    this.position.set(prev.x, prev.y, prev.z);
    normal.multiplyScalar(15);
    normal.divideScalar(this.mass);
    this.addForce(normal);
    this.update(timeStamp);
  }

  // find the radial distance from the map centre
  calculateRadius() {
    return Math.sqrt(Math.pow(this.position.x, 2) + Math.pow(this.position.z, 2));
  }

  // bounce player after colliding with road
  // bounce away from collided face normal if given
  // using normal doesn't work for full track- bouncing towards centre
  roadBounce(timeStamp) {
    var prev = this.previous;
    this.position.set(prev.x, prev.y, prev.z);
    var innerR = this.road.innerR;
    var outerR = this.road.outerR;
    var norm = this.position.clone().normalize();
    var innerN = norm.clone().multiplyScalar(innerR);
    var outerN = norm.clone().multiplyScalar(outerR);
    var cen = innerN.clone().add(outerN).divideScalar(2);
    var r = this.calculateRadius();
    var cenR = (innerR + outerR) / 2;
    var f;
    if (r < cenR) f = cen.sub(innerN);
    else f = cen.sub(outerN);
    f.normalize();
    f.multiplyScalar(15);
    this.addForce(f);
    this.update(timeStamp);
  }

  // Get a power up item
  getPowerUp(power) {
    // Don't give a power up to the player if they already have one
    if (this.powerup !== undefined) return;
    this.powerup = power;

    // Display power up
    var control;
    if (this.name === "player1") control = "space";
    else control = "enter";
    this.scene.displayPowerup(this, power, control);
  }

  // Use a power up item
  usePowerUp() {
    let player;
    switch (this.powerup) {
      // Zoom power up
      case "boost":
        this.topSpeed++;
        this.zoom = true;
        this.zoomTime = 50;
        break;

      // Zap power up
      case "zap":
        if (this.name === "player1") player = this.scene.players[1];
        else player = this.scene.players[0];
        player.topSpeed--;
        player.zap = true;
        player.zapTime = 50;
        break;

      // Freeze power up
      case "freeze":
        if (this.name === "player1") player = this.scene.players[1];
        else player = this.scene.players[0];
        player.freeze = true;
        player.freezeTime = 100;
        break;

      // Drop spike trap
      case "spike":
        this.scene.createSpike(this.position);
        break;

      // Drop three spike traps
      case "triple spike":
        const vecToCenter = new Vector3().sub(this.position).normalize();
        this.scene.createSpike( new Vector3().addVectors(vecToCenter, this.position) );
        this.scene.createSpike(this.position);
        this.scene.createSpike( new Vector3().addVectors(vecToCenter.clone().multiplyScalar(-1), this.position) );
        break;

      // Remove a lap from the other player
      case "remove lap":
        if (this.name === "player1") this.scene.players[1].lap--;
        else this.scene.players[0].lap--;
        break;

      // Add a lap to the player
      case "add lap":
        if (this.name === "player1") this.scene.players[0].lap++;
        else this.scene.players[1].lap++;
        break;

      // Activates reverse controls- forward becomes back, left becomes right
      case "reverse controls":
        if (this.name === "player1") player = this.scene.players[1];
        else player = this.scene.players[0];
        player.reverse = true;
        player.reverseTime = 300;
        break;

        // Sends a missile to hit the other player
        case "missile":
          if (this.name == "player1") player = this.scene.players[1];
          else player = this.scene.players[0];
          const missile = new Missile(this.scene, this, player);
          this.missileFired = true;
          this.missile = missile;
          break;

      // Can't use a power up if they don't have one
      default:
        return;
    }

    // Remove power up
    this.powerup = undefined;
    this.scene.displayPowerup(this, undefined, undefined);
  }

  // Player gets hit by a missile
  hitByMissile() {
    this.spin = true;
  }

  // apply force to player to move in direction it is facing
  moveForward() {
    const theta = this.rotation.y;
    const f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    f.multiplyScalar(this.topSpeed);
    if (this.reverse) f.negate();
    this.addForce(f.negate());
  }

  // apply force to player to move in the opposite direction that it is facing
  moveBackward() {
    const theta = this.rotation.y;
    const f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    f.multiplyScalar(this.topSpeed);
    if (this.reverse) f.negate();
    this.addForce(f);
  }

  // move player direction left
  steerLeft() {
    if (this.reverse) this.rotation.y -= this.steering;
    else this.rotation.y += this.steering;
  }

  // move player direction right
  steerRight() {
    if (this.reverse) this.rotation.y += this.steering;
    else this.rotation.y -= this.steering;
  }

  // update the players attributes
  update(timeStamp) {
    // Check whether player is frozen
    if (this.freezeTime > 0) {
      this.freezeTime--;
      return;
    }
    else if (this.freeze) {
      this.freeze = false;
      this.freezeTime = 0;
    }

    // Check whether player is spinning
    if (this.spin) {
      this.rotation.y += 0.1;
      this.spinOrigin += 0.1;
      const EPS = 0.01;
      if (2*Math.PI - this.spinOrigin < EPS) {
        this.spin = false;
        this.spinOrigin = 0;
      }
      else return;
    }

    // Apply the keys that are pressed
    this.controller.apply();

    // Apply forces to the player
    const deltaT = timeStamp % 100;
    this.integrate(deltaT / 500);
    TWEEN.update();

    // Check whether the player is inbounds
    if (!this.scene.isInbounds(this.position.clone()) && timeStamp > 3000) {
      this.position.set(this.reset.x, this.reset.y, this.reset.z);
      this.distInLap = 0.0;
    }

    // update position of bounding box
    this.updateBox();

    // Update the distance travelled for this lap
    this.distInLap += this.position.distanceTo(this.previous);

    // Update the lap number for the player
    this.updateLap();

    // Check whether zoom has runout
    if (this.zoomTime > 0) this.zoomTime -= 1;
    else if (this.zoom) {
      this.zoom = false;
      this.topSpeed--;
    }

    // Check whether zap has runout
    if (this.zapTime > 0) this.zapTime -= 1;
    else if (this.zap) {
      this.zap = false;
      this.topSpeed++;
    }

    // Check whether reverse has runout
    if (this.reverseTime > 0) this.reverseTime -= 1;
    else if (this.reverse) this.reverse = false;

    // Update missile position if one is fired
    if (this.missileFired) this.missile.updatePosition();
  }
}

export default Player;
