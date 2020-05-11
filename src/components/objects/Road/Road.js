import { Group, RingBufferGeometry, TorusBufferGeometry, MeshBasicMaterial, MeshNormalMaterial, Mesh, ShaderMaterial, TextureLoader, PlaneBufferGeometry } from 'three';
import { RepeatWrapping, NearestFilter } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import MAT from './checkerboard.jpg';

class Road extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.name = 'road';

        // Geometry of the road
        const innerR = 40;
        const outerR = 60;
        this.innerR = innerR;
        this.outerR = outerR;
        const tube = 1;
        const thetaSegments = 24;
        const phiSegments = 1;
        const thetaStart = 0;
        const thetaEnd = Math.PI * 2.0;
        const roadGeometry = new RingBufferGeometry(innerR, outerR, thetaSegments, phiSegments, thetaStart, thetaEnd);
        roadGeometry.rotateX(3 * (Math.PI / 2));  // Rotate track to correct orientation
        this.geometry = roadGeometry;

        // ShaderToy - uses code from https://threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html
        // Fragment shader - Rainbow
        const fragmentShader = `
        #include <common>

        uniform vec3 iResolution;
        uniform float iTime;

        // By iq: https://www.shadertoy.com/user/iq
        // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = fragCoord/iResolution.xy;

            // Time varying pixel color
            vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

            // Output to screen
            fragColor = vec4(col,1.0);
        }

        void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
        }
        `;

        // Material of the road
        let uniforms = global.uniforms;
        const roadMaterial = new ShaderMaterial({
            fragmentShader,
            uniforms,
        });

        // Create road
        const road = new Mesh(roadGeometry, roadMaterial);
        parent.add(road);

        // Create walls
        const geometries = []; // geometry for the sides of the road

        const wallMat = new MeshNormalMaterial();
        const innerEdgeGeometry = new TorusBufferGeometry(innerR + tube / 2, tube, 10, 30);
        const outerEdgeGeometry = new TorusBufferGeometry(outerR + tube / 2, tube, 10, 30);
        innerEdgeGeometry.name = "inner";
        outerEdgeGeometry.name = "outer";
        geometries.push(innerEdgeGeometry, outerEdgeGeometry);

        // Merge wall geometries
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
        const walls = new Mesh(mergedGeometry, wallMat);
        walls.rotation.x = Math.PI / 2;
        this.walls = walls;
        parent.add(walls);

        // Create start strip - modified code from Three.js Tutorial (Lights)
        // https://threejsfundamentals.org/threejs/lessons/threejs-lights.html
        const planeWidth = 20;
        const planeHeight = 2;

        const loader = new TextureLoader();
        const texture = loader.load(MAT);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.magFilter = NearestFilter;
        texture.repeat.set(planeWidth / 2, 1);

        const planeGeo = new PlaneBufferGeometry(planeWidth, planeHeight);
        const planeMat = new MeshBasicMaterial( {map: texture} );

        const strip = new Mesh(planeGeo, planeMat);
        strip.rotation.x = Math.PI / 2;
        strip.rotation.y = Math.PI;
        strip.position.set(50, 0.001, 0);
        this.start = strip;
        parent.add(strip);
    }
}

export default Road;
