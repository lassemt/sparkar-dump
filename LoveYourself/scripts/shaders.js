const D = require('Diagnostics');
const S = require('Shaders');
const R = require('Reactive');

import { SCREEN_RATIO } from './constants';

export const median = (r, g, b) => {
	return R.max(R.min(r, g), R.min(R.max(r, g), b));
}

export const msdf = (color) => {
  const signedDist = R.sub(median(color.x, color.y, color.z), 0.5);

	// Distance
	const d = S.derivative(signedDist, {
		'derivativeType': S.DerivativeType.FWIDTH
	});

  return R.clamp(signedDist.div(d).add(0.5), 0.0, 1.0);
}

export const maskMSDF = (texture, mask) => R.mix(0, texture, msdf(mask));

export const zoomOnPoint = (center, scale, texture) => {
	const x = R.mul(center.x, 2).neg();
	const y = center.y;

	let uv = S.functionVec2();

	// Move space from the center to the vec2(0.0)
	// For example, setting this value to 0.5 would make the texture scale, 
	// rotate or translate from the center of the frame.
	uv = R.sub(uv, R.pack2(0.5, 0.5));

	// Scale
	uv = R.pack2(R.div(uv.x, scale.x), R.div(uv.y, scale.y.mul(SCREEN_RATIO))); 

	// Translate to center pos
	uv = R.sub(uv, R.pack2(x, y));

	// move "piviot" back to the original place
	uv = R.add(uv, R.pack2(0.5, 0.5));
	
	return S.composition(texture, uv);

}