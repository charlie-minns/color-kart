import { Vector3, Face3, Matrix4, Group, CubeGeometry, Mesh, MeshBasicMaterial, Vector4 } from 'three';
import { Controller } from 'controllers';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MODEL from './Standard Kart.obj';
import MAT from './Standard Kart.mtl';

class Player extends Group {
  constructor(parent, camera, name, pos) {
    super();

    this.name = name;
    this.speed = 0;         // current speed
    this.topSpeed = 10;     // how fast the player can go
    this.mass = 1;          // weight of the kart
    this.steering = 0.05;    // how efficient steering of kart is (in radians)
    this.netForce = new Vector3(0, 0, 0);
    this.position.set(pos.x, pos.y, pos.z);    // default start position is (0, 0, 0) because of Group
    this.previous = new Vector3(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.controller = new Controller(this);
    this.keys = {};         // keys that are pressed

    // cube around kart to detect collisions
    var cube = new CubeGeometry(3, 2, 6);
    var wireMaterial = new MeshBasicMaterial(
      {color: 0xff0000, transparent:true, opacity:0.0});
    var box = new Mesh(cube, wireMaterial);
	  box.position.set(pos.x, pos.y+0.5, pos.z);
    box.rotation.set(0, 0, 0);
    this.box = box;

    const m = new Matrix4();
    const s = 2.0;
    m.set(
      s, 0, 0, 0,
      0, s, 0, 0,
      0, 0, s, 0,
      1, 1, 1, 1
    );


    // Load object - Piazza Post @527
    //const loader = new OBJLoader();
    /* No console errors, but does not appear
    const mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath('src/components/objects/Player/');
    mtlLoader.load(MAT, (material) => {
      material.preload();
      //debugger;
      loader.setMaterials( material ).load(MODEL, (obj) => {
        //obj.rotateY(Math.PI); // Roate to correct orientation
        //debugger;
        this.add( obj );
      });
    });
    */

    // Load object
    const loader = new OBJLoader();
    /*
    const mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath('src/components/objects/Player/');
    mtlLoader.load(MAT, (material) => {
      material.preload();
      //debugger;
      loader.setMaterials(material).load(MODEL, (obj) => {
        debugger;

        let i = 0;
        obj.traverse( (child) => {
          child.material = material[i];
        });

       obj.children[0] = material.m_body;
        this.add(obj);
      });
    }); */


    loader.load(MODEL, (obj) => {
        obj.rotateY(Math.PI); // Roate to correct orientation
        //debugger;
        const mat = new MeshBasicMaterial( {color: 0xFFFFFF} );
        //mat.wireframe = true;
        obj.children[0].material = mat;
        obj.children[1].material = mat;

        // Scale object
        obj.applyMatrix4(m);

        this.add(obj);
    });



    // Set the camera
    camera.position.set(this.position.x, this.position.y + 6, this.position.z + 16);
    camera.lookAt(this.position);
    this.add(camera);

    parent.addToUpdateList(this);
  }

  // updates the bounding box depending on the players position
  updateBox() {
    var pos = this.position;
    var r = this.rotation;
    this.box.position.set(pos.x, pos.y+0.5, pos.z);
    this.box.rotation.set(r.x, r.y, r.z);
  }

  setSpeed(speed) {
    this._speed = Math.max(0, Math.min(speed, this.topSpeed));
  }

  // use verlet integration to update position depending on forces acting on kart
  integrate(deltaT) {
    const DAMPING = 0.04;

    // update previous position
    var pos = this.position.clone();
    var previous = this.previous;
    this.previous = pos;

    // update new position
    var v = pos.clone().sub(previous).divideScalar(deltaT);
    this.setSpeed(v.length());
    var vdt = v.multiplyScalar(deltaT);
    var a = this.netForce.clone().divideScalar(this.mass);
    var step = vdt.multiplyScalar(1-DAMPING).add(a.multiplyScalar(deltaT*deltaT));
    var move = new TWEEN.Tween(this.position).to(this.position.add(step), 5);
    move.start();

    // reset the netforce
    this.netForce = new Vector3(0, 0, 0);
    // ----------- STUDENT CODE END ------------
  }

  // adds a force f to the player
  addForce(f) {
    this.netForce.add(f);
  }

  // bounce player after colliding with something
  // bounce away from collided face normal if given
  // this is not working very well
  bounce(normal) {
    var prev = this.previous;
    this.position.set(prev.x, prev.y, prev.z);
    var theta = this.rotation.y;
    var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    if (normal) f.add(normal);
    f.multiplyScalar(20*this.mass);
    this.addForce(f);
  }

  // apply force to player to move in direction it is facing
  moveForward() {
    var theta = this.rotation.y;
    var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    this.addForce(f.negate());
  }

  // apply force to player to move in the opposite direction that it is facing
  moveBackward() {
    var theta = this.rotation.y;
    var f = new Vector3(Math.sin(theta), 0, Math.cos(theta));
    this.addForce(f);
  }

  // move player direction left
  steerLeft() {
    this.rotation.y += this.steering;
  }

  // move player direction right
  steerRight() {
    this.rotation.y -= this.steering;
  }

  // update the players attributes
  update(timeStamp) {
    this.controller.apply();

    var deltaT = timeStamp % 100;
    // not really sure how to use timeStamp to set deltaT
    this.integrate(deltaT/500);
    TWEEN.update();

    // update position of bounding box
    this.updateBox();
  }
}

export default Player;
