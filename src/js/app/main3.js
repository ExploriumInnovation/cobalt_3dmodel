// Global imports -
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

// Local imports -
// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';
import Geometry from './components/geometry';

// Helpers
import Stats from './helpers/stats';
import MeshHelper from './helpers/meshHelper';

// Model
import Texture from './model/texture';
import Model from './model/model';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

// data
import Config from './../data/config';

import { OBJLoader } from "./loaders/OBJLoader.js";
import { MTLLoader } from "./loaders/MTLLoader.js";
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    let modelName = 'VCOE2100080-S3R1_0'
    // Set container property to container element
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    // Get Device Pixel Ratio first for retina
    if(window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container);

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(this.camera.threeCamera, container);
    this.light = new Light(this.scene);

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach((light) => this.light.place(light));

    // Create and place geo in scene
    this.geometry = new Geometry(this.scene);
    this.geometry.make('plane')(150, 150, 10, 10);
    this.geometry.place([0, -20, 0], [Math.PI / 2, 0, 0]);

    // Set up rStats if dev environment
    if(Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    // Set up gui
    if (Config.isDev) {
      this.gui = new DatGUI(this)
    }

    // this.texture = new Texture();

    // this.texture.load().then(() => {
    //   this.manager = new THREE.LoadingManager();

    //   this.model = new Model(this.scene, this.manager, this.texture.textures);
    //   this.model.load(Config.models[Config.model.selected].type);

    //   this.manager.onProgress = (item, loaded, total) => {
    //     console.log(`${item}: ${loaded} ${total}`);
    //   };

    //   this.manager.onLoad = () => {
    //     new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);

    //     if(Config.isDev) {
    //       this.meshHelper = new MeshHelper(this.scene, this.model.obj);
    //       if (Config.mesh.enableHelper) this.meshHelper.enable();

    //       this.gui.load(this, this.model.obj);
    //     }

    //     Config.isLoaded = true;
    //     this.container.querySelector('#loading').style.display = 'none';
    //   };
    // });


    let object;
    let that = this


    const manager = new THREE.LoadingManager();
    this.manager = manager


    this.manager.onLoad = () => {
        this.setContent()
        this.scene.add(this.object);
        new Interaction(this.renderer.threeRenderer, this.scene, this.camera.threeCamera, this.controls.threeControls);
    
        if(Config.isDev) {
            // this.meshHelper = new MeshHelper(this.scene, this.object);
            // if (Config.mesh.enableHelper) this.meshHelper.enable();
    
            this.gui.load(this, this.object);
        }
    
        Config.isLoaded = true;
        this.container.querySelector('#loading').style.display = 'none';
      };

    
    function onProgress(xhr) {
    }
    
    function onError() { }
    
    
    const mtlloader = new MTLLoader(manager);
    const loader = new OBJLoader(manager);
    mtlloader
        .setPath("https://liyang-assets.explorium.cn/3d/VCOE2100080-S3R1/")
        .load(`${modelName}.mtl`, function (materials) {
            materials.preload();
            loader.setMaterials(materials);
            loader.load(`https://liyang-assets.explorium.cn/3d/VCOE2100080-S3R1/${modelName}.obj`,
                function (obj) {
                    object = obj;
                    that.object = obj
                },
                onProgress,
                onError
            );
        });


    this.render();
  }




 setContent() {
    this.object.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(this.object);
    const size = box.getSize(new THREE.Vector3()).length();
    const boxSize = box.getSize();
    const center = box.getCenter(new THREE.Vector3());
    this.object.position.x += this.object.position.x - center.x;
    this.object.position.y += this.object.position.y - center.y; //修改center.y可以设置模型整体上下偏移
    this.object.position.z += this.object.position.z - center.z;
    console.log('camera:', this.camera)
    console.log('position:', this.camera.threeCamera.position)

    this.camera.threeCamera.position.copy(center);
    if (boxSize.x > boxSize.y) {
        this.camera.threeCamera.position.z = -boxSize.x * -0.5;
    } else {
        this.camera.threeCamera.position.z = boxSize.y * 3;
    }
    this.camera.threeCamera.lookAt(0, 0, 0);
}

  render() {
    // Render rStats if Dev
    if(Config.isDev && Config.isShowingStats) {
      Stats.start();
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera);

    // rStats has finished determining render call now
    if(Config.isDev && Config.isShowingStats) {
      Stats.end();
    }

    // Delta time is sometimes needed for certain updates
    //const delta = this.clock.getDelta();

    // Call any vendor or module frame updates here
    TWEEN.update();
    this.controls.threeControls.update();

    // RAF
    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }
}
