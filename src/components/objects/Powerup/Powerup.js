import { Group, TorusKnotBufferGeometry, MeshNormalMaterial, Mesh } from 'three';

class Powerup extends Group {
  constructor(parent, name, pos) {
      // Call parent Group() constructor
      super();
      this.name = name;

      // Geometry of power up box
      const geometry = new TorusKnotBufferGeometry(0.5, 0.25);
      this.geometry = geometry;

      // Material of power up box
      const mat = new MeshNormalMaterial({transparent:true, opacity:0.75});
      // Create power up box
      const powerup = new Mesh(geometry, mat);
      this.mesh = powerup;
      this.mesh.name = name;
      parent.add(powerup);

      // Set position
      powerup.position.set(pos.x, pos.y, pos.z);

      // Timer to remove power up from screen for some time
      this.timer = 0;

      // List of all the available power ups
      this.powers = ["boost", "zap", "freeze", "spike", "triple spike",
                     "remove lap", "add lap", "reverse controls", "missile"];

      // Add to the scene update list
      parent.addToUpdateList(this);
  }

  // Generate a random power up for the player
  generatePowerUp(player) {
    // Do not count collisions when the powerup isn't active
    if (this.timer > 0) return;

    // Give random power up to the player
    const npowers = this.powers.length;
    var ind = Math.round(Math.random() * npowers);
    var power = this.powers[ind];
    player.getPowerUp(power);

    // Remove the power up box
    this.remove();
  }

  // If the player hits the power up, remove it from the scene for a few seconds
  remove() {
    this.show = false;
    this.mesh.material.opacity = 0.0;
    this.timer = 400;
  }

  // Update power up
  update(timeStamp) {
    // Rotate power ups
    this.mesh.rotation.y += 0.01;

    // Check whether powerup should be displayed
    if (this.timer > 0) this.timer -= 1;
    if (this.show == false && this.timer == 0) {
      this.mesh.material.opacity = 0.75;
      this.show = true;
      this.timer = 0;
    }
  }
}

export default Powerup;
