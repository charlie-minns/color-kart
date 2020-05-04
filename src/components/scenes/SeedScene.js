import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Road, Player } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: [],
        };

        // Set background to a nice color
        // this.background = new Color(0x7ec0ee);
        this.background = new Color(0x2d2c2e);

        // Add meshes to scene
        const land = new Land();
        const lights = new BasicLights();
        const player = new Player(this);
        const road = new Road(this);
        this.add(land, lights, road, player);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
