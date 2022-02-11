const D = require('Diagnostics');
const Scene = require('Scene');
const Patches = require('Patches');
const R = require('Reactive');
const S = require('Shaders');
const FaceTracking = require('FaceTracking');
const { slider } = require('NativeUI');

//
// Constants
//
const Z_OFFSET_FIRST = 5;
const Z_OFFSET_MIN = 1;
const Z_OFFSET_MAX = 8;
const SCALE_RATIO = 0.20;
const FOCAL_DISTANCE = R.val(-53.61266732215881);

//
// Face tracker
//
const trackedFace = FaceTracking.face(0);
const trackedFaceZ = trackedFace.cameraTransform.z.div(FOCAL_DISTANCE);

slider.visible = true;
// ((6 - 1) * 100) / (8 - 1)
slider.value = R.val(0.7143);
const zOffset = slider.value.toRange(Z_OFFSET_MIN, Z_OFFSET_MAX)

// 
//	Create array with all person elements
//
Scene.root.findByPath('**/*/facemesh*').then(persons => {
	persons.map( (mesh, i) => {
		// Set offset per face;
		mesh.transform.z = zOffset.mul(i).add(Z_OFFSET_FIRST);
		D.watch(`facemesh${i}`, mesh.transform.scaleX);

		//
		// FUNNY SHIT 👇
		//
		// const distance = R.sub(1, R.distance(mesh.transform.position, R.pack3(0,0,0)).div(FOCAL_DISTANCE.abs()));
		
		//
		// FUNNY SHIT 2 👇
		//
		// TODO: Disable Reverse Scale
		const distance = R.sub(1, i * SCALE_RATIO);

		//
		// Correct scale based on distance from face
		//
		// const distance = R.sub(1, R.distance(mesh.transform.position, R.pack3(0,0,0)).div(trackedFace.cameraTransform.z.neg()));

		mesh.transform.scaleX = distance;
		mesh.transform.scaleY = distance;
		mesh.transform.scaleZ = distance;
	});
});
