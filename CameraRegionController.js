var Signal = require('signals').Signal;
function Controller(opts) {
	var pointers = opts.pointers;
	var onMouseWheelSignal = opts.mouseWheel ? opts.mouseWheel.onMouseWheelSignal : null;

	var panSignal = new Signal();
	var zoomSignal = new Signal();

	var mousePosition = [0, 0];

	var activePointers = [];
	var positions = [];
	for (var i = 0; i < 100; i++) {
		positions.push(0, 0);
	};

	function onPointerDown(x, y, id) {
		if(id === 0 && activePointers.length < 2) {
			mousePosition[0] = x;
			mousePosition[1] = y;
		}
		if(activePointers.length >= 2) return;
		positions[id*2] = x;
		positions[id*2+1] = y;

		activePointers.push(id);
	}

	function onPointerMove(x, y) {
		mousePosition[0] = x;
		mousePosition[1] = y;
	}

	function len(x, y) {
		return Math.sqrt(x*x+y*y);
	}

	var indexAx, indexAy, indexBx, indexBy;
	function onPointerDrag(x, y, id) {
		if(id === 0 && activePointers.length < 2) {
			mousePosition[0] = x;
			mousePosition[1] = y;
		}
		if(activePointers.indexOf(id) === -1) return;
		indexAx = id*2;
		indexAy = indexAx+1;
		switch(activePointers.length) {
			case 1:
				panSignal.dispatch(
					positions[id*2] - x,
					positions[id*2+1] - y
				);
				break;
			case 2:
				indexBx = (id*2+2)%4;
				indexBy = indexBx+1;
				panSignal.dispatch(
					(positions[indexAx] - x) * .5,
					(positions[indexAy] - y) * .5
				);
				var zoom = len(
						positions[indexAx] - positions[indexBx], 
						positions[indexAy] - positions[indexBy]
					) / len(
						x - positions[indexBx], 
						y - positions[indexBy]
					);
				zoomSignal.dispatch(
					(positions[0] + positions[2]) * .5,
					(positions[1] + positions[3]) * .5,
					zoom
				);
				break;
		}
		positions[indexAx] = x;
		positions[indexAy] = y;
	}

	function onPointerUp(x, y, id) {
		positions[id*2] = x;
		positions[id*2+1] = y;
		var index = activePointers.indexOf(id);
		if(index !== -1) activePointers.splice(index);
	}

	function onMouseWheelZoom(delta) {
		zoomSignal.dispatch(
			mousePosition[0], 
			mousePosition[1], 
			(3000 + delta) / 3000,
			true
		);
	}


	pointers.onPointerDownSignal.add(onPointerDown);
	pointers.onPointerMoveSignal.add(onPointerMove);
	pointers.onPointerDragSignal.add(onPointerDrag);
	pointers.onPointerUpSignal.add(onPointerUp);

	onMouseWheelSignal.add(onMouseWheelZoom);
	
	this.panSignal = panSignal;
	this.zoomSignal = zoomSignal;
}
module.exports = Controller;