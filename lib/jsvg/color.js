
function Color(r,g,b,a) 
{
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Color.prototype.rgba = function(r,g,b,a) 
{
	return new Color(r,g,b,a);
};

Color.prototype.v4 = function()
{
	return [this.r, this.g, this.b, this.a];
}

Color.prototype.white = function() 
{
	return Color.prototype.rgba(1.0,1.0,1.0,1.0);
};

Color.prototype.black = function() 
{
	return Color.prototype.rgba(0.0,0.0,0.0,1.0);
};

Color.prototype.HEXtoRGB = function(hex) {
	return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
}


Color.prototype.hexa = function() 
{
	var multiple = 256.0;
	return (Math.round(this.r * (multiple-1))* multiple * multiple + Math.round(this.g * (multiple-1)) * multiple  + Math.round(this.b * (multiple-1)));
};


Color.prototype._getHSLcomponent = function( tC, p, q ) 
{
	var result = tC;
    while (result < 0.0) {
		result = result + 1.0;
	}

	while( result > 1.0 ) {
		result = result - 1.0;
	}

    if (result < (1.0 / 6.0)) {
		result = p + ( (q-p) * 6.0 * result );
	} else if (result >=(1.0 / 6.0) && result < 0.5) {
		result = q;
	} else if( result >= 0.5 && result < (2.0 / 3.0)) {
		result = p + ( (q-p) * 6.0 * ((2.0 / 3.0) - result) );
	} else {
		result = p;
	}
    return result;
};

Color.prototype._hsl2rgb = function( h_, s_, l_)
{
	// console.log("h, s, l", h, s, l);

    var h = h_ * 360.0;
	var q = 0.0;
    if (l_ < 0.5)
		q = l_ * (1.0 + s_);
    else
		q = l_ + s_ - (l_ * s_);

    var p = 2 * l_ - q;
    var hk = h / 360.0;
    var tR = hk + 1.0 / 3.0;
    var tG = hk;
    var tB = hk - 1.0 / 3.0;

    tR = this._getHSLcomponent( tR, p, q );
    tG = this._getHSLcomponent( tG, p, q );
    tB = this._getHSLcomponent( tB, p, q );

	// console.log("tR, tG, tB, p, q",tR, tG, tB, p, q);

    return [tR,tG,tB];
};


//
// set rgba color from hsla
//
Color.prototype.hsla = function( h, s, l, a) 
{
    var ch = rcircular(0.0,1.0, h );
    var cs = rtrim(0.0,1.0, s );
    var cl = rtrim(0.0,1.0, l );
    var ca = rtrim(0.0,1.0, a );
    var values = this._hsl2rgb( ch, cs, cl );
	
	// console.log("hsla rgb values",values);

	this.r = values[0];
	this.g = values[1];
	this.b = values[2];
	this.a = ca;
	// console.log("this",this);
	return this;
};

