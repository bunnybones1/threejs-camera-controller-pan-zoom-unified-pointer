function PanZoomRegion(camera) {
	
	this.zoomValue = 1;

	var fullWidth = 100,
		fullHeight = 100,
		width = 1,
		height = 1,
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

	function precomposeViewport(otherCamera) {
		var outerX = otherCamera.x / otherCamera.fullWidth;
		var outerY = otherCamera.y / otherCamera.fullWidth;
		var outerWidth = otherCamera.width / otherCamera.fullWidth;
		var outerHeight = otherCamera.height / otherCamera.fullWidth;
		
		camera.x = outerX + left * outerWidth;
		camera.y = outerY + top * outerHeight;
		camera.width = outerWidth * (right-left);
		camera.height = outerHeight * (bottom-top);
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

		setCamera();
	}

	function zoom(x, y, zoom) {
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
		setCamera();
	}


	function setSize(w, h) {
		fullWidth = w;
		fullHeight = h;
		height = h / w;
		setCamera();
	}

	this.pan = pan;
	this.zoom = zoom;
	this.precomposeViewport = precomposeViewport;
	this.setSize = setSize;
}

module.exports = PanZoomRegion;