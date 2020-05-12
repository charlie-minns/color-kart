import { Group, OctahedronBufferGeometry, MeshNormalMaterial, Mesh } from 'three';

class Obstacles extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Geometry of obstacle box
        const geometry = new OctahedronBufferGeometry(2, 3);

        // Material of obstacle boxes
        const mat = new MeshNormalMaterial();

        // Create obstacle boxes
        const obstacle1 = new Mesh(geometry, mat);
        const obstacle2 = new Mesh(geometry, mat);
        const obstacle3 = new Mesh(geometry, mat);
        this.mesh1 = obstacle1;
        this.mesh2 = obstacle2;
        this.mesh3 = obstacle3;
        parent.add(obstacle1);
        parent.add(obstacle2);
        parent.add(obstacle3);

        // Add to the scene update list
        parent.addToUpdateList(this);
    }

    // Update obstacle
    update(timeStamp) {
        // Revolve first obstacle
        this.mesh1.position.set(
            Math.cos(timeStamp * 0.0002 + Math.PI / 2) * 45,
            Math.cos(timeStamp * 0.002) * 2.5,
            Math.sin(timeStamp * 0.0002 + Math.PI / 2) * 45
        );

        // Revolve second obstacle
        this.mesh2.position.set(
            Math.cos(timeStamp * 0.0002 + 0.1) * 55,
            Math.sin(timeStamp * 0.002) * 2.5,
            Math.sin(timeStamp * 0.0002 + 0.1) * 55
        );

        // Revolve third obstacle
        this.mesh3.position.set(
            Math.cos(timeStamp * 0.0002 + Math.PI) * 55,
            Math.cos(timeStamp * 0.002) * 2.5,
            Math.sin(timeStamp * 0.0002 + Math.PI) * 55
        );
    }
}

export default Obstacles;
