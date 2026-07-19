import * as THREE from 'three';

// ==========================================
// 1. SCENE
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3AA3F7);
scene.fog = new THREE.Fog(0x3AA3F7, 150, 1800); 

// ==========================================
// 2. CAMERA
// ==========================================
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
const cameraTarget = new THREE.Vector3();

// ==========================================
// 3. RENDERER
// ==========================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); // Optimize for high-res screens
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Better performance than SoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 4. LIGHTING & DAY/NIGHT
// ==========================================
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 200;
const d = 100;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
scene.add(dirLight);

const sunGeo = new THREE.SphereGeometry(40, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff5b6, fog: false });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const moonGeo = new THREE.SphereGeometry(30, 32, 32);
const moonMat = new THREE.MeshBasicMaterial({ color: 0xddddff, fog: false });
const moon = new THREE.Mesh(moonGeo, moonMat);
scene.add(moon);

// Stars
const starsGeo = new THREE.BufferGeometry();
const starsCount = 1500;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 3000;
    posArray[i+1] = Math.random() * 1500; // Only upper hemisphere
    posArray[i+2] = (Math.random() - 0.5) * 3000;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMat = new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, transparent: true, opacity: 0, fog: false });
const starsMesh = new THREE.Points(starsGeo, starsMat);
scene.add(starsMesh);

// ==========================================
// 5. TERRAIN & ROAD
// ==========================================
const groundGeo = new THREE.PlaneGeometry(4000, 4000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a8251, roughness: 1.0, flatShading: true }); // Stylized soft green
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.matrixAutoUpdate = false;
ground.updateMatrix();
scene.add(ground);

const roadWidth = 14;
const roadLength = 100;
const roadSegmentsCount = 26;
const roads = [];
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2b2f, roughness: 0.9, metalness: 0.1 });
const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
roadGeometry.rotateX(-Math.PI / 2);

const lineGeo = new THREE.PlaneGeometry(0.3, 4);
lineGeo.rotateX(-Math.PI / 2);
const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

for (let i = 0; i < roadSegmentsCount; i++) {
    const roadGroup = new THREE.Group();
    roadGroup.position.z = - (i * roadLength);
    
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.position.y = 0.05; // slightly above ground to prevent z-fighting
    roadMesh.receiveShadow = true;
    roadMesh.matrixAutoUpdate = false;
    roadMesh.updateMatrix();
    roadGroup.add(roadMesh);
    
    // Add dashed lines
    const linesMesh = new THREE.InstancedMesh(lineGeo, lineMat, 10);
    const dummy = new THREE.Object3D();
    let count = 0;
    for(let j = 0; j < roadLength; j += 10) {
        dummy.position.set(0, 0.06, j - roadLength/2 + 2);
        dummy.updateMatrix();
        linesMesh.setMatrixAt(count++, dummy.matrix);
    }
    linesMesh.matrixAutoUpdate = false;
    linesMesh.updateMatrix();
    roadGroup.add(linesMesh);
    
    roadGroup.matrixAutoUpdate = false;
    roadGroup.updateMatrix();
    
    scene.add(roadGroup);
    roads.push(roadGroup);
}

// ==========================================
// 6. PROCEDURAL TREES & MOUNTAINS
// ==========================================
const environmentProps = [];
const mountains = [];

for (let i = 0; i < 50; i++) {
    const mHeight = 300 + Math.random() * 600;
    const mRadius = mHeight * (1.0 + Math.random() * 0.5);
    const mountainGeo = new THREE.ConeGeometry(mRadius, mHeight, 4 + Math.floor(Math.random()*3));
    const mColor = Math.random() > 0.4 ? 0x4e5850 : 0x3a4c38;
    const mountainMat = new THREE.MeshStandardMaterial({ color: mColor, flatShading: true, roughness: 1.0 });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    
    const side = Math.random() > 0.5 ? 1 : -1;
    let x = side * (mRadius + 150 + Math.random() * 500); // Closer mountains
    let z = (Math.random() - 0.5) * 8000;
    mountain.position.set(x, mHeight / 2 - 50, z);
    mountain.rotation.y = Math.random() * Math.PI;
    mountain.matrixAutoUpdate = false;
    mountain.updateMatrix();
    scene.add(mountain);
    mountains.push(mountain);
}

const clouds = [];
const cloudGeo = new THREE.SphereGeometry(25, 7, 7);
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.8, fog: true });

for (let i = 0; i < 30; i++) {
    const cloudGroup = new THREE.Group();
    const numSpheres = 4 + Math.floor(Math.random() * 4);
    const cloudInstanced = new THREE.InstancedMesh(cloudGeo, cloudMat, numSpheres);
    const dummy = new THREE.Object3D();
    for (let j = 0; j < numSpheres; j++) {
        dummy.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 40);
        const s = 0.5 + Math.random() * 1.5;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        cloudInstanced.setMatrixAt(j, dummy.matrix);
    }
    cloudInstanced.matrixAutoUpdate = false;
    cloudInstanced.updateMatrix();
    cloudGroup.add(cloudInstanced);
    
    const side = Math.random() > 0.5 ? 1 : -1;
    let x = side * (100 + Math.random() * 1200);
    let y = 250 + Math.random() * 200;
    let z = (Math.random() - 0.5) * 4000;
    cloudGroup.position.set(x, y, z);
    cloudGroup.matrixAutoUpdate = false;
    cloudGroup.updateMatrix();
    scene.add(cloudGroup);
    clouds.push(cloudGroup);
}

const pineTrunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 5);
const pineLeavesGeo = new THREE.ConeGeometry(3, 8, 6);
const oakTrunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 6);
const oakLeavesGeo = new THREE.DodecahedronGeometry(3.5, 0);
const birchTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 5, 5);
const birchLeavesGeo = new THREE.IcosahedronGeometry(2.5, 0);

const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3623, flatShading: true });
const birchWoodMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, flatShading: true });
const pineLeavesMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, flatShading: true }); // soft teal-green
const oakLeavesMat = new THREE.MeshStandardMaterial({ color: 0xd97736, flatShading: true }); // warm autumn orange
const birchLeavesMat = new THREE.MeshStandardMaterial({ color: 0xe9c46a, flatShading: true }); // pale gold 

function createTree() {
    const group = new THREE.Group();
    const typeRoll = Math.random();
    let trunk, leaves;
    
    if (typeRoll < 0.33) {
        // Pine
        trunk = new THREE.Mesh(pineTrunkGeo, woodMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        leaves = new THREE.Mesh(pineLeavesGeo, pineLeavesMat);
        leaves.position.y = 5.5;
        leaves.castShadow = true;
    } else if (typeRoll < 0.66) {
        // Oak
        trunk = new THREE.Mesh(oakTrunkGeo, woodMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        leaves = new THREE.Mesh(oakLeavesGeo, oakLeavesMat);
        leaves.position.y = 6;
        leaves.castShadow = true;
    } else {
        // Birch
        trunk = new THREE.Mesh(birchTrunkGeo, birchWoodMat);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        leaves = new THREE.Mesh(birchLeavesGeo, birchLeavesMat);
        leaves.position.y = 6;
        leaves.castShadow = true;
    }
    
    group.add(trunk, leaves);
    const s = 0.8 + Math.random() * 1.5;
    group.scale.set(s, s, s);
    group.rotation.y = Math.random() * Math.PI * 2;
    
    trunk.matrixAutoUpdate = false;
    trunk.updateMatrix();
    leaves.matrixAutoUpdate = false;
    leaves.updateMatrix();
    group.matrixAutoUpdate = false;
    
    scene.add(group);
    return group;
}

// Initial Tree Scatter - Along the sides of the road
for (let i = 0; i < 250; i++) { 
    const tree = createTree();
    const side = Math.random() > 0.5 ? 1 : -1;
    let x = side * (12 + Math.random() * 60); // Keep them near the road
    let z = (Math.random() - 0.5) * 2600;
    tree.position.set(x, 0, z);
    tree.updateMatrix();
    environmentProps.push(tree);
}


// ==========================================
// 7. VAN MODEL (Relaxing Vehicle)
// ==========================================
const car = new THREE.Group();

const vanPaint = new THREE.MeshStandardMaterial({ color: 0x5599bb, roughness: 0.5, metalness: 0.1 });
const vanWhite = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7 });
const vanGlass = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.2, metalness: 0.8 });
const darkTrim = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });

// Lower Body
const vanBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 4.8), vanPaint);
vanBody.position.set(0, 0.9, 0); 
vanBody.castShadow = true;
car.add(vanBody);

// Upper Cabin
const vanCabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.0, 3.8), vanWhite);
vanCabin.position.set(0, 2.0, -0.2); 
vanCabin.castShadow = true;
car.add(vanCabin);

// Windshield
const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.8), vanGlass);
windshield.position.set(0, 2.0, -2.11); 
car.add(windshield);

// Rear Window
const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.8), vanGlass);
rearWindow.rotation.y = Math.PI;
rearWindow.position.set(0, 2.0, 1.71); 
car.add(rearWindow);

// Side Windows
const sideWindowGeo = new THREE.PlaneGeometry(3.0, 0.7);
const sideWindowL = new THREE.Mesh(sideWindowGeo, vanGlass);
sideWindowL.rotation.y = -Math.PI / 2;
sideWindowL.position.set(-0.96, 2.0, -0.2); 
car.add(sideWindowL);

const sideWindowR = new THREE.Mesh(sideWindowGeo, vanGlass);
sideWindowR.rotation.y = Math.PI / 2;
sideWindowR.position.set(0.96, 2.0, -0.2); 
car.add(sideWindowR);

// Bumpers
const bumperGeo = new THREE.BoxGeometry(2.1, 0.3, 0.3);
const frontBumper = new THREE.Mesh(bumperGeo, darkTrim);
frontBumper.position.set(0, 0.45, -2.4); 
car.add(frontBumper);

const rearBumper = new THREE.Mesh(bumperGeo, darkTrim);
rearBumper.position.set(0, 0.45, 2.4);
car.add(rearBumper);

// Headlights & Taillights
const headLightMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0 });
const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0 });

const hlGeo = new THREE.BoxGeometry(0.4, 0.3, 0.1);
const hlL = new THREE.Mesh(hlGeo, headLightMat);
hlL.position.set(-0.7, 0.9, -2.41);
const hlR = new THREE.Mesh(hlGeo, headLightMat);
hlR.position.set(0.7, 0.9, -2.41);
car.add(hlL, hlR);

const headLightSpotL = new THREE.SpotLight(0xffffee, 0, 300, Math.PI/4, 0.5, 1);
headLightSpotL.position.set(-0.7, 0.9, -2.5);
headLightSpotL.target.position.set(-0.7, 0, -30);
car.add(headLightSpotL, headLightSpotL.target);

const headLightSpotR = new THREE.SpotLight(0xffffee, 0, 300, Math.PI/4, 0.5, 1);
headLightSpotR.position.set(0.7, 0.9, -2.5);
headLightSpotR.target.position.set(0.7, 0, -30);
car.add(headLightSpotR, headLightSpotR.target);

const tlGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
const tlL = new THREE.Mesh(tlGeo, tailLightMat);
tlL.position.set(-0.8, 0.9, 2.41);
const tlR = new THREE.Mesh(tlGeo, tailLightMat);
tlR.position.set(0.8, 0.9, 2.41);
car.add(tlL, tlR);

// Wheels
const tireGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
tireGeo.rotateZ(Math.PI / 2);
const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.32, 8);
rimGeo.rotateZ(Math.PI / 2);
const rimMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.4 });

function createVanWheel() {
    const group = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    group.add(tire, rim);
    return group;
}

const frontLeftPivot = new THREE.Group();
frontLeftPivot.position.set(-1.0, 0.4, -1.6);
const frontLeftWheel = createVanWheel();
frontLeftPivot.add(frontLeftWheel);
car.add(frontLeftPivot);

const frontRightPivot = new THREE.Group();
frontRightPivot.position.set(1.0, 0.4, -1.6);
const frontRightWheel = createVanWheel();
frontRightPivot.add(frontRightWheel);
car.add(frontRightPivot);

const rearLeftWheel = createVanWheel();
rearLeftWheel.position.set(-1.0, 0.4, 1.6);
car.add(rearLeftWheel);

const rearRightWheel = createVanWheel();
rearRightWheel.position.set(1.0, 0.4, 1.6);
car.add(rearRightWheel);

scene.add(car);


// ==========================================
// 8. PHYSICS & INPUT (True 3D Movement)
// ==========================================
const keys = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.w = true;
    if (k === 's' || e.key === 'ArrowDown') keys.s = true;
    if (k === 'a' || e.key === 'ArrowLeft') keys.a = true;
    if (k === 'd' || e.key === 'ArrowRight') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') keys.w = false;
    if (k === 's' || e.key === 'ArrowDown') keys.s = false;
    if (k === 'a' || e.key === 'ArrowLeft') keys.a = false;
    if (k === 'd' || e.key === 'ArrowRight') keys.d = false;
});

const carPhysics = {
    speed: 0,
    maxSpeed: 30,       
    maxReverse: 10,
    acceleration: 8,
    braking: 20,
    friction: 2.0,      
    steerAngle: 0,      
    maxSteer: 0.6,
    steerSpeed: 3.5,
    heading: 0,         
    wheelBase: 3.2      
};

const rainGeo = new THREE.BufferGeometry();
const rainCount = 4000;
const rainPosArray = new Float32Array(rainCount * 3);
for(let i=0; i<rainCount*3; i+=3) {
    rainPosArray[i] = (Math.random() - 0.5) * 800;
    rainPosArray[i+1] = Math.random() * 400;
    rainPosArray[i+2] = (Math.random() - 0.5) * 800;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPosArray, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x99aaff, size: 0.8, transparent: true, opacity: 0, fog: true });
const rainMesh = new THREE.Points(rainGeo, rainMat);
scene.add(rainMesh);

let currentEvent = 'clear';
let eventTimer = 30; // Clear for 30s to start
let weatherTarget = 0;
let weatherFactor = 0;
let rainOpacityTarget = 0;
let fogNearTarget = 150;
let fogFarTarget = 1800;

const clock = new THREE.Clock();
let gameTime = 12.0; // Start at noon

function animate() {
    requestAnimationFrame(animate);
    
    let delta = clock.getDelta();
    if (delta > 0.05) delta = 0.05; 
    
    // --- WEATHER SYSTEM ---
    weatherFactor += (weatherTarget - weatherFactor) * delta * 0.2;
    scene.fog.near += (fogNearTarget - scene.fog.near) * delta * 0.2;
    scene.fog.far += (fogFarTarget - scene.fog.far) * delta * 0.2;
    
    eventTimer -= delta;
    if (eventTimer <= 0) {
        if (currentEvent === 'clear') {
            if (Math.random() > 0.5) {
                currentEvent = 'rain';
                rainOpacityTarget = 0.6;
                fogNearTarget = 100;
                fogFarTarget = 900;
                weatherTarget = 1.0;
                eventTimer = 20 + Math.random() * 20;
            } else {
                currentEvent = 'heavy_fog';
                rainOpacityTarget = 0;
                fogNearTarget = 50;
                fogFarTarget = 300;
                weatherTarget = 1.0;
                eventTimer = 15 + Math.random() * 15;
            }
        } else {
            currentEvent = 'clear';
            rainOpacityTarget = 0;
            fogNearTarget = 150;
            fogFarTarget = 1800;
            weatherTarget = 0;
            eventTimer = 30 + Math.random() * 40;
        }
    }
    
    if (rainMat.opacity > 0.01 || rainOpacityTarget > 0) {
        rainMat.opacity += (rainOpacityTarget - rainMat.opacity) * delta * 0.5;
        const positions = rainGeo.attributes.position.array;
        for (let i = 1; i < rainCount * 3; i += 3) {
            positions[i] -= 400 * delta;
            if (positions[i] < 0) positions[i] = 400;
        }
        rainGeo.attributes.position.needsUpdate = true;
        rainMesh.position.set(camera.position.x, 0, camera.position.z);
    }

    // --- DAY/NIGHT CYCLE ---
    let timeSpeed = 1.0; 
    const baseSunAngle = ((gameTime % 24) - 6) / 12 * Math.PI;
    const baseSunHeight = Math.sin(baseSunAngle);
    if (baseSunHeight > 0) {
        timeSpeed = 0.2 + 0.8 * Math.pow(baseSunHeight, 1.5);
    } else {
        timeSpeed = 0.2 + 2.3 * Math.pow(Math.abs(baseSunHeight), 1.5);
    }
    gameTime += delta * timeSpeed; 
    
    const timeOfDay = (gameTime % 24); 
    const sunAngle = ((timeOfDay - 6) / 12) * Math.PI;
    const sunDist = 900;
    
    // Celestial bodies placed mostly in front of the driver for a scenic view
    sun.position.set(
        camera.position.x + Math.cos(sunAngle) * sunDist * 0.5,
        Math.sin(sunAngle) * sunDist,
        camera.position.z - sunDist * 0.8
    );
    moon.position.set(
        camera.position.x - Math.cos(sunAngle) * sunDist * 0.5,
        -Math.sin(sunAngle) * sunDist,
        camera.position.z - sunDist * 0.8
    );
    
    const sunHeight = Math.sin(sunAngle);
    let skyColor, lightColor, lightIntensity, ambientIntensity;
    
    if (sunHeight > 0.2) {
        skyColor = new THREE.Color(0x3AA3F7);
        lightColor = new THREE.Color(0xfff5e6);
        lightIntensity = 1.6;
        ambientIntensity = 0.6;
    } else if (sunHeight > -0.2) {
        const t = (sunHeight + 0.2) / 0.4; 
        if (t > 0.5) {
            const t2 = (t - 0.5) * 2;
            skyColor = new THREE.Color(0xff5e3a).lerp(new THREE.Color(0x3AA3F7), t2);
            lightColor = new THREE.Color(0xff7700).lerp(new THREE.Color(0xfff5e6), t2);
        } else {
            const t2 = t * 2;
            skyColor = new THREE.Color(0x02020a).lerp(new THREE.Color(0xff5e3a), t2);
            lightColor = new THREE.Color(0x5566aa).lerp(new THREE.Color(0xff7700), t2);
        }
        lightIntensity = 0.15 + 1.45 * t;
        ambientIntensity = 0.15 + 0.45 * t;
    } else {
        skyColor = new THREE.Color(0x02020a);
        lightColor = new THREE.Color(0x4455aa);
        lightIntensity = 0.15;
        ambientIntensity = 0.15;
    }
    
    const overcastColor = new THREE.Color(0x556677);
    if (weatherFactor > 0 && sunHeight > -0.1) {
        skyColor.lerp(overcastColor, weatherFactor * 0.8);
        lightIntensity *= (1.0 - weatherFactor * 0.6);
        ambientIntensity *= (1.0 - weatherFactor * 0.3);
    }

    scene.background = skyColor;
    scene.fog.color = skyColor;
    dirLight.color = lightColor;
    dirLight.intensity = lightIntensity;
    ambientLight.intensity = ambientIntensity;

    // Headlights on at night or when it's dark due to weather
    if (sunHeight < 0 || weatherFactor > 0.6) {
        headLightMat.emissiveIntensity = 3.0;
        tailLightMat.emissiveIntensity = 2.0;
        headLightSpotL.intensity = 2.0;
        headLightSpotR.intensity = 2.0;
    } else {
        headLightMat.emissiveIntensity = 0;
        tailLightMat.emissiveIntensity = 0;
        headLightSpotL.intensity = 0;
        headLightSpotR.intensity = 0;
    }
    
    // Stars fade in at night
    if (sunHeight < -0.1) {
        starsMat.opacity = Math.min(1.0, starsMat.opacity + delta * 0.5);
    } else {
        starsMat.opacity = Math.max(0.0, starsMat.opacity - delta * 0.5);
    }
    starsMesh.position.set(camera.position.x, 0, camera.position.z);
    
    // Clouds fade in during day
    if (sunHeight > 0.1) {
        cloudMat.opacity = Math.min(0.9, cloudMat.opacity + delta * 0.3);
    } else {
        cloudMat.opacity = Math.max(0.0, cloudMat.opacity - delta * 0.5);
    }
    
    // --- PHYSICS & STEERING ---
    let engineForce = 0;
    if (keys.w) engineForce = carPhysics.acceleration;
    if (keys.s) engineForce = -carPhysics.braking;
    
    let friction = carPhysics.friction * Math.sign(carPhysics.speed);
    let drag = 0.01 * carPhysics.speed * Math.abs(carPhysics.speed);
    
    if (Math.abs(carPhysics.speed) < 0.1 && engineForce === 0) {
        carPhysics.speed = 0;
        friction = 0;
        drag = 0;
    }
    
    carPhysics.speed += (engineForce - friction - drag) * delta;
    carPhysics.speed = Math.max(-carPhysics.maxReverse, Math.min(carPhysics.maxSpeed, carPhysics.speed));
    
    let targetSteer = 0;
    if (keys.a) targetSteer = carPhysics.maxSteer;
    if (keys.d) targetSteer = -carPhysics.maxSteer;
    
    carPhysics.steerAngle += (targetSteer - carPhysics.steerAngle) * carPhysics.steerSpeed * delta;
    
    if (Math.abs(carPhysics.speed) > 0.1) {
        const turnRadius = carPhysics.wheelBase / Math.tan(carPhysics.steerAngle);
        const angularVelocity = carPhysics.speed / turnRadius;
        carPhysics.heading += angularVelocity * delta;
    }
    
    // Clamp heading to force it to remain an endless road game
    const maxHeading = Math.PI / 4; // 45 degrees max turn
    carPhysics.heading = Math.max(-maxHeading, Math.min(maxHeading, carPhysics.heading));
    
    car.rotation.y = carPhysics.heading;
    
    car.position.x -= Math.sin(carPhysics.heading) * carPhysics.speed * delta;
    car.position.z -= Math.cos(carPhysics.heading) * carPhysics.speed * delta;
    
    // Soft invisible wall to keep player near the road
    const wallLimit = 13;
    if (car.position.x < -wallLimit) {
        car.position.x = -wallLimit;
        if (carPhysics.heading > 0) carPhysics.heading *= (1.0 - 5.0 * delta); // Push back towards 0
    }
    if (car.position.x > wallLimit) {
        car.position.x = wallLimit;
        if (carPhysics.heading < 0) carPhysics.heading *= (1.0 - 5.0 * delta); // Push back towards 0
    }

    // Floating-point precision reset (Fixes the "lag/packet loss" shaking effect)
    if (car.position.z < -2000) {
        car.position.z += 2000;
        camera.position.z += 2000;
        cameraTarget.z += 2000;
        for (let i = 0; i < roads.length; i++) { roads[i].position.z += 2000; roads[i].updateMatrix(); }
        for (let i = 0; i < environmentProps.length; i++) { environmentProps[i].position.z += 2000; environmentProps[i].updateMatrix(); }
        for (let i = 0; i < mountains.length; i++) { mountains[i].position.z += 2000; mountains[i].updateMatrix(); }
        for (let i = 0; i < clouds.length; i++) { clouds[i].position.z += 2000; clouds[i].updateMatrix(); }
    }
    
    let targetPitch = 0;
    if (engineForce > 0 && carPhysics.speed > 0) targetPitch = -0.015; 
    if (engineForce < 0 && carPhysics.speed > 0) targetPitch = 0.03;  
    car.rotation.order = 'YXZ';
    car.rotation.x += (targetPitch - car.rotation.x) * delta * 6;
    car.rotation.z = 0; 
    
    // --- VISUAL POLISH ---
    frontLeftPivot.rotation.y = carPhysics.steerAngle;
    frontRightPivot.rotation.y = carPhysics.steerAngle;
    
    const wheelRot = (carPhysics.speed * delta) / (2 * Math.PI * 0.4) * Math.PI * 2;
    frontLeftWheel.rotation.x -= wheelRot;
    frontRightWheel.rotation.x -= wheelRot;
    rearLeftWheel.rotation.x -= wheelRot;
    rearRightWheel.rotation.x -= wheelRot;
    
    // --- INFINITE WORLD LOOPING ---
    ground.position.x = Math.floor(camera.position.x);
    ground.position.z = Math.floor(camera.position.z);
    ground.updateMatrix();
    
    // Loop road
    for (let i = 0; i < roads.length; i++) {
        const road = roads[i];
        const offset = road.position.z - car.position.z;
        if (offset > 150) {
            road.position.z -= roadLength * roads.length;
            road.updateMatrix();
        } else if (offset < -(roadLength * roads.length - 150)) {
            road.position.z += roadLength * roads.length;
            road.updateMatrix();
        }
    }
    
    // Loop trees like a treadmill (along Z only)
    for (let i = 0; i < environmentProps.length; i++) {
        const tree = environmentProps[i];
        const offset = tree.position.z - car.position.z;
        
        if (offset > 200) {
            tree.position.z -= 2600;
            const side = Math.random() > 0.5 ? 1 : -1;
            tree.position.x = side * (12 + Math.random() * 60);
            tree.updateMatrix();
        } else if (offset < -2400) {
            tree.position.z += 2600;
            const side = Math.random() > 0.5 ? 1 : -1;
            tree.position.x = side * (12 + Math.random() * 60);
            tree.updateMatrix();
        }
    }
    
    // Loop mountains
    for (let i = 0; i < mountains.length; i++) {
        const mountain = mountains[i];
        const offset = mountain.position.z - car.position.z;
        if (offset > 1500) {
            mountain.position.z -= 8000;
            const side = Math.random() > 0.5 ? 1 : -1;
            mountain.position.x = side * (1500 + Math.random() * 1500);
            mountain.updateMatrix();
        } else if (offset < -6500) {
            mountain.position.z += 8000;
            const side = Math.random() > 0.5 ? 1 : -1;
            mountain.position.x = side * (1500 + Math.random() * 1500);
            mountain.updateMatrix();
        }
    }
    
    // Loop clouds
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const offset = cloud.position.z - car.position.z;
        if (offset > 1500) {
            cloud.position.z -= 4000;
            const side = Math.random() > 0.5 ? 1 : -1;
            cloud.position.x = side * (100 + Math.random() * 1200);
            cloud.updateMatrix();
        } else if (offset < -2500) {
            cloud.position.z += 4000;
            const side = Math.random() > 0.5 ? 1 : -1;
            cloud.position.x = side * (100 + Math.random() * 1200);
            cloud.updateMatrix();
        }
    }
    
    // --- CAMERA FOLLOW ---
    const camOffset = new THREE.Vector3(0, 4.5, 9); 
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carPhysics.heading);
    
    const targetCamPos = car.position.clone().add(camOffset);
    // Frame-rate independent lerp for smoother tracking
    const lerpFactor = 1.0 - Math.pow(0.001, delta);
    camera.position.lerp(targetCamPos, lerpFactor); 
    
    const lookAhead = new THREE.Vector3(0, 1.5, -8); 
    lookAhead.applyAxisAngle(new THREE.Vector3(0, 1, 0), carPhysics.heading);
    const targetLookAt = car.position.clone().add(lookAhead);
    
    cameraTarget.lerp(targetLookAt, lerpFactor);
    camera.lookAt(cameraTarget);
    
    dirLight.position.set(camera.position.x + 50, camera.position.y + 100, camera.position.z - 50);
    dirLight.target = car; 
    
    renderer.render(scene, camera);
}

animate();
