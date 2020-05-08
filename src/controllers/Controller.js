function Controller(player) {
  this.player = player;

  // add the keys pressed to a dictionary
  window.addEventListener("keydown", function(event) {
      player.keys[event.key] = true;
  });

  // add the keys pressed to a dictionary
  window.addEventListener("keyup", function(event) {
      player.keys[event.key] = false;
  });

  // move player depending on keys pressed
  this.apply = function() {
    // iterate over all keys pressed
    for (var key in player.keys) {
      // keys to control player1
      if (player.name == "player1") {
        // move forward if w is pressed
        if (key == "w" && player.keys[key]) {
          player.moveForward();
        }

        // move back if s is pressed
        if (key == "s" && player.keys[key]) {
          player.moveBackward();
        }

        // turn left if a is pressed
        if (key == "a" && player.keys[key]) {
          player.steerLeft();
        }

        // turn right if d is pressed
        if (key == "d" && player.keys[key]) {
          player.steerRight();
        }
      }
      // keys to control player2
      else {
        // move forward if up arrow is pressed
        if (key == "ArrowUp" && player.keys[key]) {
          player.moveForward();
        }

        // move back if up down is pressed
        if (key == "ArrowDown" && player.keys[key]) {
          player.moveBackward();
        }

        // turn left if left arrow is pressed
        if (key == "ArrowLeft" && player.keys[key]) {
          player.steerLeft();
        }

        // turn right if right arrow is pressed
        if (key == "ArrowRight" && player.keys[key]) {
          player.steerRight();
        }
      }
    }
  }
}

export default Controller;
