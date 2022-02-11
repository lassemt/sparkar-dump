//
// TODO: Use script instead of patches.
//
const D = require('Diagnostics');
const R = require('Reactive');
const S = require('Shaders');

import { SCREEN_RATIO, FOCAL_DISTANCE, } from './constants';

export function removeEyes(texFace, texNoise) {

}

export function extractEye(texCamera, position, zoom = 7) {
	const z = position.z.add(FOCAL_DISTANCE).div(FOCAL_DISTANCE);
	position = position.normalize();
	const x = position.x.mul(2).neg();
	const y = position.y.mul(1.08);
	const scaleX = R.val(zoom).sub(z.mul(zoom));
	const scaleY = scaleX.mul(SCREEN_RATIO);
	
	let uv = S.functionVec2();
    // Move space from the center to the vec2(0.0)
    // For example, setting this value to 0.5 would make the texture scale, 
    // rotate or translate from the center of the frame.
    uv = R.sub(uv, R.pack2(0.5, 0.5));
	
	// Scale
	uv = R.pack2(R.div(uv.x, scaleX), R.div(uv.y, scaleY)); 

	// Translate to eye pos
    uv = uv.sub(R.pack2(x, y));
	
	// move "piviot" back to the original place
	uv = R.add(uv, R.pack2(0.5, 0.5));

	return S.composition(texCamera, uv);
}