
function BS() {
	this.mlist = [];
}

BS.prototype.push = function(ntimes) {
	var lastside = 1.0;
	if (this.mlist.length > 0) {
		lastside = -llast(this.mlist);
	}

	this.mlist = this.mlist.concat(lfill(lastside,ntimes));
	return this;
};

BS.prototype.list = function() {
	return this.mlist;
}

BS.prototype.alts = function(list) {
	for (var i = 0; i < list.length; i++) {
		this.push(list[i]);
	} 
	return this;
};