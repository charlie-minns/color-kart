import { Group, RingBufferGeometry, MeshBasicMaterial, Mesh, Scene, ShaderMaterial } from 'three';

class Road extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.name = 'road';

        // Geometry of the track
        const roadGeometry = new RingBufferGeometry(30, 70, 40, 20, 0, 6.283185);
        roadGeometry.rotateX(3 * (Math.PI / 2));
        this.geometry = roadGeometry;

        // Material of the track
        const roadMaterial = new MeshBasicMaterial( {color: 0xAA42F5} );
        roadMaterial.wireframe = true;
        this.material = roadMaterial;

        // Add the track to the scene
        //const track = new Mesh(roadGeometry, roadMaterial);


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
        let uniforms = global.uniforms;

        const material = new ShaderMaterial({
            fragmentShader,
            uniforms,
        });

        const track = new Mesh(roadGeometry, material);

        parent.add(track);
    }
}

export default Road;
