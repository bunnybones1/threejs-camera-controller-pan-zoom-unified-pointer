var loadAndRunScripts = require('loadandrunscripts');
var INTERNAL = 0,
	EXTERNAL = 1;

function onReady() {
	var View = require('threejs-managed-view').View;
	var Pointers = require('input-unified-pointers');
	var MouseWheel = require('input-mousewheel');
	var PanZoomRegion = require('./PanZoomRegion');
	var Controller = require('./');

	var view = new View();
	view.renderManager.skipFrames = 10;
	var scene = view.scene;
	var camera = view.camera;
	camera.rotation.set(0, 0, 0);
	var pointers = new Pointers(view.canvas);
	var fovMin = 30;
	var fovMax = 60;

	var total = 1000;
	var range = 100;
	var rangeHalf = range * .5;
	var ballGeometry = new THREE.SphereGeometry(.5, 32, 16);
	for (var i = 0; i < total; i++) {
		var ball = new THREE.Mesh(ballGeometry);
		ball.position.set(
			Math.random() * range - rangeHalf,
			Math.random() * range - rangeHalf,
			Math.random() * range - rangeHalf
		);
		scene.add(ball);
	};


	var controller = new Controller({
		pointers: pointers,
		mouseWheel: MouseWheel
	});

	controller.zoomSignal.add(function(delta) {

	});

	var panSpeed = .2;

	var panZoomRegion = new PanZoomRegion(camera);

	function panMovement(x, y) {
		camera.position.x += x * panSpeed;
		camera.position.y += -y * panSpeed;
	}

	function panRegion(x, y) {
		panZoomRegion.pan(x, y);
		camera.updateProjectionMatrix();
	}

	controller.panSignal.add(panMovement);

	var currentZoomMode = EXTERNAL;
	controller.zoomSignal.add(zoomFov);

	function changeZoomMode(mode) {
		if(currentZoomMode === mode) return;
		switch(mode) {
			case EXTERNAL:
				controller.zoomSignal.remove(zoomRegion);
				controller.zoomSignal.add(zoomFov);
				controller.panSignal.remove(panRegion);
				controller.panSignal.add(panMovement);
				break;
			case INTERNAL:
				controller.zoomSignal.remove(zoomFov);
				controller.zoomSignal.add(zoomRegion);
				controller.panSignal.remove(panMovement);
				controller.panSignal.add(panRegion);
				break;
		}
		currentZoomMode = mode;
	}
	function zoomFov(x, y, zoom) {
		camera.fov = camera.fov * zoom;
		if(camera.fov < fovMin) changeZoomMode(INTERNAL);
	
		camera.fov = Math.max(1, Math.min(fovMax, camera.fov));

		console.log('fov', camera.fov);
		camera.updateProjectionMatrix();
	}

	function zoomRegion(x, y, zoom) {
		panZoomRegion.zoom(x, y, zoom);
		if(panZoomRegion.zoomValue > 1) changeZoomMode(EXTERNAL);
		panZoomRegion.zoomValue = Math.min(1, panZoomRegion.zoomValue);
		console.log('regionZoom', panZoomRegion.zoomValue);
	}

	view.onResizeSignal.add(panZoomRegion.setSize);
	var size = view.getSize();
	panZoomRegion.setSize(size.width, size.height);


	view.renderManager.onEnterFrame.add(function(){
	})

}
loadAndRunScripts([
		'bower_components/three.js/three.js'
	],
	onReady
);