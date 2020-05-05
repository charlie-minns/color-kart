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
      // move player forward if up arrow is pressed
      if (key == "ArrowUp" && player.keys[key]) {
        player.moveForward();
      }

      // move player back if up down is pressed
      if (key == "ArrowDown" && player.keys[key]) {
        player.moveBackward();
      }

      // move player left if left arrow is pressed
      if (key == "ArrowLeft" && player.keys[key]) {
        player.steerLeft();
      }

      // move player right if right arrow is pressed
      if (key == "ArrowRight" && player.keys[key]) {
        player.steerRight();
      }
    }
  }
}

export default Controller;
