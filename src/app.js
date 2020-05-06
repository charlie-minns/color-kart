/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';



// Initialize core ThreeJS components

const renderer = new WebGLRenderer({ antialias: true });

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Global variables for ShaderToy
global.uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new Vector3(canvas.width, canvas.height, 1) },
};

const camera = new PerspectiveCamera();
const scene = new SeedScene(camera);

// Set up controls
/*const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
//controls.minDistance = 4;
//controls.maxDistance = 16;
controls.update();*/

// Bloom Effect
/*
const params = {
    exposure: 1,
    bloomStrength: 0.2,
    bloomThreshold: 0.8,
    bloomRadius: 0
};


const renderPass = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass( new Vector2( innerWidth, innerHeight ), 1.5, 0, 0 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const composer = new EffectComposer( renderer );
composer.addPass( renderPass );
composer.addPass( bloomPass );
*/

// Render loop
const onAnimationFrameHandler = (timeStamp) => {

    global.uniforms.iTime.value = timeStamp * 0.001;


    //controls.update();
    renderer.render(scene, camera);
    //composer.render();
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
