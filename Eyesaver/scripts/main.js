const D = require('Diagnostics');
const Scene = require('Scene');
const Face01 = require('FaceTracking').face(0);
const Mat = require('Materials');
const R = require('Reactive');
const S = require('Shaders');
const Tex = require('Textures');
const Time = require('Time');
const Random = require('Random');

import { extractEye } from './removeEyes';
import { maskCircle } from './helpersSDF';
import { RESOLUTION } from './constants';
import { pointInScreenSpace } from './3dSpaces';

// We base it on resolution so speed look the same accross devics
const SPEED = RESOLUTION.x.mul(0.005);

function delayXFrames(frames = 1) {
	let i = 0;
	return new Promise(resolve => {
		const subscriber = Time.ms.monitor().subscribe(() => {
			if(i >= frames) {
				subscriber.unsubscribe();
				resolve();
				return;
			}

			i++;
		});
	});
}

function getObjectScreenConstraints(obj) {
	return {
		minX: 0,
		minY: 0,
		maxX: RESOLUTION.x.sub(obj.bounds.width),
		maxY: RESOLUTION.y.sub(obj.bounds.height)
	};
}

Promise.all([
	Scene.root.findFirst('EyeLeft'),
	Scene.root.findFirst('EyeRight'),
	Mat.findFirst('LeftEye'),
	Mat.findFirst('RightEye'),
	Tex.findFirst('CameraTexture'),
	Tex.findFirst('face01'),
	Tex.findFirst('noise'),
]).then(assets => {
	const objLeftEye = assets[0];
	const objRightEye = assets[1];
	const matLeftEye = assets[2];
	const matRightEye = assets[3];
	const texCamera = assets[4].signal;
	const texFace01 = assets[5].signal;
	const texNoise = assets[6].signal;

	// Handle Eyes
	objLeftEye.hidden = true;
	objRightEye.hidden = true;

	// Bug fix where size is not really fixed
	objLeftEye.width = objLeftEye.height = objRightEye.width = objRightEye.height = 68.0000;

	objLeftEye.constraints = getObjectScreenConstraints(objLeftEye);
	const pointLeftEye = Face01.cameraTransform.applyToPoint(Face01.leftEye.center);
	const pxLeftEye = pointInScreenSpace(pointLeftEye).sub(
		R.pack2(
			objLeftEye.width.div(2),
			objLeftEye.height.div(2)
		)
	);

	objRightEye.constraints = getObjectScreenConstraints(objRightEye);
	const pointRightEye = Face01.cameraTransform.applyToPoint(Face01.rightEye.center);
	const pxRightEye = pointInScreenSpace(pointRightEye).sub(
		R.pack2(
			objRightEye.width.div(2),
			objRightEye.height.div(2)
		)
	);

	// TODO: Find a way to get better eye position in UV.
	matLeftEye.setTextureSlot('diffuseTexture', maskCircle(extractEye(texCamera, pointLeftEye)));
	matRightEye.setTextureSlot('diffuseTexture', maskCircle(extractEye(texCamera, pointRightEye)));	
	
	// TODO: Testing only
	objLeftEye.transform.x = pxLeftEye.x;
	objLeftEye.transform.y = pxLeftEye.y;
	objRightEye.transform.x = pxRightEye.x;
	objRightEye.transform.y = pxRightEye.y;

	// Handle objects
	// TODO: Start animation on face tracking start
	// LeftEyeEl.hidden = true;
	// RightEyeEl.hidden = true;
	let isFirstEvent = true;
	Face01.isTracked.monitor({fireOnInitialValue: true}).subscribe( evt => {
		// Hide if new value is false
		if(!evt.newValue) {
			objLeftEye.hidden = true;
			objRightEye.hidden = true;

			return;
		}

		// On first track, start animation.
		if(isFirstEvent) {
			// Hack for waiting until next frame 
			// as pin would pin values from frame before
			// starting to track.
			delayXFrames(1).then(() => {
				objLeftEye.transform.x = R.clamp(pxLeftEye.x.pin(), objLeftEye.constraints.minX, objLeftEye.constraints.maxX);
				objLeftEye.transform.y = R.clamp(pxLeftEye.y.pin(), objLeftEye.constraints.minY, objLeftEye.constraints.maxY);
				objRightEye.transform.x = R.clamp(pxRightEye.x.pin(), objRightEye.constraints.minX, objRightEye.constraints.maxX);
				objRightEye.transform.y = R.clamp(pxRightEye.y.pin(), objRightEye.constraints.minY, objRightEye.constraints.maxY);

				playEyeAnimation(objLeftEye);
				playEyeAnimation(objRightEye);

				objLeftEye.hidden = false;
				objRightEye.hidden = false;
			});

			isFirstEvent = false;

			return;
		}

		// Show eyes.
		objLeftEye.hidden = false;
		objRightEye.hidden = false;
	});

	function playEyeAnimation(obj) {
		let velocityX = Random.random() > 0.5 ? SPEED : SPEED.neg();
		let velocityY = Random.random() > 0.5 ? SPEED  : SPEED.neg();
		
		const setTranslateSignal = () => {
			obj.transform.x = obj.transform.x.history(1).frame(-1).add(velocityX);
			obj.transform.y = obj.transform.y.history(1).frame(-1).add(velocityY);
		}

		obj.transform.x.le(obj.constraints.minX)
		.or(obj.transform.x.ge(obj.constraints.maxX))
		.monitor({fireOnInitialValue: true}).subscribe(evt => {
			if (!evt.newValue) {
				return;
			}

			velocityX = velocityX.neg();
			setTranslateSignal();
		});

		obj.transform.y.le(obj.constraints.minY)
		.or(obj.transform.y.ge(obj.constraints.maxY))
		.monitor({fireOnInitialValue: true}).subscribe(evt => {
			if (!evt.newValue) {
				return;
			}

			velocityY = velocityY.neg()
			setTranslateSignal();
		});

		setTranslateSignal();
	}
});