
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








