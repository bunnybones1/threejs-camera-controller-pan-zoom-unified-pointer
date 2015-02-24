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
		if(zoom > 1) {
			ratioX = 1 - ratioX;
			ratioY = 1 - ratioY;
		}
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
	this.setSize = setSize;
}

module.exports = PanZoomRegion;