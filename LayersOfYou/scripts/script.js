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
const Z_OFFSET_FIRST = 2;
const Z_OFFSET = 7;
const Z_OFFSET_MIN = 5;
const Z_OFFSET_MAX = 14;

const SCALE_RATIO = 0.05;
const FOCAL_DISTANCE = -53.61266732215881;

//
// Face tracker
//
const trackedFace = FaceTracking.face(0);
const trackedFaceZ = trackedFace.cameraTransform.z.div(FOCAL_DISTANCE);
const face_rotation = trackedFace.cameraTransform.rotationY.abs();

slider.visible = true;
// ((val - min) * 100) / (max - min)
slider.value = R.val((Z_OFFSET - Z_OFFSET_MIN) / (Z_OFFSET_MAX - Z_OFFSET_MIN));
const zOffset = slider.value.toRange(Z_OFFSET_MIN, Z_OFFSET_MAX)

// 
//	Create array with all person elements
//
let objPersons = [];

Scene.root.findByPath('**/*/facemesh*').then(persons => {
	persons.map( (mesh, i) => {
		// Set offset per face
		mesh.transform.z = R.mul(face_rotation, zOffset.mul(i).add(Z_OFFSET_FIRST));

		//
		// Correct scale based on distance from face
		//
		const distance1 = R.distance(mesh.transform.position.z, 0).div(R.neg(FOCAL_DISTANCE));
		const distance = R.sub(1, R.distance(mesh.transform.position.z.mul(R.cos(face_rotation)), 0).div(R.neg(FOCAL_DISTANCE)));
		// D.watch(`facemesh${i}`, distance);
		mesh.transform.scaleX = distance;
		mesh.transform.scaleY = distance;
		mesh.transform.scaleZ = distance;
	});
});
