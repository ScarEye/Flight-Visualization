export async function loadModel(viewer) {
  const airplaneUri = await Cesium.IonResource.fromAssetId(2819852);
  const positionProperty = new Cesium.SampledPositionProperty();

  const airplaneEntity = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: viewer.clock.startTime, stop: viewer.clock.stopTime })]),
    position: positionProperty,
    model: { uri: airplaneUri },
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),
    path: new Cesium.PathGraphics({ width: 3 })
  });

  viewer.trackedEntity = airplaneEntity;
}
