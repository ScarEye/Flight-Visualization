export function createPulsingPoint(viewer, coords, color) {
  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, coords.height),
    ellipse: new Cesium.EllipseGraphics({
      semiMajorAxis: new Cesium.CallbackProperty((time, result) => {
        return 500 + Math.abs(Math.sin(Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime) * 0.05)) * 25000;
      }, false),
      semiMinorAxis: new Cesium.CallbackProperty((time, result) => {
        return 500 + Math.abs(Math.sin(Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime) * 0.05)) * 25000;
      }, false),
      material: new Cesium.ColorMaterialProperty(color.withAlpha(0.5))
    })
  });
}

export function setupHoverInteraction(viewer) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  let highlightedEntity = null;

  handler.setInputAction(function (movement) {
    const pickedObject = viewer.scene.pick(movement.endPosition);
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id;
      if (!highlightedEntity || highlightedEntity !== entity) {
        if (highlightedEntity) {
          highlightedEntity.point.color = Cesium.Color.GREEN;
        }
        entity.point.color = Cesium.Color.BLUE;
        highlightedEntity = entity;
      }
    } else {
      if (highlightedEntity) {
        highlightedEntity.point.color = Cesium.Color.GREEN;
      }
      highlightedEntity = null;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function () {
    if (highlightedEntity) {
      highlightedEntity.point.color = Cesium.Color.GREEN;
    }
    highlightedEntity = null;
  }, Cesium.ScreenSpaceEventType.MOUSE_LEAVE);
}
