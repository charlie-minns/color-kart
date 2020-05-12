# Colorful Kart Racing

This is our final project for COS 426, Computer Graphics. Thank you to the course TAs for providing a simple scene, camera, and renderer in a modern JavaScript environment for us to build off of, which can found found at [this link](https://reillybova.github.io/three-seed/).

## app.js
This file creates the scene using the RacingScene class, creates cameras for each player, and sets up the render loop. In this file, we created the main menu which allows the user to input the players' names, and linked a button that would activate the render loop and begin the game by calling the scene's update function. We enabled split screen capabilities by creating two cameras and rendering the scene from each. The view produced is displayed on each side of the screen, split vertically. 

## RacingScene
This class extends the ThreeJS scene, and takes the two cameras as arguments. It creates the road, two players, power-up boxes, and obstacles to be added to the scene. This class is where we handle collision detection- at each update we check whether meshes collide and call the corresponding function depending on the objects that collided. There is also a lap counter and power-up display, that adds text to the screen to provide that information. Finally, there is an endGame function, which is called when the first player completes all the laps. This sets up the final menu, which displays the winner's name and allows the user to restart the game. 

## Road
This object is used to setup our basic map for the game. Our road is a concentric ring, with tori at the inner and outer radii to resemble the walls of the road and keep the player within the boundaries. We used a [ShaderToy ThreeJS implementation](https://threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html) to create a rainbow material for the raod to fit the game's style. 

## Player
The player class creates an object for the player in the scene with a given camera, name, and position. Currently, this class is set up so that each of the two players are given a model depending on the name (defaulted to "player1" and "player2". Each player is given a controller object, that allows it's attributes to be updated depending on user interaction. To handle collisions, we used an objected oriented bounding box to cover the player and used the scene's collisions functions to check for collisions between meshes, modifying the [implementation used by Lee Stemkoski](https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html). For movement, we implemented [Verlet integration](https://en.wikipedia.org/wiki/Verlet_integration), and applied forces to the player and used the net force at each update to calculate the player's new position. The player has a funciton to update the lap is on, which works by detecting collisions with the start line, and ensuring that the player has travelled at least three quarters of the way around the track. It also has bounce and roadBounce functions to cause the player to rebound off an object upon collision. For the road, the player rebounds towards the centre of the road, and for other objects it rebounds off the normal to the collision surface. There are functions that control whether the player turns and moves forward or backward, which are called by the controller object. The player object also handles power-up interactions, handling the effects due to power-up use and calling the scene function to update the power-up display. These effects are discussed in more detail in the power-up section below. 

## Controller 

The controller is an object that we used to handle user input. This is where we add listener events which wait for keys to be pressed or released. When a player object is created, they are also given a controller object that will determine how this player is affected depending on the user’s input. To allow multiple keys to be pressed at the same time, the keys are added to a dictionary which is stored as an attribute of the player, then when the player is updated the functions associated with the keys stored are called. Player 1 is controlled by the wasd keys to move and power-ups are used with the space bar. Player 2 is controlled by the arrow keys, and power-ups are used with the enter key. 

## Powerup
The scene creates two powerup boxes on the track so each player could get one power-up per lap. We made a powerup class that creates a TorusKnot geometry, and added a material to fit our game’s style. An attribute of this object is a list of possible power-ups, and when a player collides with the mesh a random string will be taken from the list and added to the player’s power-up attribute. After a collision, the power-up item is made transparent, and a timer is activated so that the players cannot interact with this mesh again for some time.  Upon receiving the power-up, the player is notified that they have it and can choose when to use it through keyboard input. The power-ups we have implemented are:
*boost: speed increases for some time
*zap: opponent’s speed decreases for some time
*freeze: opponent cannot move for some time
*spike: cone mesh placed on the track behind the player
*triple spike: three cone meshes placed on the track behind the player
*add lap: player's lap count increases
*remove lap: opponent’s lap count decreases
*reverse controls: opponent’s controls are reversed, so forward is back and steering left turns the kart right etc. 
*missile: this player fires a sphere mesh at the other player, which updates at each step to move towards the player
Upon colliding with a spike or missile object, the player’s spin attribute is activated, causing them to complete a full 360 turn during which they cannot move. 

## Obstacles 
To make the gameplay more interesting, we also added some moving obstacles to the scene that the player would bounce off of if they collided with them. These objects position's update over time according to sine and cosine functions. Each obstacles object consists of three octahedrons following different functions to add randomness to the way these obstacles move and making them more difficult to avoid.  

## License
[MIT](./LICENSE)
