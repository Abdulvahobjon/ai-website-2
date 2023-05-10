document.querySelectorAll('.toggleMenu').forEach((btn) => {
  if (btn) {
    btn.addEventListener('click', () => {
      document.querySelector('.menu').classList.toggle('-translate-x-full')
      document.querySelector('.overlay').classList.toggle('hidden')
    })
  }
})

// =============== accordion ===============
const accordionBtn = document.querySelectorAll(".accordion .accordionBtn");
accordionBtn.forEach((button) => {
  button.addEventListener("click", () => {
    let content = button.nextElementSibling;
    let active = document.querySelector(".accordion .accordion-wrapper.active");

    console.log(content);

    if (content) {
      if (active) {
        if (button.parentElement.classList.contains("active")) {
          button.parentElement.classList.remove("active");
          active.lastElementChild.style.height = "0";
          button.querySelector("svg").style.transform = "rotate(0deg)";
        } else {
          active.classList.remove("active");
          active.querySelector("svg").style.transform = "rotate(0)";
          active.lastElementChild.style.height = "0";
          button.parentElement.classList.add("active");
          content.style.height = content.scrollHeight + "px";
          button.querySelector("svg").style.transform = "rotate(180deg)";
        }
      }
      else {
        button.parentElement.classList.add("active");
        content.style.height = content.scrollHeight + "px";
        button.querySelector("svg").style.transform = "rotate(180deg)";
      }
    }
  });
});


var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, 320);
document.getElementById('animation').appendChild(renderer.domElement);

var onRenderFcts = [];
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.z = 15;
camera.position.y = 2;
scene.fog = new THREE.Fog(0x000, 0, 45);

(function () {
  var light = new THREE.AmbientLight(0x202020);
  scene.add(light);
  var light = new THREE.DirectionalLight('white', 5);
  light.position.set(0.5, 0.0, 2);
  scene.add(light);
  var light = new THREE.DirectionalLight('white', 0.75 * 2);
  light.position.set(-0.5, -0.5, -2);
  scene.add(light);
})();

var heightMap = THREEx.Terrain.allocateHeightMap(256, 256);
THREEx.Terrain.simplexHeightMap(heightMap);
var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);
var material = new THREE.MeshBasicMaterial({
  wireframe: true
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.lookAt(new THREE.Vector3(0, 1, 0));
mesh.scale.y = 3.5;
mesh.scale.x = 3;
mesh.scale.z = 0.20;
mesh.scale.multiplyScalar(10);

// Flags for arrow keys
var keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

// Event listeners for key events
document.addEventListener('keydown', function (event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = true;
  }
});
document.addEventListener('keyup', function (event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = false;
  }
});

function update() {
  if (keys.ArrowLeft) {
    // Rotate the mesh to the left
    mesh.rotation.z += 0.02;
  }
  if (keys.ArrowRight) {
    // Rotate the mesh to the right
    mesh.rotation.z -= 0.02;
  }
  if (keys.ArrowUp) {
    // Zoom in
    camera.position.z -= 0.3;
  }
  if (keys.ArrowDown) {
    // Zoom out
    camera.position.z += 0.3;
  }
}

// Create 8 additional terrain meshes surrounding the central one
var surroundingMeshes = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    if (x === 0 && y === 0) continue;

    var surroundingMesh = mesh.clone();
    surroundingMesh.position.x = x * mesh.scale.x * 256;
    surroundingMesh.position.y = y * mesh.scale.y * 256;
    scene.add(surroundingMesh);
    surroundingMeshes.push(surroundingMesh);
  }
}

function updatePosition() {
  // Update the position of surrounding meshes based on the central mesh's position
  surroundingMeshes.forEach(function (surroundingMesh) {
    surroundingMesh.position.z = mesh.position.z;
    surroundingMesh.rotation.z = mesh.rotation.z;
  });
}

onRenderFcts.push(function () {
  update();
  updatePosition();
  renderer.render(scene, camera);
});



var lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
  requestAnimationFrame(animate);
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  onRenderFcts.forEach(function (onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});
// Variable to keep track of whether the mouse is being dragged
var isDragging = false;

// Event listeners for mouse events
document.addEventListener('mousedown', function () {
  isDragging = true;
});
document.addEventListener('mousemove', function (event) {
  if (isDragging) {
    // Rotate the mesh based on mouse movement
    mesh.rotation.z += event.movementX * 0.01;
    // Zoom in and out based on dragging up and down
    camera.position.z -= event.movementY * 0.05;
  }
});
document.addEventListener('mouseup', function () {
  isDragging = false;
});