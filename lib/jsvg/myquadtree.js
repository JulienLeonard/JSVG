
function Quad(fviewbox,xmin,ymin,xmax,ymax)
{
	this.xmin = xmin;
	this.xmax = xmax;
	this.ymin = ymin;
	this.ymax = ymax;
	this.subquads  = [];
	this.circlemap = [];
	this.fviewbox = fviewbox;
	this.MAXCIRCLENUMBER = 10;
}

Quad.prototype.leaves = function() {
	var result = []
	if (this.subquads.length > 0) {
		for (var isubquad = 0; isubquad < this.subquads.length; isubquad++) {
			var csubquad = this.subquads[isubquad];
			result = result.concat(csubquad.leaves());
		}
	} else {
		result.push(this);
	}
	return result;
}

Quad.prototype.descr = function() {
	return "- xmin " + this.xmin + " xmax " + this.xmax + " ymin " + this.ymin + " ymax " + this.ymax;
};

Quad.prototype.circles = function() {
	var result = [];
	for (var isubquad = 0; isubquad < this.subquads.length; isubquad++) {
		var csubquad = this.subquads[isubquad];
		result = result.concat(csubquad.circles());
	}
	result = result.concat(this.circlemap);
	return result;
};

Quad.prototype.intersect = function(circle) {
	var coords = this.fviewbox(circle);
	var xmin = coords[0];
	var ymin = coords[1];
	var xmax = coords[2];
	var ymax = coords[3];
	
	var errormargin = 0.00000001;

	var result = false;
	if ((xmin <= (this.xmax *(1.0 + errormargin))) && (xmax >= (this.xmin*(1.0-errormargin))) && (ymin <= (this.ymax*(1.0 + errormargin))) && (ymax >= (this.ymin*(1.0 - errormargin)))) {
		result = true;
	}

	return result;
};

Quad.prototype.add = function(circle,push) {
	if (!this.intersect(circle)) {
		var coords = this.fviewbox(circle);
		var xmin = coords[0];
		var ymin = coords[1];
		var xmax = coords[2];
		var ymax = coords[3];

		if (xmin < this.xmin) {this.xmin = xmin;}
		if (ymin < this.ymin) {this.ymin = ymin;}
		if (xmax > this.xmax) {this.xmax = xmax;}
		if (ymax > this.ymax) {this.ymax = ymax;}
            
		this.insert(circle,push);
	} else {
		this.addwithoutcheck(circle,push);
	}
};

// TODO        
// Quad.prototype.pop = function(push) {
// 	if (push in this.circlemap) {
// 	   this.circlemap.pop(push)
// 		}
// 	for subquad in this.subquads:
//             subquad.pop(push)

Quad.prototype.addwithoutcheck = function(circle,push) {
	if (this.subquads.length > 0) {
		this.dispatch(circle,push);
	} else {
		this.insert(circle,push);
	}
};
        
Quad.prototype.dispatch = function(circle,push) {
	for (var isubquad = 0; isubquad < this.subquads.length; isubquad++) {
		var subquad = this.subquads[isubquad];
		if (subquad.intersect(circle)) {
			subquad.addwithoutcheck(circle,push);
		}
	}
};

Quad.prototype.ncircles = function() {
	return this.circlemap.length;
};

Quad.prototype.insert = function(circle,push) {

	this.circlemap.push(circle);
        
	if (this.ncircles() > this.MAXCIRCLENUMBER) {
		this.split();
	}
};

Quad.prototype.split = function() {
	var middlex = (this.xmin + this.xmax)/2.0;
    var middley = (this.ymin + this.ymax)/2.0;
        
	this.subquads.push(new Quad(this.fviewbox,this.xmin,this.ymin,middlex,middley) );
	this.subquads.push(new Quad(this.fviewbox,this.xmin,middley,middlex, this.ymax) );
	this.subquads.push(new Quad(this.fviewbox,middlex,middley,this.xmax, this.ymax) );
	this.subquads.push(new Quad(this.fviewbox,middlex,this.ymin,this.xmax, middley) );
        
	for (var icircle = 0; icircle < this.circlemap.length; icircle++) {
		var ccircle = this.circlemap[icircle];
		this.dispatch(ccircle,0);
	}

	this.circlemap = [];
};
        
Quad.prototype.mayintersect = function(newcircle) {
	var result = []
	if (this.intersect(newcircle)) {
		if (this.subquads.length) {
			for (var isubquad = 0; isubquad < this.subquads.length; isubquad++) {
				var subquad = this.subquads[isubquad];
				if (subquad.intersect(newcircle)) {
					var subresult = subquad.mayintersect(newcircle);
					result = result.concat(subresult);
				}
			}
		}
		else
		{
			result = result.concat(this.circlemap);
		}
	}
	return result;
};

Quad.prototype.bbox = function() {
	return [this.xmin,this.ymin,this.xmax,this.ymax];
}

function QuadTree(width,height) {
	this.rootquad = new Quad(circleviewbox,-width,-height,width,height);
	this.mpush = 0;
};

QuadTree.prototype.push = function() {
	this.mpush += 1;
};

QuadTree.prototype.pop = function() {
	// this.rootquad.pop(this.mpush)
	this.mpush += -1;
};

QuadTree.prototype.add = function(circle) {
	this.rootquad.add(circle,this.mpush);
};

QuadTree.prototype.adds = function(circles) {
	for (var icircle = 0; icircle < circles.length; icircle++) {
		var ccircle = circles[icircle];
		this.add(ccircle);
	}
	return this;
};

QuadTree.prototype.iscolliding = function(newcircle,errormargin) {
	var circles = this.rootquad.mayintersect( newcircle );
	for (var icircle = 0; icircle < circles.length; icircle++) {
		var ccircle = circles[icircle];
		if (arecirclescolliding(newcircle,ccircle,errormargin)) {
			return true;
		}
	}
	return false;
};

QuadTree.prototype.collidings = function(newcircle,errormargin) {
	var result = [];
	var circles = this.rootquad.mayintersect( newcircle );
	for (var icircle = 0; icircle < circles.length; icircle++) {
		var ccircle = circles[icircle];
		if (arecirclescolliding(newcircle,ccircle,errormargin)) {
			result.push(ccircle);
		}
	}
	return result;
};
 
QuadTree.prototype.circles = function() {
	return this.rootquad.circles();
};

QuadTree.prototype.leaves = function() {
	return this.rootquad.leaves();
};