function Controller(player) {
  this.player = player;

  window.addEventListener("keydown", function(event) {
      handleImpactEvents(event);
  });

  // handle user interaction when a key is pressed
  function handleImpactEvents(event) {
    // move player forward if up arrow is pressed
    if (event.key == "ArrowUp") {
      player.moveForward();
    }

    // move player back if up down is pressed
    if (event.key == "ArrowDown") {
      player.moveBackward();
    }

    // move player left if left arrow is pressed
    if (event.key == "ArrowLeft") {
      player.steerLeft();
    }

    // move player right if right arrow is pressed
    if (event.key == "ArrowRight") {
      player.steerRight();
    }
  }
}

export default Controller;
