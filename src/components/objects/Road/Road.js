import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './road.gltf';

class Road extends Group {
    constructor() {

        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'road';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        })
    }
}

export default Road;