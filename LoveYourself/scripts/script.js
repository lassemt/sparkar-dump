const D = require('Diagnostics');
const R = require('Reactive');
const Scene = require('Scene');
const Materials = require('Materials');
const Textures = require('Textures');
const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');
const Instruction = require('Instruction');

import { PARTICLE_BIRTHRATE, FACE_IN_HEART_ZOOM, FACE_IN_HEART_OFFSET, FOCAL_DISTANCE } from './constants';
import { maskMSDF, zoomOnPoint } from './shaders';

const face01 = FaceTracking.face(0);

Promise.all([
	Scene.root.findFirst('objHearts'),
	Materials.findFirst('matParticle'),
	Textures.findFirst('texMSDFHeart'),
	Textures.findFirst('texCamera'),
]).then(assets => {
	const [
		objHearts,
		matParticle,
		texMSDFHeart,
		texCamera
	] = assets;

	const face01NoseCenter = face01.cameraTransform.applyToPoint(face01.nose.bridge).normalize();
	const scale = face01.cameraTransform.z.neg().mul(FACE_IN_HEART_ZOOM);

	objHearts.birthrate = FaceGestures.isKissing(face01).ifThenElse(PARTICLE_BIRTHRATE, 0);

	matParticle.setTextureSlot('diffuseTexture', maskMSDF(zoomOnPoint(
		R.pack2(face01NoseCenter.x, face01NoseCenter.y).add(FACE_IN_HEART_OFFSET),
		R.pack2(
			scale,
			scale
		),
		texCamera.signal
	), texMSDFHeart.signal));

	Instruction.bind(true, 'pucker_lips');
	const subscriber = FaceGestures.isKissing(face01).onOn().subscribe(() => {
		subscriber.unsubscribe();
		Instruction.bind(false, 'pucker_lips');
	});
});

