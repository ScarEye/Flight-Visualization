export function createCurvedFlightPath(viewer, start, end, maxHeight, numPoints = 100) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const longitude = Cesium.Math.lerp(start.longitude, end.longitude, t);
    const latitude = Cesium.Math.lerp(start.latitude, end.latitude, t);
    const height = (1 - Math.pow(2 * t - 1, 2)) * maxHeight;
    points.push({ longitude, latitude, height });
  }

  const timeStepInSeconds = 500;
  const totalSeconds = timeStepInSeconds * (points.length - 1);
  const startTime = Cesium.JulianDate.fromIso8601("2020-03-09T23:10:00Z");
  const stopTime = Cesium.JulianDate.addSeconds(startTime, totalSeconds, new Cesium.JulianDate());

  viewer.clock.startTime = startTime.clone();
  viewer.clock.stopTime = stopTime.clone();
  viewer.clock.currentTime = startTime.clone();
  viewer.timeline.zoomTo(startTime, stopTime);
  viewer.clock.multiplier = 50;
  viewer.clock.shouldAnimate = true;

  const positionProperty = new Cesium.SampledPositionProperty();

  for (let i = 0; i < points.length; i++) {
    const dataPoint = points[i];
    const time = Cesium.JulianDate.addSeconds(startTime, i * timeStepInSeconds, new Cesium.JulianDate());
    const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
    positionProperty.addSample(time, position);

    viewer.entities.add({
      description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
      position: position,
      point: { pixelSize: 15, color: Cesium.Color.GREEN }
    });
  }
}
