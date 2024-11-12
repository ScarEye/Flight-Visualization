import { createCurvedFlightPath } from './flightPath.js';
import { createPulsingPoint } from './hoverInteraction.js';
import { loadModel } from './modelLoader.js';

Cesium.Ion.defaultAccessToken = 'your-access-token';

const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

const osmBuildings = await Cesium.createOsmBuildingsAsync();
viewer.scene.primitives.add(osmBuildings);

const startPos = { longitude: 77.10262546930659, latitude: 28.56129819077646, height: 0 };
const endPos = { longitude: 77.70795001282222, latitude: 13.201259466639428, height: 0 };
const maxHeight = 15000;

// Create the flight path
createCurvedFlightPath(viewer, startPos, endPos, maxHeight);

// Create pulsing points at start and end positions
createPulsingPoint(viewer, startPos, Cesium.Color.RED);
createPulsingPoint(viewer, endPos, Cesium.Color.BLUE);

// Load the airplane model
loadModel(viewer);
