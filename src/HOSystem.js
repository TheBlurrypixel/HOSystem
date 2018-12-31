import Functions from "./Functions.js"

export class particleHO extends createjs.Container {
	constructor (inStartPoint, inEndPoint, inNumberOfFrames, inScaleFactor) {
		// constructor for particleHO
		// call base class constructor
		super();
		//this.Container_constructor();

		this._alive = true;
		this._frameCounter = 0;
		this.opacity = this.alpha;
		this.clockwise = Math.random() > .5 ? true : false;

		this.startPoint = inStartPoint;
		this.endPoint = inEndPoint;
		this.numberOfFrames = inNumberOfFrames;

		this.fScaleFactor = inScaleFactor;
		var randomScaleFactor = (Math.random()*2 - 1)*.5;

		var randomOpacityFactor = (Math.random()*2 - 1)*.2;
		this.alpha = randomScaleFactor + .8;

		// create data points for particle motion path
		this.splinePointsArray = new Array();
		this.splinePointsArray.push( this.startPoint );
		this.splinePointsArray.push( new createjs.Point( this.startPoint.x + (this.endPoint.x - this.startPoint.x)*3 + (Math.random()>.5?1:-1)*(Math.random()*50+50), this.startPoint.y + (this.endPoint.y - this.startPoint.y)*3 + (Math.random()>.5?1:-1)*(Math.random()*50+50)) );
		this.splinePointsArray.push( new createjs.Point( this.startPoint.x + (this.endPoint.x - this.startPoint.x)*2/3, this.startPoint.y + (this.endPoint.y - this.startPoint.y)*2/3 ) );
		this.splinePointsArray.push( this.endPoint );
	}

	run()
	{
		if(this._alive)
		{
			var interp = this._frameCounter/this.numberOfFrames;

			if(interp < 1)
			{
				var position = this.getLinearPoint(interp);

				this.x = position.x;
				this.y = position.y;

				var easedInterp = Functions.easeOutQuintic(interp, 0, 1, 1);
				this.rotation = (this.clockwise ? 1 : -1)*easedInterp*90;

				var newAlpha = Functions.linear(interp,0,1,4,-0.5);
				newAlpha = newAlpha > 1 ? 1 : (newAlpha < 0 ? 0 : newAlpha);
				this.alpha = newAlpha * this.opacity;

				var easedScaleInterp = 1-interp;
	//					var easedScaleInterp:Number = 1-(Functions.easeOutCubic(interp, 0, 1, 1));
				this.scaleX = easedScaleInterp * this.fScaleFactor;
				this.scaleY = easedScaleInterp * this.fScaleFactor;

				this._frameCounter++;
			}
			else
				this._alive = false;
		}
	}

	// getter for whether particles should die
	get alive()
	{
		return this._alive;
	}

	// method for getting position from the motion path
	getLinearPoint(interpolant)
	{
	//			var easedInterpolant = Functions.ease(interpolant, 0, 1, 1);
		var easedInterpolant = interpolant;
		var res = null;

		var numberOfSegments = Math.floor((this.splinePointsArray.length-1)/3);

		var temp = easedInterpolant * numberOfSegments;
		var segmentNumber = Math.floor(temp);
		var localInterp = (segmentNumber == 0) ? temp : temp % segmentNumber; // modulo returns NaN when second arg is 0

		var pointIndex = segmentNumber*3;

		if(segmentNumber < numberOfSegments)
		{
			var point0 = this.splinePointsArray[pointIndex];
			var point1 = this.splinePointsArray[pointIndex + 1];
			var point2 = this.splinePointsArray[pointIndex + 2];
			var point3 = this.splinePointsArray[pointIndex + 3];

			res = Functions.linear2D(localInterp, point0, point3);
		}
		else // this should never happen
			res = new createjs.Point();

		return res;
	}

	// Cubic Hermite method for getting position from the motion path
	getHermitePoint(interpolant)
	{
		var easedInterpolant = Functions.ease(interpolant, 0, 1, 1);
	//			var easedInterpolant = interpolant;
		var res = null;

		var numberOfSegments = Math.floor((this.splinePointsArray.length-1)/3);

		var temp = easedInterpolant * numberOfSegments;
		var segmentNumber = Math.floor(temp);
		var localInterp = (segmentNumber == 0) ? temp : temp % segmentNumber; // modulo returns NaN when second arg is 0

		var pointIndex = segmentNumber*3;

		if(segmentNumber < numberOfSegments)
		{
			var point0 = this.splinePointsArray[pointIndex];
			var point1 = this.splinePointsArray[pointIndex + 1];
			var point2 = this.splinePointsArray[pointIndex + 2];
			var point3 = this.splinePointsArray[pointIndex + 3];

			res = Functions.hermite(localInterp, point0, point1, point2, point3);
		}
		else // this should never happen
			res = new createjs.Point();

		return res;
	}
}

export class particleSystemHO extends createjs.MovieClip {
	constructor(inClipToTrack, inParticle, startNumOfParticles, inMaxParticles, inLifespan, inParticleLifespan, inMinimumDistance, inDistanceSpread)
	{
		// run base class constructor
		super();
		//this.MovieClip_constructor();

		this.minimumDistance = inMinimumDistance;	// this is the minimum distance for a particle to travel
		this.distanceSpread = inDistanceSpread;	// this is the amount of distance to randomnly spread particle endpoints always set this to less than minimumDistance

		// our constructor for the particleSystemHO
		this._alive = true;
		this._frameCounter = 0;

		this.clipToTrack = inClipToTrack;
		this.particleBase = inParticle;

		this.particles = new Array();	// Initialize the arraylist

		this.maxParticles = inMaxParticles;
		this.fLifespan = inLifespan;
		this.fParticleLifespan = inParticleLifespan;

		if(typeof this.particleBase === "function")
			this.addParticles(startNumOfParticles);
	}

	/// method to add particleHOs as children to the particleSystemHO
	addParticles(numberOfParticles)
	{
		var life = this._frameCounter/this.fLifespan;
	//			life = Functions.easeOutQuintic(life,0,1,1);

		for (var i = 0; i < numberOfParticles; i++)
		{
			var scaleFactor = 1-Functions.linearClamped(life,-.5,1,0,1);
			var distanceScaleFactor = scaleFactor*8+0.2;
			var startPointRandomness = scaleFactor+0.5;
			var startPointDeltaX = (Math.random()*100 - 50)*startPointRandomness;
			var startPointDeltaY = (Math.random()*100 - 50)*startPointRandomness;

			var startPoint = new createjs.Point(this.clipToTrack.x + startPointDeltaX, this.clipToTrack.y + startPointDeltaY);

			var randomAngle = Math.random()*2*Math.PI;
			var randomDistance = (Math.random()*2-1) * this.distanceSpread + this.minimumDistance;

			randomDistance *= distanceScaleFactor;

			var endPoint = new createjs.Point(startPoint.x + Math.cos(randomAngle)*randomDistance, startPoint.y + Math.sin(randomAngle)*randomDistance);

			var particleBMP = new this.particleBase();
			particleBMP.x = -particleBMP.getBounds().width/2;
			particleBMP.y = -particleBMP.getBounds().height/2;

			var particleMC = new particleHO(startPoint, endPoint, this.fParticleLifespan, scaleFactor*5);
			particleMC.addChild(particleBMP);

			this.particles.push(particleMC);
			this.addChild(particleMC);
		}
	}

	// udpates the number of particles and generates particle animation
	run()
	{
		if(this.particles.length > 0)
		{
			for (var i = this.particles.length-1; i >= 0 ; i--)
			{
				this.particles[i].run();

				if( (i >= this.maxParticles) || !(this.particles[i].alive) )
				{
					this.removeChild(this.particles[i]);
					this.particles.splice(i,1);
				}
			}
		}

		if(this._frameCounter >= this.fLifespan)
			this._alive = false;
		else
			this._frameCounter++;
	}

	// getter for if particleSystem is generating particles
	get alive()
	{
		return this._alive;
	}

	// tells you how many particles it has
	get numberOfParticles()
	{
		return this.particles.length;
	}

	get frameCounter()
	{
		return this._frameCounter;
	}

	set frameCounter(inCount)
	{
		this._frameCounter = inCount;
	}
}

export class HOAnimation extends createjs.MovieClip {
	constructor(
					inMovieClip,
					inEndPoint,
					inEvent,
					inCallback,
					inAnimationOptions,
					inParticleSystemHORefs,
					inPuffsRefs
				) {
		super();

		this.fObject = inMovieClip ? inMovieClip : new createjs.MovieClip();
		this.puffsRefs = inPuffsRefs;
		this.particleSystemHORefs = inParticleSystemHORefs;

		// particle animation specific variables
		this.puffTopMC = null;
		this.puffBottomMC = null;
		this.particleBase = null;

		this.numberOfFrames = 50; // number of frames for moving to inventory panel
		this.numberOfFramesToPulse = 45;  // number of frames to be pulsing
		this.numberOfCycles = 2;  // number of scaling cycles to pulse
		this.scaleSpread = 0.2; // amount of HO to scale up and down
		this.totalFramesOfAnimation = (this.numberOfFrames + this.numberOfFramesToPulse) * 0.7;
		this.particleLifespan = 50; // life of particle
		this.rotationAmount = 1440; // duration of particle system to spawning particles
		this.endAlpha = 0; // life of particle

		this.minimumControlPointDistance = 300;
		this.randomControlPointDistanceSpread = 600;
		this.particlesPerFrameStart = 0.15; // DO NOT GO OVER 1!!!! It will slow performance
		this.particlesPerFrameEnd = 6; // DO NOT GO OVER 1!!!! It will slow performance

		this.startNumOfParticles = 1;
		this.maxParticles = 200;
		this.minimumDistance = 50;	// this is the minimum distance for a particle to travel
		this.distanceSpread = 25;	// this is the amount of distance to randomnly spread particle endpoints always set this to less than minimumDistance

		// pulse animation specific variables
		// this controls the speed of the animations
		if(inAnimationOptions) {
			inAnimationOptions.numberOfFrames ? this.numberOfFrames = inAnimationOptions.numberOfFrames : null; // number of frames for moving to inventory panel
			inAnimationOptions.numberOfFramesToPulse ? this.numberOfFramesToPulse = inAnimationOptions.numberOfFramesToPulse : null;  // number of frames to be pulsing
			inAnimationOptions.numberOfCycles ? this.numberOfCycles = inAnimationOptions.numberOfCycles : null;  // number of scaling cycles to pulse
			inAnimationOptions.scaleSpread ? this.scaleSpread = inAnimationOptions.scaleSpread : null; // amount of HO to scale up and down
			this.totalFramesOfAnimation = inAnimationOptions.totalFramesOfAnimation ? inAnimationOptions.totalFramesOfAnimation : (this.numberOfFrames + this.numberOfFramesToPulse) * 0.7; // duration of particle system to spawning particles
			inAnimationOptions.particleLifespan ? this.particleLifespan = inAnimationOptions.particleLifespan : null; // life of particle
			inAnimationOptions.endAlpha ? this.endAlpha = inAnimationOptions.endAlpha : null; // life of particle
			inAnimationOptions.rotationAmount ? this.rotationAmount = inAnimationOptions.rotationAmount : null; // duration of particle system to spawning particles

			inAnimationOptions.minimumControlPointDistance ? this.minimumControlPointDistance = inAnimationOptions.minimumControlPointDistance : null;
			inAnimationOptions.randomControlPointDistanceSpread ? this.randomControlPointDistanceSpread = inAnimationOptions.randomControlPointDistanceSpread : null;
			inAnimationOptions.particlesPerFrameStart ? this.particlesPerFrameStart = inAnimationOptions.particlesPerFrameStart : null; // DO NOT GO OVER 1!!!! It will slow performance
			inAnimationOptions.particlesPerFrameEnd ? this.particlesPerFrameEnd = inAnimationOptions.particlesPerFrameEnd : null; // DO NOT GO OVER 1!!!! It will slow performance
			inAnimationOptions.startNumOfParticles ? this.startNumOfParticles = inAnimationOptions.startNumOfParticles : null; // DO NOT GO OVER 1!!!! It will slow performance
			inAnimationOptions.maxParticles ? this.maxParticles = inAnimationOptions.maxParticles : null; // DO NOT GO OVER 1!!!! It will slow performance
			inAnimationOptions.particleMinimumDistance ? this.minimumDistance = inAnimationOptions.particleMinimumDistance : null; // DO NOT GO OVER 1!!!! It will slow performance
			inAnimationOptions.particleDistanceSpread ? this.distanceSpread = inAnimationOptions.particleDistanceSpread : null; // DO NOT GO OVER 1!!!! It will slow performance

			// particle animation specific variables
			this.puffTopMC = inAnimationOptions.puffTop||null;
			this.puffBottomMC = inAnimationOptions.puffBottom||null;
			this.particleBase = inAnimationOptions.particleBase||null;
			this.puffsRefs = inAnimationOptions.puffReferences||null;
			this.particleSystemHORefs = inAnimationOptions.particleSystemReferences||null;
		}

		this.endPoint = inEndPoint ? new createjs.Point(inEndPoint.x, inEndPoint.y) : new createjs.Point();

		this.randomAngle = Math.random() * 2 * Math.PI;
		this.randomDistance = Math.random() * this.randomControlPointDistanceSpread + this.minimumControlPointDistance;

		// create array for the spline
		// define our spline for animation
		// define a starting point which is where the Object is now
		var startPoint = new createjs.Point( this.fObject.x, this.fObject.y );
		this.splinePointsArray = new Array();
		this.splinePointsArray.push( startPoint );
		this.splinePointsArray.push( new createjs.Point( startPoint.x + ( (startPoint.x > 150) ? (Math.random() > .5 ? -1 : 1) : 1 ) * (Math.random()*this.randomControlPointDistanceSpread+this.minimumControlPointDistance), startPoint.y + (this.endPoint.y - startPoint.y)/3 - (Math.random()*this.randomControlPointDistanceSpread+this.minimumControlPointDistance) ) );
		this.splinePointsArray.push( new createjs.Point( startPoint.x + (this.endPoint.x - startPoint.x)*2/3, startPoint.y + (this.endPoint.y - startPoint.y)*2/3) );
		this.splinePointsArray.push( this.endPoint );

		// reset our counters
		this._frameCounter = 0;
		this.pulseFrameCounter = 0;

		this.pulseScaleBound = this.pulseScale.bind(this);
		this.playLoopBound = this.playLoop.bind(this);
		this.onMCCompleteBound = this.onMCComplete.bind(this);
		this.updateParticleSystemBound = this.updateParticleSystem.bind(this);

		//this.gotoAndStop(0);
		this.name = inMovieClip.getName() + "HOA";

		this.fEvent = inEvent ? inEvent : "click";
		this.fCallback = inCallback ? inCallback : e => e.currentTarget.play();
	}

	init()
	{
		this.setTransform(this.fObject.x, this.fObject.y, this.fObject.scaleX, this.fObject.scaleY, this.fObject.rotation, this.fObject.skewX, this.fObject.skewY, this.fObject.regX, this.fObject.regY);
		this.defaultScale = new createjs.Point(this.scaleX, this.scaleY);
		this.defaultRotation = 0;

		this.fObject.parent.addChildAt(this, this.fObject.parent.getChildIndex(this.fObject));
		this.fObject.parent.removeChild(this.fObject);
		this.addChild(this.fObject);
		this.fObject.setTransform();

		this.fObject.visible = true;
		this.visible = true;

		this.hitArea = this.fObject;
		this.mouseEnabled = true;
	//	this.cursor = "pointer";

		this.addEventListener(this.fEvent, this.fCallback);
	}

	// overriding the play() method!
	play()
	{
		if(this.stage && !this.hasEventListener("tick"))
		{
			//alert("being asked to play: " + this.name);
			// move the HOAnimation to the top of the stage's displaylist
			var par = this.parent;
			par.removeChild(this);
			par.addChild(this);

			// play HOAnimation particles and puff animations
			this.go();

			this.addEventListener("tick", this.pulseScaleBound);
		}
	}

	go()
	{
		return this.addPuffs() && this.addParticleSystem();
	}

	// new lib.puffTopMC
	addPuffs()
	{
		if(!this.parent || !(this.puffTopMC || this.puffBottomMC)) return false;

		// create and add puffs to display list
		if(this.puffTopMC && (typeof this.puffTopMC === "function")) {
			var puffTop = new this.puffTopMC();
			puffTop.x = this.x;
			puffTop.y = this.y;
			this.parent.addChildAt(puffTop, this.parent.getChildIndex(this)+1);
			puffTop.addEventListener("tick", this.onMCCompleteBound);
			puffTop.gotoAndPlay(0);
			if(this.puffsRefs) this.puffsRefs.push(puffTop);
		}

		if(this.puffBottomMC && (typeof this.puffBottomMC === "function")) {
			var puffBottom = new this.puffBottomMC();
			puffBottom.x = this.x;
			puffBottom.y = this.y;
			this.parent.addChildAt(puffBottom, this.parent.getChildIndex(this));
			puffBottom.addEventListener("tick", this.onMCCompleteBound);
			puffBottom.gotoAndPlay(0);
			if(this.puffsRefs) this.puffsRefs.push(puffBottom);
		}

		return true;
	}

	addParticleSystem()
	{
		if(!this.parent || !this.particleBase) return false;

		// create particle system and add to display list
	//	var star = new lib.starColored();
		var ps = new particleSystemHO(this, this.particleBase, this.startNumOfParticles, this.maxParticles, this.totalFramesOfAnimation, this.particleLifespan, this.minimumDistance, this.distanceSpread);

		if(this.particleSystemHORefs) this.particleSystemHORefs.push(ps);

		ps.run();
		ps.addEventListener("tick", this.updateParticleSystemBound);
	//	this.parent.addChildAt(ps, this.parent.getChildIndex(this));
		this.parent.addChild(ps);

		return true;
	}

	updateParticleSystem(e)
	{
		if(e.target.alive)
		{
			var particleSystemLifeInterp = e.target.frameCounter/e.target.fLifespan;
			particleSystemLifeInterp = Functions.easeInQuintic(particleSystemLifeInterp,0,1,1);
			particleSystemLifeInterp = Functions.linearClamped(particleSystemLifeInterp,0.25,1,1,(this.particlesPerFrameEnd/this.particlesPerFrameStart));
			var currentParticlesPerFrame = this.particlesPerFrameStart*particleSystemLifeInterp;

			var particleStrideLength = Math.floor(1/currentParticlesPerFrame);

			if(particleStrideLength > 0)
			{
				if((e.target.frameCounter % particleStrideLength) <= 0)
					e.target.addParticles(1);
			}
			else
			{
				e.target.addParticles(Math.floor(currentParticlesPerFrame));
	/*
				// this code is more accurate but maybe slower - obviously we don't need that
				var curFrame:uint = e.target.frameCounter()+1;
				var numParticlesToSpawn:uint = Math.floor(particlesPerFrame);
				numParticlesToSpawn += (curFrame*particlesPerFrame) % (curFrame*Math.floor(particlesPerFrame));
				e.target.addParticles(numParticlesToSpawn);
	*/
			}

			e.target.run();
		}
		else if(e.target.numberOfParticles <= 0)
		{
			e.target.removeEventListener("tick", this.updateParticleSystemBound);
			e.target.parent.removeChild(e.target);
		}
		else
			e.target.run();
	}

	// removes puffs on completion
	onMCComplete(event)
	{
		if(event.target.currentFrame >= event.target.totalFrames-1)
		{
			event.target.gotoAndStop(0);
			event.target.removeEventListener("tick", this.onMCCompleteBound);
			event.target.parent.removeChild(event.target);
		}
	}

	// This is our callback for the Object animation
	playLoop(event)
	{
		var interp = this._frameCounter/this.numberOfFrames;

		if(interp < 1)
		{
			var position = this.getHermitePoint(interp);

			this.x = position.x;
			this.y = position.y;

			if(this.rotationAmount > 0) {
				var easedInterp = Functions.easeInCubic(interp, 0, 1, 1);
				this.rotation = this.defaultRotation + easedInterp*this.rotationAmount;
			}

			if(this.endAlpha < 1) {
				var newAlpha = Functions.linear(interp,this.endAlpha,1,4,-0.5);
				newAlpha = newAlpha > 1 ? 1 : (newAlpha < 0 ? 0 : newAlpha);
				this.alpha = newAlpha;
			}

			this._frameCounter++;
		}
		else
		{
			this.removeEventListener("tick", this.playLoopBound);

			this.fObject.visible = false;
			this.removeChild(this.fObject);
			this.parent.removeChild(this);
		}
	}

	// callback for pulse animation
	pulseScale(event)
	{
		var interp = this.pulseFrameCounter/this.numberOfFramesToPulse;
		interp = Functions.ease(interp, 0, 1, 1);

		if(interp < 1)
		{
			if(this.scaleSpread > 0) {
				var temp = interp * 2 * Math.PI * this.numberOfCycles;
				var scaleFactor = Math.sin(temp)*this.scaleSpread;

				this.scaleX = scaleFactor + 1;
				this.scaleY = scaleFactor + 1;

				this.scaleX = this.defaultScale.x * scaleFactor + this.defaultScale.x;
				this.scaleY = this.defaultScale.y * scaleFactor + this.defaultScale.y;
			}

			if((interp > .6) && (this._frameCounter == 0))
				this.addEventListener("tick", this.playLoopBound);
		}
		else
			this.removeEventListener("tick", this.pulseScaleBound);

		this.pulseFrameCounter++;
	}

	// This is the function for getting a point from the spline path
	// provide only numbers between 0 and 1
	getHermitePoint(interpolant)
	{
		var easedInterpolant = Functions.ease(interpolant, 0, 1, 1);
		var res = null;

		var numberOfSegments = Math.floor((this.splinePointsArray.length-1)/3);

		var temp = easedInterpolant * numberOfSegments;
		var segmentNumber = Math.floor(temp);
		var localInterp = (segmentNumber == 0) ? temp : temp % segmentNumber; // modulo returns NaN when second arg is 0

		var pointIndex = segmentNumber*3;

		if(segmentNumber < numberOfSegments)
		{
			var point0 = this.splinePointsArray[pointIndex];
			var point1 = this.splinePointsArray[pointIndex + 1];
			var point2 = this.splinePointsArray[pointIndex + 2];
			var point3 = this.splinePointsArray[pointIndex + 3];

			res = Functions.hermite(localInterp, point0, point1, point2, point3);
		}
		else // this should never happen
			res = new createjs.Point();

		return res;
	}
}

// this is a controller to manage functions for our HOAnimations
export class HOAnimationSystem {
	constructor(
								inObjects,
								inEndPoint,
								e,
								callback,
								inAnimationOptions
							) {
		this.fAnimationOptions = inAnimationOptions;

		this.fCallback = callback;
		this.fEvent = e;
		this.endPoint = inEndPoint;

		// This array holds our HOAnimations
		this.HOAnimationsArray = new Array();

		this.particleSystemHORefs = new Array();
		this.puffsRefs = new Array();

		// make sure what we passed in are all MovieClips
		for(var i=0; i < inObjects.length; i++)
		{
			var resHOA = new HOAnimation(
																		inObjects[i],
																		this.endPoint,
																		this.fEvent,
																		this.fCallback,
																		this.fAnimationOptions,
																		this.particleSystemHORefs,
																		this.puffsRefs
																	);

			this.HOAnimationsArray.push(resHOA);
		}

		// we need to wait a tick before initializing
		// dunno why but the removed and added MovieClips are invisible otherwise
		this.startAnimationBound = this.startAnimation.bind(this);
		createjs.Ticker.addEventListener("tick", this.startAnimationBound);
		this.timeToCheckTicks = createjs.Ticker.getTicks(false);
	}

	clearFromStage() {
		for(var i=0; i < this.particleSystemHORefs.length; i++)
			if(this.particleSystemHORefs[i].parent != null) this.particleSystemHORefs[i].parent.removeChild(this.particleSystemHORefs[i]);

		for(var i=0; i < this.puffsRefs.length; i++)
			if(this.puffsRefs[i].parent != null) this.puffsRefs[i].parent.removeChild(this.puffsRefs[i]);

		for(var i=0; i < this.HOAnimationsArray.length; i++)
			if(this.HOAnimationsArray[i].parent != null) this.HOAnimationsArray[i].parent.removeChild(this.HOAnimationsArray[i]);
	}

	startAnimation(e)
	{
		if(createjs.Ticker.getTicks(false) > this.timeToCheckTicks)
		{
			for(var i=0; i < this.HOAnimationsArray.length; i++)
			{
				if(this.HOAnimationsArray[i].children)
					this.HOAnimationsArray[i].init();
				else
					console.log(this.HOAnimationsArray[i].name + " children undefined");
			}
			createjs.Ticker.removeEventListener("tick", this.startAnimationBound);
			stage.update();
		}
	}
}
