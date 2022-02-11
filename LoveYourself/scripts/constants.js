const R = require('Reactive');
const CameraInfo = require('CameraInfo');

export const FOCAL_DISTANCE = 53.61266732215881 // 0.5361266732215881;
export const DPI = CameraInfo.previewScreenScale;
export const RESOLUTION = R.pack2(CameraInfo.previewSize.width, CameraInfo.previewSize.height).div(DPI);
export const SCREEN_RATIO = RESOLUTION.y.div(RESOLUTION.x);
export const PARTICLE_BIRTHRATE = 10;
export const FACE_IN_HEART_ZOOM = 3;
export const FACE_IN_HEART_OFFSET = R.pack2(0, -0.02);