const Scene = require('Scene');
const R = require('Reactive');
import { RESOLUTION, DPI } from './constants';

// OLD, but useful knowledge.
// export function pointIn2dCameraSpace(point, focalplane) {
// 	// https://math.stackexchange.com/questions/2305792/3d-projection-on-a-2d-plane-weak-maths-ressources/2306853#2306853
// 	return R.mul(R.pack2(point.x, point.y), R.div(focalplane.distance.neg(), point.z)).div(R.pack2(focalplane.width, focalplane.height));
// }

export function pointInScreenSpace(point) {
	const coord = Scene.projectToScreen(point).div(DPI);

	return R.pack2(
		coord.x,
		RESOLUTION.y.sub(coord.y)
	);
}

