import { Group, RingBufferGeometry, MeshPhongMaterial, Mesh, Scene } from 'three';

class Road extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'road';

        // Geometry of the track
        const roadGeometry = new RingBufferGeometry(40, 50, 40, 40, 0, 6.3);
        roadGeometry.rotateX(3 * (Math.PI / 2));
        this.geometry = roadGeometry;

        // Material of the track
        const roadMaterial = new MeshPhongMaterial( {color: 0xAA42F5} );
        this.material = roadMaterial;

        // Add the track to the scene
        const track = new Mesh(roadGeometry, roadMaterial);
        parent.add(track);
    }
}

export default Road;
