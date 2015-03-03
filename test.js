var loadAndRunScripts = require('loadandrunscripts');

function onReady() {
	var View = require('threejs-managed-view').View;
	var Pointers = require('input-unified-pointers');
	var MouseWheel = require('input-mousewheel');
	var Controller = require('./');

	var view = new View();
	view.renderer.setClearColor(0xffafaf);
	view.renderManager.skipFrames = 10;
	var scene = view.scene;
	var camera = view.camera;
	camera.rotation.set(0, 0, 0);

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

	var pointers = new Pointers(view.canvas);

	var controller = new Controller({
		camera: camera,
		fovMin: 50,
		fovMax: 60,
		panSpeed: .2,
		pointers: pointers,
		mouseWheel: MouseWheel,
		autoSetCamera: false
	});
	controller.setState(true);

	view.onResizeSignal.add(controller.setSize);
	var size = view.getSize();
	controller.setSize(size.width, size.height);

	var otherCamera = new THREE.PerspectiveCamera();
	otherCamera.updateProjectionMatrix();

	function setOtherCameraSize(w, h) {
		otherCamera.setViewOffset(
			w, 
			h, 
			w * 0.25, 
			h * 0.25, 
			w * 0.5, 
			h * 0.5
		);
	}
	setOtherCameraSize(size.width, size.height);
	view.onResizeSignal.add(setOtherCameraSize);

	view.renderManager.onEnterFrame.add(function(){
		controller.precomposeViewport(otherCamera);
	})

}
loadAndRunScripts([
		'bower_components/three.js/three.js'
	],
	onReady
);