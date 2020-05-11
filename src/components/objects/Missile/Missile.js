import { Group, RingBufferGeometry, SphereGeometry, MeshBasicMaterial, MeshNormalMaterial, Mesh, ShaderMaterial, TextureLoader, PlaneBufferGeometry } from 'three';
import { RepeatWrapping, NearestFilter } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

class Missile extends Group {
    constructor(scene, origin, target) {
        // Call parent Group() constructor
        super();
        this.name = 'missile';
        this.origin = origin;
        this.target = target;

        // Geometry of the missile
        const geometry = new SphereGeometry(0.5, 24, 24);
        this.geometry = geometry;

        // Material of missile
        const mat = new MeshNormalMaterial({transparent:true, opacity:1.0});
        this.mat = mat;

        // Create missile
        const missile = new Mesh(geometry, mat);
        this.mesh = missile;
        this.mesh.name = "missile";
        scene.add(missile);

        // Set position
        var pos = origin.position.clone();
        missile.position.set(pos.x, pos.y+0.5, pos.z);
    }

    // Update missile position
    updatePosition() {
      const EPS = 0.5;
      var target = this.target.position.clone();
      var dir = target.sub(this.mesh.position).normalize();
      this.mesh.position.add(dir.multiplyScalar(0.75));
      var dist = this.mesh.position.clone().sub(this.target.position).length();
      if (dist < EPS) {
        this.origin.missileFired = false;
        this.mat.opacity = 0.0;
        this.target.hitByMissile();
      }
    }

}

export default Missile;
