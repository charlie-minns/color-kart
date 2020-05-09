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
//import { Stats } from 'stats.js';

// Initialize renderer
const renderer = new WebGLRenderer({ antialias: true });

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
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
	//backgroundMusic.play();
});

// start game
const main = () => {
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
};

main();
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
