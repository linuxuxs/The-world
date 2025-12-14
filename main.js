import * as t from "three";
import {fov, aspect, near, far, width, height} from "./assets/others.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getFresnelMat from "./assets/getFresnelMat.js";

//renderer and camera

const IsOnMobile = /Android|Iphone|iPad|iPod/i.test(navigator.userAgent);

const renderer = new t.WebGLRenderer({
    antialias: !IsOnMobile
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
const camera = new t.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
const touch = new OrbitControls(camera, renderer.domElement);
touch.enableDamping = true;


const world = new t.Group();

//LOAD ALL TEXTURES
const tl = new t.TextureLoader();
const textures = {};

Promise.all([
    tl.loadAsync("./assets/night.jpg").then(t => textures.night = t),
    tl.loadAsync("./assets/moon.jpg").then(t => textures.moon = t),
    tl.loadAsync("./assets/clouds.jpg").then(t => textures.clouds = t),
    tl.loadAsync("./assets/color.jpg").then(t => textures.color = t),
    tl.loadAsync("./assets/stars.jpg").then(t => textures.stars = t)
    
]).then(() => {
    startScene();
});

function startScene(){
    document.getElementById("resume").style.display = "None";
    
    //CREATING THE WORLD 
    const geoDetail = IsOnMobile ? 6 : 8;
    const circleGeo = new t.IcosahedronGeometry(1.0, geoDetail);
    const circleGeo2 = new t.IcosahedronGeometry(0.2, geoDetail); 
    const color = new t.MeshStandardMaterial({
        map: textures.night,
        //flatShading: true
        // transparent: false,
        blending: t.AdditiveBlending,
    });
    const moonMat = new t.MeshStandardMaterial({
        map: textures.moon
    });
    const clouds = new t.MeshStandardMaterial({
        map: textures.clouds,
        opacity: 0.5,
        //side: t.DoubleSide,
        depthWrite: false,
        transparent: true
    });
    const light = new t.MeshStandardMaterial({
        map: textures.color,
        // opacity: 0.9,
        // transparent: false,
        // blending: t.AdditiveBlending,
    });

    const fresnelMat = getFresnelMat();
    const fresnelMat2 = getFresnelMat({ rimHex: 0x88ccff, facingHex: 0x222222 });
    const glow = new t.Mesh(circleGeo, fresnelMat);
    const glow2 = new t.Mesh(circleGeo2, fresnelMat2);
    glow.scale.setScalar(1.003);
    glow2.scale.setScalar(1.003);
    world.add(glow);
    const moonMesh = new t.Mesh(circleGeo2, moonMat);
    moonMesh.add(glow2);

    const pivot = new t.Group();


    const worldMesh = new t.Mesh(circleGeo, color);
    const cloudsMesh = new t.Mesh(circleGeo, clouds);
    cloudsMesh.scale.set(1.01,1.01,1.01);
    const lightMesh = new t.Mesh(circleGeo, light);

    //CREATING LIGHT
    const sun = new t.DirectionalLight(0xffffff);

    sun.position.set(-2, -0.5, 2);

    //rotating the world at its axial tilt:  
    world.rotation.z = 23.4 * Math.PI / 180;
    //SCENE THINGS
    const scene = new t.Scene();
    textures.stars.mapping = t.EquirectangularReflectionMapping;
    textures.stars.encoding = t.sRGBEncoding;
    scene.background = textures.stars;
    
    world.add(lightMesh);
    world.add(worldMesh);
    world.add(cloudsMesh);

    pivot.position.set(0,0,0);

    pivot.add(moonMesh);

    moonMesh.position.set(2,1.2,1.7);
    world.add(pivot);
    scene.add(world);
    scene.add(sun);

    //functions
    function animate(t = 0){
        requestAnimationFrame(animate);
        worldMesh.rotation.y +=  0.0002;
        cloudsMesh.rotation.y += 0.0010;
        lightMesh.rotation.y += 0.0002;
        moonMesh.rotation.y += 0.002;
        pivot.rotation.y += 0.004;
        touch.update();
        renderer.render(scene, camera);
        
    }


    //TODO:
    /**
     * Timer - set timer, break, stop and the timer - DONE
     * Change music - new songs, next button, previous putton WONT IMPLEMENT
     * HIDE TIMER OPTION - DONE
     */

    function onWindowResize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //========================

    //MUSIC
    let listener;
    let sound;

    let btn = document.getElementById("muteBtn");
    let isMuted = true;



    document.addEventListener('click', () => {

        if(!listener){
            listener = new t.AudioListener();
        }
        sound = new t.Audio(listener);
        const al = new t.AudioLoader();
        al.load("./assets/bg_music.mp3", function(buffer){
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.3);
            sound.play();
        });
        
        if(listener.context.state !== "running"){
            listener.context.resume();
        }
    }, {once: true});

    btn.addEventListener('click', () => {
        
        if(!isMuted){
            sound.play();
            btn.textContent = 'MUTE MUSIC';
        } else{
            sound.pause();
            btn.textContent = 'UNMUTE MUSIC';
        }
        isMuted = !isMuted;
    });

    window.addEventListener('resize', onWindowResize, false);

    renderer.render(scene, camera);
    animate();
}
