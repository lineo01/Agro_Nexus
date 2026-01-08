// map3D.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(document.getElementById('mapContainer').clientWidth, 320);
document.getElementById('mapContainer').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// Terrain using PlaneGeometry + Perlin Noise
const width = 50, height = 50, segments = 50;
const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
geometry.rotateX(-Math.PI / 2);

// Generate hills using Math.random (can later replace with perlin noise)
for (let i = 0; i < geometry.vertices.length; i++) {
  geometry.vertices[i].y = Math.random() * 5; // hill height
}

const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50, wireframe: false, flatShading: true });
const terrain = new THREE.Mesh(geometry, material);
scene.add(terrain);

camera.position.set(30, 20, 30);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
