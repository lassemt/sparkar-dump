const D = require('Diagnostics');
const Scene = require('Scene');
const FaceTracking = require('FaceTracking');

//
// Constants
//
const NUMBER_OF_MASKS = 10;
const DELAY = 100;
const FOCAL_DISTANCE = -53.61266732215881;

// 
// Facetracker shit
//
const trackedFace = FaceTracking.face(0);

//
// Loop through masks
//
Scene.root.findByPath('**/*/facemesh*').then(persons => {
	persons.map( (person, i) => {
		let mask_delay = (i + 1) * DELAY;
		person.transform.x = trackedFace.cameraTransform.x.delayBy({milliseconds: mask_delay});
		person.transform.y = trackedFace.cameraTransform.y.delayBy({milliseconds: mask_delay});
		person.transform.z = trackedFace.cameraTransform.z.sub(FOCAL_DISTANCE);
		person.transform.rotationX = trackedFace.cameraTransform.rotationX;
		person.transform.rotationY = trackedFace.cameraTransform.rotationY;
		person.transform.rotationZ = trackedFace.cameraTransform.rotationZ;
	});
});

// for (let i = 0; i < NUMBER_OF_MASKS; i++) {
// 	let mask = Scene.root.find(`facemesh${i}`);
// 	let mask_delay = (i + 1) * DELAY;


// }
