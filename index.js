var CameraRegionController = require('./CameraRegionController');
var PanZoomRegion = require('./PanZoomRegion');

var INTERNAL = 0,
	EXTERNAL = 1;

function Controller(opts) {
	var camera = opts.camera;
	var fovMin = opts.fovMin || 50;
	var fovMax = opts.fovMax || 60;
	var panSpeed = panSpeed || .2;


	var panZoomRegion = new PanZoomRegion(camera);


	var regionController = new CameraRegionController({
		pointers: opts.pointers,
		mouseWheel: opts.mouseWheel
	});

	function panMovement(x, y) {
		camera.position.x += x * panSpeed;
		camera.position.y += -y * panSpeed;
	}

	function panRegion(x, y) {
		panZoomRegion.pan(x, y);
		camera.updateProjectionMatrix();
	}

	regionController.panSignal.add(panMovement);

	var currentZoomMode = EXTERNAL;
	regionController.zoomSignal.add(zoomFov);

	function changeZoomMode(mode) {
		if(currentZoomMode === mode) return;
		switch(mode) {
			case EXTERNAL:
				regionController.zoomSignal.remove(zoomRegion);
				regionController.zoomSignal.add(zoomFov);
				regionController.panSignal.remove(panRegion);
				regionController.panSignal.add(panMovement);
				break;
			case INTERNAL:
				regionController.zoomSignal.remove(zoomFov);
				regionController.zoomSignal.add(zoomRegion);
				regionController.panSignal.remove(panMovement);
				regionController.panSignal.add(panRegion);
				break;
		}
		currentZoomMode = mode;
	}
	function zoomFov(x, y, zoom) {
		camera.fov = camera.fov * zoom;
		if(camera.fov < fovMin) changeZoomMode(INTERNAL);
	
		camera.fov = Math.max(1, Math.min(fovMax, camera.fov));

		// console.log('fov', camera.fov);
		camera.updateProjectionMatrix();
	}

	function zoomRegion(x, y, zoom, invertOut) {
		if(invertOut && zoom > 1) {
			x = fullWidth - x;
			y = fullHeight - y;
		}
		panZoomRegion.zoom(x, y, zoom);
		if(panZoomRegion.zoomValue > 1) changeZoomMode(EXTERNAL);
		panZoomRegion.zoomValue = Math.min(1, panZoomRegion.zoomValue);
		// console.log('regionZoom', panZoomRegion.zoomValue);
	}

	function precomposeViewport(otherCamera){
		panZoomRegion.precomposeViewport(otherCamera);
	}

	var fullWidth, fullHeight;
	function setSize(w, h) {
		fullWidth = w;
		fullHeight = h;
		panZoomRegion.setSize(w, h);
	}


	this.setSize = setSize;
	this.precomposeViewport = precomposeViewport;
}
module.exports = Controller;