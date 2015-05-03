function PanZoomRegion(opts) {

	var camera = opts.camera;
	var autoSetCamera = opts.autoSetCamera !== false;

	this.zoomValue = 1;

	var fullWidth = 100,
		fullHeight = 100,
		width = 1,
		height = 1,
		zoomMax = opts.zoomMax || 0.000001,
		aspect = 1,
		left = 0,
		right = 1,
		top = 0,
		bottom = 1;

	function setCamera() {
		camera.setViewOffset(
			width, 
			height, 
			left, 
			top * height, 
			right-left,
			(bottom-top) * height
		);
	}

	function precomposeViewport(outer) {
		camera.fullWidth = outer.fullWidth;
		camera.fullHeight = outer.fullHeight;
		camera.x = outer.x + left * outer.width;
		camera.y = outer.y + top * outer.height;
		camera.width = outer.width * (right-left);
		camera.height = outer.height * (bottom-top);
		camera.updateProjectionMatrix();
	}

	function contain() {
		var overlap = Math.min(left, 0);
		left -= overlap;
		right -= overlap;
		overlap = Math.max(right, 1)-1;
		left -= overlap;
		right -= overlap;

		var overlap = Math.min(top, 0);
		top -= overlap;
		bottom -= overlap;
		overlap = Math.max(bottom, 1)-1;
		top -= overlap;
		bottom -= overlap;

		left = Math.max(left, 0);
		right = Math.min(right, 1);

		top = Math.max(top, 0);
		bottom = Math.min(bottom, 1);

	}


	function pan(x, y) {
		x = x / fullWidth * (right - left);
		left += x;
		right += x;

		y = y / fullHeight * (bottom - top);
		top += y;
		bottom += y;

		contain();

		if(autoSetCamera) setCamera();
	}

	function zoom(x, y, zoom) {
		if(this.zoomValue <= zoomMax && zoom < 1) return;
		zoom = Math.min(50, Math.max(0.01, zoom));
		var ratioX = x / fullWidth;
		var ratioY = y / fullHeight;
		var focusX = left + ratioX * (right - left);
		var focusY = top + ratioY * (bottom - top);
		left = ((left - focusX) * zoom) + focusX;
		right = ((right - focusX) * zoom) + focusX;
		top = ((top - focusY) * zoom) + focusY;
		bottom = ((bottom - focusY) * zoom) + focusY;

		contain();

		this.zoomValue *= zoom;
		if(autoSetCamera) setCamera();
	}


	function setSize(w, h) {
		fullWidth = w;
		fullHeight = h;
		height = h / w;
		setCamera();
	}

	function reset() {
		left = 0;
		right = 1;
		top = 0;
		bottom = 1;

		if(autoSetCamera) setCamera();
	}

	this.pan = pan;
	this.zoom = zoom;
	this.precomposeViewport = precomposeViewport;
	this.setSize = setSize;
	this.reset = reset;
}

module.exports = PanZoomRegion;