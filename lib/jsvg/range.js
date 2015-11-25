
R = function(v1,v2) {
	this.mv1 = v1;
	this.mv2 = v2;
};

R.prototype.v1 = function(v) {
	if (typeof(v)==='undefined') return this.mv1;
	this.mv1 = v;
	return this;
};

R.prototype.v2 = function(v) {
	if (typeof(v)==='undefined') return this.mv2;
	this.mv2 = v;
	return this;
};

R.prototype.middle = function() {
	return (this.mv1 + this.mv2)/2.0;
};

R.prototype.minv = function() {
	return iff(this.mv1 <= this.mv2, this.mv1, this.mv2);
};

R.prototype.maxv = function() {
	return iff(this.mv1 >= this.mv2, this.mv1, this.mv2);
};

R.prototype.sample = function(t) {
	if (t < 0.0 || t > 1.0) {return null;}
	return sample(this.mv1,this.mv2,t);
};

R.prototype.samples = function(nsamples) {
	return samples(this.mv1,this.mv2,nsamples);
};

R.prototype.v = function(t) {
	return this.sample(t);
};

R.prototype.abscissa = function(t) {
	if (t < this.minv() || t > this.maxv()) {return null;}
	return abscissa(this.mv1,this.mv2,t);
};

R.prototype.contain = function(t) {
	if (t < this.minv() || t > this.maxv()) {return false;}
	return true;
};

R.prototype.rand = function() {
	return rand(this.mv1,this.mv2);
};

R.prototype.rands = function(n) {
	var result = [];
	for (var i = 0; i < n; i++) {
		result.push(this.rand());
	}
	return result;
};

R.prototype.trim = function(v) {
	if (v < this.minv()) {return this.minv();}
	if (v > this.maxv()) {return this.maxv();}
	return v;
};

R.prototype.symsample = function(t) {
	if (t <= 0.5) {
		return this.sample( t * 2.0);
	}
	return this.sample( 2.0 * (1.0 - t ));
};
















