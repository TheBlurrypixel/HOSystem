this.Functions = this.Functions||{};
( function() {
  Functions =
  {
  	//t is the current time (or position) of the tween. This can be seconds or frames, steps, seconds, ms, whatever – as long as the unit is the same as is used for the total time [3].
  	//b is the beginning value of the property.
  	//c is the change between the beginning and destination value of the property.
  	//d is the total time of the tween.

  	// Cubic Ease
  	ease : function ease(t, b, c, d) // make it public static so its accessible
  	{
  		var ts =(t*t)/(d*d);
  		var tc =ts*t;
  		return b+c*(-2*tc + 3*ts);
  	},

  	customEase : function customEase(t, b, c, d)
  	{
  		var ts =(t*t)/(d*d);
  		var tc =ts*t;
  		return b+c*(21.3975*tc*ts + -60.3425*ts*ts + 58.695*tc + -22.5*ts + 3.75*t);
  	},

  	easeQuintic : function easeQuintic(t, b, c, d)
  	{
  		var ts=(t*t)/(d*d);
  		var tc=ts*t;
  		return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
  	},

  	easeInCubic : function easeInCubic(t, b, c, d)
  	{
  		var tc=(t*t*t)/(d*d*d);
  		return b+c*(tc);
  	},

  	easeInQuintic : function easeInQuintic(t, b, c, d)
  	{
  		var ts=(t*t)/(d*d);
  		var tc=ts*t;
  		return b+c*(tc*ts);
  	},

  	easeOutCubic : function easeOutCubic(t, b, c, d)
  	{
  		var ts=(t*t)/(d*d);
  		var tc=ts*t;
  		return b+c*(tc + -3*ts + 3*t);
  	},

  	easeOutQuintic : function easeOutQuintic(t, b, c, d)
  	{
  		var ts =(t*t)/(d*d);
  		var tc =ts*t;
  		return b+c*(-1*ts*ts + 4*tc + -6*ts + 4*t);
  	},

  	linear : function linear(t, t1, t2, o1, o2)
  	{
  		return ((t-t1)*(o2-o1)/(t2-t1)) + o1;
  	},

  	linearClamped : function linearClamped(t, t1, t2, o1, o2)
  	{
  		var values = t1 > t2 ? new createjs.Point(t1, t2): new createjs.Point(t2, t1);
  		t = (t <= values.x) ? ( (t >= values.y) ? t : values.y ) : values.x ;

  		return ((t-t1)*(o2-o1)/(t2-t1)) + o1;
  	},

  	magnitude : function magnitude(pointA, pointB)
  	{
  		return Math.sqrt( (pointA.x-pointB.x)*(pointA.x-pointB.x) + (pointA.y-pointB.y)*(pointA.y-pointB.y) );
  	},

  	linear2D : function linear2D(t, p0, p1)
  	{
  		var resPoint = new createjs.Point();

  		resPoint.x =	((p1.x-p0.x) * t) + p0.x;
  		resPoint.y =	((p1.y-p0.y) * t) + p0.y;

  		return resPoint;
  	},

  	calcCatmullRomPoint : function calcCatmullRomPoint(t, p0, p1, p2, p3)
  	{
  		var res = new createjs.Point();

  		var t2 = t*t;
  		var t3 = t2 * t;

  		// calculate x
  		res.x = (0.5 *( (2 * p1.x) + (-p0.x + p2.x) * t +(2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 +(-p0.x + 3*p1.x- 3*p2.x + p3.x) * t3));
  		// calculate y
  		res.y = (0.5 *( (2 * p1.y) + (-p0.y + p2.y) * t +(2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 +(-p0.y + 3*p1.y- 3*p2.y + p3.y) * t3));

  		/*
  		// First and Second Derivatives
  		// P'(t)
  		var secondn:Number = 0.5 * (-p0 + p2) + t * (2*p0 - 5*p1 + 4*p2 - p3) + t2 * 1.5 * (-p0 + 3*p1 - 3*p2 + p3);
  		// P''(t)
  		var thirdn:Number = (2*p0 - 5*p1 + 4*p2 - p3) + t * 3.0 * (-p0 + 3*p1 - 3*p2 + p3);
  		*/

  		return res;
  	},

  	quad : function quad(t, p0, p1, p2)
  	{
  		var result = new createjs.Point();

  		var oneMinusTSq = (1-t) * (1-t);
  		var TSq = t*t;

  		result.x = oneMinusTSq * p0.x + 2 * (1-t) * t * p1.x + TSq * p2.x;
  		result.y = oneMinusTSq * p0.y + 2 * (1-t) * t * p1.y + TSq * p2.y;

  		return result;
  	},

  	/*
  	* Computes x,y values for a given traversal of a Hermite Curve
  	* @param t:Number - a normalized value (0.0 to 1.0) describing path traversal
  	* @param points:Array - an array contining the 4 points describing the curve (P0,T0,T1,P1 - always in this order)
  	* Anchor points are relative to they're control points
  	*/
  	hermite : function hermite(t, p0, p1, p3, p2)
  	{
  		var resPoint = new createjs.Point();

  		resPoint.x =	(2 * Math.pow(t,3) - 3 * t * t + 1) * p0.x +
  						(Math.pow(t,3) - 2 * t * t + t) * p1.x +
  						(- 2 * Math.pow(t,3) + 3*t*t) * p2.x +
  						( Math.pow(t,3) - t*t) * p3.x;

  		resPoint.y =	(2 * Math.pow(t,3) - 3 * t * t + 1) * p0.y +
  						(Math.pow(t,3) - 2 * t * t + t) * p1.y +
  						(- 2 * Math.pow(t,3) + 3*t*t) * p2.y +
  						( Math.pow(t,3) - t*t) * p3.y;

  		return resPoint;
  	}
  }
})();

export default Functions;
