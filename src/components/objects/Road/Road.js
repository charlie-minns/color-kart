import { Group, Shape, TorusGeometry, RingBufferGeometry, MeshBasicMaterial, Mesh, Scene, ShaderMaterial } from 'three';

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
        const thetaSegments =  150;
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

        // geometry for the sides of the road
        var mat = new MeshBasicMaterial({color: 0x432355});
        var innerEdgeGeometry = new TorusGeometry(innerR+tube/2, tube, 50, 50);
        var innerEdge = new Mesh(innerEdgeGeometry, mat);
        innerEdge.rotation.x = Math.PI/2;
        this.innerEdge = innerEdge;
        var outerEdgeGeometry = new TorusGeometry(outerR+tube/2, tube, 50, 50);
        var outerEdge = new Mesh(outerEdgeGeometry, mat);
        outerEdge.rotation.x = Math.PI/2;
        this.outerEdge = outerEdge;
        parent.add(innerEdge, outerEdge);

        // Create road
        const road = new Mesh(roadGeometry, roadMaterial);
        parent.add(road);
    }
}

export default Road;
