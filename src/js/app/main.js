import * as THREE from 'three';
import { OrbitControls } from "./controls/OrbitControls.js";
import { OBJLoader } from "./loaders/OBJLoader.js";
import { MTLLoader } from "./loaders/MTLLoader.js";

function qs(search) {
    if (typeof search !== "string" || !search) return search;
    return search.split("&").reduce((res, cur) => {
        const arr = cur.split("=");
        return Object.assign({ [arr[0]]: arr[1] }, res)
    }, {})
}

export default class Main {
    constructor(container) {
        let renderer, scene, camera;
        let object;
        this.container = container

        let modelName = 'VCOE2100080-S3R1_0'
        let urlSearch = window.location.search.replace(/^\?/, "")
        let urlArgs = qs(urlSearch)
        let pointLightColor = 0x636363;
        let ambientLightColor = 0xffffff;
        let pointLightVal = 0.1
        let ambientLightVal = 0.8

        if(urlArgs.point_light_color)
            pointLightColor = urlArgs['point_light_color']
        
        if(urlArgs.ambient_light_color)
            ambientLightColor = urlArgs['ambient_light_color']
        
        if(urlArgs.point_light)
            pointLightVal = parseFloat(urlArgs['point_light'])
        
        if(urlArgs.ambient_light)
            ambientLightVal = parseFloat(urlArgs['ambient_light'])
        
        if(urlArgs.model)
            modelName = urlArgs['model']
        
        console.log('urlArgs:', urlArgs)

        function setContent(object) {
            object.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3()).length();
            const boxSize = box.getSize();
            const center = box.getCenter(new THREE.Vector3());
            object.position.x += object.position.x - center.x;
            object.position.y += object.position.y - center.y; //修改center.y可以设置模型整体上下偏移
            object.position.z += object.position.z - center.z;
            camera.position.copy(center);
            if (boxSize.x > boxSize.y) {
                camera.position.z = -boxSize.x * -0.5;
            } else {
                camera.position.z = boxSize.y * 3;
            }
            camera.lookAt(0, 0, 0);
        }
        function init() {
            // renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, domElement: container });
            renderer.setClearColor('#B8B8B8', 1.0);
            renderer.setSize(window.innerWidth, window.innerHeight);
            // document.body.appendChild(container);
            // document.body.appendChild(renderer.domElement);

            renderer.outputEncoding = THREE.sRGBEncoding;

            // scene
            scene = new THREE.Scene();

            // camera
            camera = new THREE.PerspectiveCamera(
                40,
                window.innerWidth / window.innerHeight,
                1,
                20000
            );
            camera.position.set(-10, 0, 23);
            scene.add(camera);


            function loadModel() {
                // object.traverse(function (child) {

                // });
                console.log("object1:", object);
                setContent(object);
                scene.add(object);
                container.querySelector('#loading').style.display = 'none';
                // if(object) {
                //     console.log("object:", object);
                //     setContent(object);
                //     scene.add(object);
                // }

            }

            const manager = new THREE.LoadingManager(loadModel);

            manager.onProgress = function (item, loaded, total) {
                console.log(item, loaded, total);
            };

            function onProgress(xhr) {
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(
                        "model " + Math.round(percentComplete, 2) + "% downloaded"
                    );
                }
            }

            function onError() { }
            // controls
            const controls = new OrbitControls(camera, container);
            // const controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener("change", render);
            controls.minDistance = 100;
            controls.maxDistance = 500;
            controls.enablePan = true;
            controls.enableDamping = true;
            // controls.dampingFactor = .9;

            // light
            const light = new THREE.PointLight(pointLightColor, pointLightVal);
            camera.add(light);
            // console.log('lig33333')

            const lightRes = new THREE.AmbientLight(ambientLightColor, ambientLightVal);
            lightRes.position.x = 200;
            lightRes.position.y = - 300;
            lightRes.position.z = 100;
            scene.add( lightRes );

            const mtlloader = new MTLLoader(manager);
            const loader = new OBJLoader(manager);
            mtlloader
                .setPath("https://liyang-assets.explorium.cn/3d/VCOE2100080-S3R1/")
                .load(`${modelName}.mtl`, function (materials) {
                    materials.preload();
                    loader.setMaterials(materials);
                    console.log('111')
                    loader.load(`https://liyang-assets.explorium.cn/3d/VCOE2100080-S3R1/${modelName}.obj`,
                        function (obj) {
                            console.log('222')
                            object = obj;
                        },
                        onProgress,
                        onError
                    );
                });

            window.addEventListener("resize", onWindowResize);
        }

        function onWindowResize() {
            renderer.setSize(window.innerWidth, window.innerHeight);

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            render();
        }

        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }

        init();
        animate();
    }

}
