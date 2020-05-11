/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */

import { WebGLRenderer, PerspectiveCamera, Vector3, Audio, AudioListener, AudioLoader } from 'three';
import { SeedScene } from 'scenes';
import MUSIC from './sounds/Mario Kart - SNES Mario Circuit (Remix).mp3';

// set the menu style
const setCanvas = (menu) => {
  menu.width = window.innerWidth;
  menu.height = window.innerHeight;
  var ctx = menu.getContext('2d');
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, menu.width, menu.height);
  /*var imgPath = './components/scenes/galaxy.jpg';
  var imgObj = new Image();
  imgObj.src = imgPath;
  ctx.drawImage(imgObj, 0, 0);*/

  // add title
  var gradient = ctx.createLinearGradient(0, 0, menu.width, 0);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "green");
  gradient.addColorStop("1.0", "red");
  ctx.font = "80px Georgia";
  ctx.fillStyle = gradient;
  ctx.strokeStyle = 'black';
  ctx.fillText("Colorful Kart Racing", menu.width/4, menu.height/5);
  ctx.strokeText("Colorful Kart Racing", menu.width/4, menu.height/5);
}

// Initialize renderer
const renderer = new WebGLRenderer({ antialias: true });

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
var menu = document.createElement("canvas");
setCanvas(menu);
document.body.appendChild(menu);
var canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Global variables for ShaderToy Material of Road
global.uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new Vector3(canvas.width, canvas.height, 1) },
};

// Initialize cameras for both players and the scene
const camera1 = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150);
const camera2 = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150);
const scene = new SeedScene(camera1, camera2);

// Create an AudioListener for the background music
const listener = new AudioListener();
camera1.add(listener);

// Load music and set it as the Audio object's buffer
const backgroundMusic = new Audio(listener);
const audioLoader = new AudioLoader();
audioLoader.load( MUSIC, function(buffer) {
	backgroundMusic.setBuffer(buffer);
	backgroundMusic.setLoop(true);
	backgroundMusic.setVolume(0.1);
});

// start game
const play = () => {
  window.requestAnimationFrame(onAnimationFrameHandler);
}

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    // get screen width and height
    var w = window.innerWidth;
    var h = window.innerHeight;

    // clear renderer
    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    // render for second player (left)
    renderer.setScissor(1, 1, w/2 - 2, h - 2);
    renderer.setViewport(1, 1, w/2 - 2, h - 2);
    renderer.render(scene, camera1);

    // render for first player (right)
    renderer.setScissor(w/2 + 1, 1, w/2 - 2, h - 2);
    renderer.setViewport(w/2 + 1, 1, w/2 - 2, h - 2);
    renderer.render(scene, camera2);

    // update scene
    scene.update && scene.update(timeStamp);

    //
    global.uniforms.iTime.value = timeStamp * 0.001;

    //
    window.requestAnimationFrame(onAnimationFrameHandler);
};

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);

    camera1.aspect = innerWidth / innerHeight / 2;
    camera1.updateProjectionMatrix();

    camera2.aspect = innerWidth / innerHeight / 2;
    camera2.updateProjectionMatrix();

    setCanvas(menu);
};

const main = function() {
  // Create the HTML div
  //var div = document.createElement("DIV");
  var name1 = document.createElement("input");
  name1.id = "name1";
  name1.placeholder = 'Enter name of Player 1';
  document.body.appendChild(name1);

  var name2 = document.createElement("input");
  name2.id = "name2";
  name2.placeholder = 'Enter name of Player 2';
  document.body.appendChild(name2);

  var button = document.createElement("button");
  button.innerHTML = 'PLAY';
  button.onclick = function() {
    name1.style.display = 'none';
    name2.style.display = 'none';
    button.style.display = 'none';
    menu.style.display = 'none';
    backgroundMusic.play(); // Play background music
    play();
  };
  document.body.appendChild(button);

  // names CSS Styling
  name1.style.color = "red";
  name1.style.position = "fixed";
  name1.style.left = "37%";
  name1.style.top = "30%";
  name1.style.fontSize = "xx-large";
  name1.style.fontFamily = "fantasy";

  name2.style.color = "green";
  name2.style.position = "fixed";
  name2.style.left = "37%";
  name2.style.top = "40%";
  name2.style.fontSize = "xx-large";
  name2.style.fontFamily = "fantasy";

  // button CSS Styling
  button.style.color = "hotpink";
  button.style.position = "fixed";
  button.style.left = "45%";
  button.style.top = "50%";
  button.style.fontSize = "xx-large";
  button.style.fontFamily = "fantasy";
}

windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
main();
