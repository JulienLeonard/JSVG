//
// abstract interface for bpattern computation
//
function bpattern(side,inodes) {
    this.lastindex = 1;
    this.nodes = inodes;
    this.side = side;

	this.iter = function(quadtree,canvas) {
		return [];
	}
}

//
// default bpattern packing
//

function plug(c1,c2,side) {
	return {c1: c1, c2: c2, side: side}
}

function bpatternparrot(inodes) {
    this.lastindex = 1;
    this.nodes     = inodes;
	this.front     = [plug(inodes[0],inodes[1],1.0),plug(inodes[0],inodes[1],-1.0)];
	this.nsubiter  = 4;
	this.nsubpattern = 50;

	this.iter = function(quadtree,canvas) {
		result = [];

		for (var i = 0; i < this.nsubpattern; i++)
		{
			var nend     = this.nsubiter;
			var oldfront = this.front.slice(0,nend);
			this.front   = this.front.slice(nend);
		
			for (var ifront = 0; ifront < oldfront.length; ++ifront) {
				var lastplug = oldfront[ifront];
				var c1 = lastplug.c1;
				var c2 = lastplug.c2;
				var side = lastplug.side;
				var newr = mymin([c1.r,c2.r])*0.99;
			
				if (newr > 0.1) {
					var newnode = circles2tangent(c1,"OUT",c2,"OUT",newr,side);
					if (!checkcollisionquadtree(quadtree,newnode)) {
						this.nodes.push(newnode);
						// quadtree.insert(newnode);
						insertquadtree(quadtree,newnode);

						// var ncolor = d3.hsl(((this.nodes.length + 10)%(600))/(600)*360.0, 1.0, 0.5);
					    var ncolor = myhsla(((this.nodes.length + 500)%(1000))/(1000) * 0.15, 1.0, ((this.nodes.length + 400)%(800))/(800),1.0);
						drawcircle(canvas,circle(newnode.x,newnode.y,newnode.r*1.5),ncolor);

						var newfront = [plug(newnode,c1,-side)].concat(this.front.slice(0));
						this.front = newfront;
						newfront = [plug(c2,newnode,-side)].concat(this.front.slice(0));
						this.front = newfront;

						result.push(newnode);
					}
				}
			}
		}

		return result;
	}
}

function bpatternpacking(inodes,fradius,fcolor) {
    this.lastindex = 1;
    this.nodes     = inodes;
    for (var inode = 0; inode < inodes.length; inode++) {
	this.nodes[inode].colorindex = 0;
    }
    this.front     = [plug(inodes[0],inodes[1],1.0),plug(inodes[0],inodes[1],-1.0)];
    this.nsubiter  = 1000;
    this.maxiter   = 300000;
    this.niter     = 0;
    this.fradius   = fradius;
    this.fcolor    = fcolor;
    
    this.iter = function(quadtree,canvas) {
	result = [];
	if (this.niter <= this.maxiter) {
	    for (var iiter = 0; iiter < this.nsubiter; iiter++) {
		if (this.front.length > 0) {
		    var lastplug = this.front[0];
		    this.front = this.front.slice(1);
		    var c1 = lastplug.c1;
		    var c2 = lastplug.c2;
		    var side = lastplug.side;
		    var newr = this.fradius(c1,c2);
		    
		    if (newr > 0.05) {
			var newnode = circles2tangent(c1,"OUT",c2,"OUT",newr,side);
			if (!checkcollisionquadtree(quadtree,newnode)) {
			    this.nodes.push(newnode);
			    insertquadtree(quadtree,newnode);
			    newnode.colorindex = mymax([c1.colorindex,c2.colorindex]) + 1;
			    
			    // var ncolor = d3.hsl(((this.nodes.length)%(3600))/(3600)*360.0, 1.0, 0.5);
			    var ncolor = this.fcolor(newnode);

			    drawcircle(canvas,circle(newnode.x,newnode.y,newnode.r),ncolor);
			    
			    this.front.push(plug(newnode,c1,-side));
			    this.front.push(plug(c2,newnode,-side));
			    this.front.push(plug(newnode,c1,side));
			    this.front.push(plug(c2,newnode,side));

			    result.push(newnode);
			}
		    }

		    this.niter += 1;
		}
	    }
	}

	return result;
    }
}


function bpattern2(inodes) {
    // this.lastindex = 1;
    this.nodes     = inodes;
    this.front     = [plug(inodes[0],inodes[1],1.0),plug(inodes[0],inodes[1],-1.0)];
    this.niter     = 0;
    this.maxiter   = 300000;
    
    this.iter = function(quadtree,canvas) {
	result = [];

	if (this.niter <= this.maxiter) {
	    if (this.front.length > 0) {
		var oldfront = this.front.slice(0)
		this.front = []
		for (var ifront = 0; ifront < oldfront.length; ++ifront)
		{
		    var lastplug = oldfront[ifront];
		    var c1 = lastplug.c1;
		    var c2 = lastplug.c2;
		    var side = lastplug.side;
		    var newr = mymax([c1.r,c2.r])*rand(1.075,0.85);
		    if (newr > 0.1) {
			var newnode = circles2tangent(c1,"OUT",c2,"OUT",newr,side);
			if (!checkcollisionquadtree(quadtree,newnode)) {
			    this.nodes.push(newnode);
			    // quadtree.insert(newnode);
			    insertquadtree(quadtree,newnode);
			    
			    // var ncolor = d3.hsl(((this.nodes.length + 10)%(600))/(600)*360.0, 1.0, 0.5);
			    // var ncolor = myhsla(((this.nodes.length + 500)%(1000))/(1000) * 0.15, 1.0, ((this.nodes.length + 400)%(800))/(800),1.0);
			    var ncolor = myhsla(0.0, 1.0, 1.0,1.0);
			    drawcircle(canvas,circle(newnode.x,newnode.y,newnode.r),ncolor);
			    // front.push([c2,newnode,-side]);
			    this.front.push(plug(c2,newnode,-side));
			    if (rand(0.0,1.0) < 0.2) {
				this.front.push(plug(newnode,c1,-side));
				this.front.push(plug(c2,newnode,side));
			    }
			    //front.push([newnode,c2,side]);
			    // front.push([c1,newnode,-side]);
			    result.push(newnode);
			}
		    }

		    this.niter++;
		}
	    }
	}
	return result;
    };
}
