var CameraRegionController = require('./CameraRegionController');
var PanZoomRegion = require('./PanZoomRegion');
var Signal = require('signals').Signal;
var gsap = require('gsap');
var INTERNAL = 0,
	EXTERNAL = 1;

function Controller(opts) {
	var camera = opts.camera;
	var fovMin = opts.fovMin || 50;
	var fovMax = opts.fovMax || 60;
	var panSpeed = panSpeed || 0.2;
	var zoomMax = zoomMax || 0.2;

	var zoomSignal = new Signal();

	var panZoomRegion = new PanZoomRegion({
		camera: camera,
		zoomMax: zoomMax,
		autoSetCamera: opts.autoSetCamera
	});


	var regionController = new CameraRegionController({
		pointers: opts.pointers,
		mouseWheel: opts.mouseWheel
	});

	function _panMovement(x, y) {
		camera.position.x += x * panSpeed;
		camera.position.y += -y * panSpeed;
	}
	
	var panMovement = opts.panMap || _panMovement;

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
	var oldZoomFov = 0;
	function zoomFov(x, y, zoom) {
		camera.fov = camera.fov * zoom;
		if(camera.fov < fovMin) changeZoomMode(INTERNAL);
	
		camera.fov = Math.max(1, Math.min(fovMax, camera.fov));

		// console.log('fov', camera.fov);
		camera.updateProjectionMatrix();
		if(oldZoomFov != camera.fov) zoomSignal.dispatch();
		oldZoomFov = camera.fov;
	}

	var oldZoomPan = 0;
	function zoomRegion(x, y, zoom, invertOut) {
		if(invertOut && zoom > 1) {
			x = fullWidth - x;
			y = fullHeight - y;
		}
		panZoomRegion.zoom(x, y, zoom);
		if(panZoomRegion.zoomValue > 1) changeZoomMode(EXTERNAL);
		panZoomRegion.zoomValue = Math.min(1, panZoomRegion.zoomValue);
		// console.log('regionZoom', panZoomRegion.zoomValue);
		if(oldZoomPan != panZoomRegion.zoomValue) zoomSignal.dispatch();
		oldZoomPan = panZoomRegion.zoomValue;
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

	function setState(state) {
		regionController.setState(state);
	}

	this.animationValue = 0;
	this.reset = function(animate) {
		gsap.killTweensOf(camera);
		gsap.killTweensOf(this);
		if(animate) {
			this.animationValue = 0;
			gsap.to(camera, 2, {
				fov: fovMax,
				onUpdate: function() {
					zoomFov(
						fullWidth * .5,
						fullHeight * .5,
						1
					);
				}
			})
			gsap.to(this, 2, {
				animationValue: 1,
				onUpdate: function() {
					zoomRegion(
						fullWidth * .5,
						fullHeight * .5,
						1 + (this.animationValue * (1-panZoomRegion.zoomValue)) + .00001
					);
				},
				onUpdateScope: this
			});
		} else {
			for(var i = 0; i < 3; i++) {
				zoomRegion(
					fullWidth * .5,
					fullHeight * .5,
					1 + (1-panZoomRegion.zoomValue) + .00001
				);

				camera.fov = fovMax;
				zoomFov(
					fullWidth * .5,
					fullHeight * .5,
					1
				);
			}

		}
	}

	this.setSize = setSize;
	this.precomposeViewport = precomposeViewport;
	this.panSignal = regionController.panSignal;
	this.zoomSignal = zoomSignal;
	this.setState = setState;
	this.onPointerDown = regionController.onPointerDown;
	this.isPanning = regionController.isPanning;
}
module.exports = Controller;