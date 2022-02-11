const R = require('Reactive');
const S = require('Shaders');

export const sdfCircle = R.step(0, S.sdfCircle(R.pack2(0.5, 0.5), 0.5));
export const maskCircle = (color) => R.mix(0, color, sdfCircle);