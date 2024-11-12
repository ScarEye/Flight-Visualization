import { Cesium } from "https://cesium.com/downloads/cesiumjs/releases/1.123/Build/Cesium/Cesium.js";

// Set up Cesium ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMWJhM2VhNy00NTY2LTRmN2UtYTU3MS0yZDBkZjgyMWMyZTciLCJpZCI6MjU0NzAyLCJpYXQiOjE3MzE0MTI3MjZ9.y9ZGaBs3bTLo6muQUPGVGpgswAhb1C5D8fTRP8KHfE0';

// Initialize the Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

// Load OpenStreetMap 3D buildings as async
async function loadOsmBuildings() {
  const osmBuildings = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildings);
}
loadOsmBuildings();

// Function to create a curved flight path
function createCurvedFlightPath(start, end, maxHeight, numPoints = 100) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const longitude = Cesium.CesiumMath.lerp(start.longitude, end.longitude, t);
    const latitude = Cesium.CesiumMath.lerp(start.latitude, end.latitude, t);
    const height = (1 - Math.pow(2 * t - 1, 2)) * maxHeight;
    points.push({ longitude, latitude, height });
  }
  return points;
}

const startPos = { longitude: 77.10262546930659, latitude: 28.56129819077646, height: 0 };
const endPos = { longitude: 77.70795001282222, latitude: 13.201259466639428, height: 0 };
const maxHeight = 15000;

const flightData = createCurvedFlightPath(startPos, endPos, maxHeight);
const timeStepInSeconds = 500;
const totalSeconds = timeStepInSeconds * (flightData.length - 1);
const start = Cesium.JulianDate.fromIso8601("2020-03-09T23:10:00Z");
const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
viewer.clock.multiplier = 50;
viewer.clock.shouldAnimate = true;

const positionProperty = new Cesium.SampledPositionProperty();

for (let i = 0; i < flightData.length; i++) {
  const dataPoint = flightData[i];
  const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
  const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
  positionProperty.addSample(time, position);

  viewer.entities.add({
    description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
    position: position,
    point: { pixelSize: i === 0 ? 25 : 15, color: Cesium.Color.GREEN },
  });
}

// Pulsing points function for start and end points
function createPulsingPoint(coords, color) {
  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, coords.height),
    ellipse: new Cesium.EllipseGraphics({
      semiMajorAxis: new Cesium.CallbackProperty((time) => 500 + Math.abs(Math.sin(Cesium.JulianDate.secondsDifference(time, start) * 0.05)) * 25000, false),
      semiMinorAxis: new Cesium.CallbackProperty((time) => 500 + Math.abs(Math.sin(Cesium.JulianDate.secondsDifference(time, start) * 0.05)) * 25000, false),
      material: new Cesium.ColorMaterialProperty(color.withAlpha(0.5))
    })
  });
}

createPulsingPoint(startPos, Cesium.Color.RED);
createPulsingPoint(endPos, Cesium.Color.BLUE);

// Add hover interaction to highlight points
const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
let highlightedEntity = null;

handler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.endPosition);
  if (Cesium.defined(pickedObject) && pickedObject.id) {
    const entity = pickedObject.id;
    if (!highlightedEntity || highlightedEntity !== entity) {
      if (highlightedEntity) highlightedEntity.point.color = Cesium.Color.GREEN;
      entity.point.color = Cesium.Color.BLUE;
      highlightedEntity = entity;
    }
  } else {
    if (highlightedEntity) highlightedEntity.point.color = Cesium.Color.GREEN;
    highlightedEntity = null;
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction(() => {
  if (highlightedEntity) highlightedEntity.point.color = Cesium.Color.GREEN;
  highlightedEntity = null;
}, Cesium.ScreenSpaceEventType.MOUSE_LEAVE);

// Load airplane model asynchronously
async function loadModel() {
  const airplaneUri = await Cesium.IonResource.fromAssetId(2819852);
  const airplaneEntity = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: start, stop: stop })]),
    position: positionProperty,
    model: { uri: airplaneUri },
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    path: new Cesium.PathGraphics({ width: 3 })
  });
  viewer.trackedEntity = airplaneEntity;
}
loadModel();
