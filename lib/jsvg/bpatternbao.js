

function bpatternbao(side,inodes,fdraw) {
    this.lastindex = 1;
    this.nodes = inodes;
    this.side = side;
	this.fdraw = fdraw;

	this.iter = function(quadtree,canvas) {
		var nsubiter  = 1000;
		var isubiter  = 0;
		var maxnsubiter = nsubiter;
		var lastindex = this.lastindex;
		var nodes     = this.nodes;
		var side      = this.side;
		var result    = [];  
		var nradiuss = lconcat(samples(1.0,10.0,30),samples(10.0,1.0,30));
		var ncollisions = 0;
		
		for (isubiter = 0; isubiter < maxnsubiter; isubiter++) {
				
			if (lastindex > -1) {

				// lastpattern += 1;
				// console.log(" lastindexs " + lastindexs +  " lastpattern "+lastpattern+" lastindex "+lastindex+" nodes "+nodes);

				var newfactor = rand(0.9,1.1);
				var lastnode = nodes[lastindex];
				var newr = 2.5 * newfactor * rand(0.8,1.2) * lcircular(nradiuss,nodes.length);
				var bignode = circle(lastnode.x,lastnode.y,lastnode.r + newr * 2.0);

				var ccollidings = collidings(quadtree,bignode);
				var icol = 0;
				var found = false;
				
				for (icol = 0; icol < ccollidings.length; icol++) {
					if (lastnode != ccollidings[icol] && ccollidings[icol].r < 0.5)
					{
						var nnewnode = circles2tangent(lastnode,"OUT",ccollidings[icol],"OUT",newr,side);
						if (nnewnode.x != NaN) {
							if (!checkcollisionquadtree(quadtree,nnewnode)) {
								ncollisions = 0;
								nodes.push(nnewnode);
								this.nodess = nodes;
									
								quadtree.insert(nnewnode);
								this.fdraw(canvas,this,lastindex);

								found = true;
								result = [nnewnode];
								break;
							}
						}
					}
				} 

				if (!found) {
					for (icol = 0; icol < ccollidings.length; icol++) {
						if (lastnode != ccollidings[icol])
						{
							var nnewnode = circles2tangent(lastnode,"OUT",ccollidings[icol],"OUT",newr,side);
							if (nnewnode.x != NaN) {
								if (!checkcollisionquadtree(quadtree,nnewnode)) {
									ncollisions = 0;
									nodes.push(nnewnode);
									this.nodess = nodes;
									
									var ncolor = d3.hsl(((lastindex+10)%(60))/(60)*360.0, 1.0, 0.5);

									quadtree.insert(nnewnode);
									drawcircle(canvas,circle(nnewnode.x,nnewnode.y,nnewnode.r),ncolor);
									found = true;
									result = [nnewnode];
									break;
								}
							}
						}
					} 
				}

				if (!found) {
					// console.log("no newnode");
					lastindex = lastindex - 1;
					// maxnsubiter = 3 * nsubiter;
				} else {
					lastindex = nodes.length-1;
				}
				this.lastindex = lastindex;
			}
		}
		return result;
	}
}

function nodeindex (node) {
	if (node == null) {
		return null;
	}
	return node.index;
}

function nodex (node) {
	if (node == null) {
		return null;
	}
	return node.x;
}
function nodey (node) {
	if (node == null) {
		return null;
	}
	return node.y;
}



function bpatternbaoswitch(sides,nradiuss,inodes,fdraw) {
    this.lastindex = 1;
    this.nodes = inodes;
    this.sides = sides;
	inodes[0].index = 0;
	inodes[1].index = 1;
	inodes[0].retouch = false;
	inodes[1].retouch = false;
	inodes[0].notfound = false;
	inodes[1].notfound = false;
	inodes[0].colorindex = 0;
	inodes[1].colorindex = 1;

	this.lastnode     = inodes[1];
	this.othernode    = inodes[0];
	this.lastlastnode = inodes[0];
	this.last3node    = null;

	// this.firsttocheck = 1;

	// this.sort1 = function(node1,node2) {return node1.index <= node2.index;};
	// this.sort2 = function(node1,node2) {return node1.index >= node2.index;};
	this.sortdist = function(anode) {return function(a,b) {return (dist2(a,anode) - dist2(b,anode));}; };
	
	this.fdraw = fdraw;
	this.collisionmargin = 0.0001;

	this.iter = function(quadtree,canvas,nsubiter) {
		var maxnsubiter = nsubiter;
		var lastindex = this.lastindex;
		var nodes     = this.nodes;
		var sides     = this.sides;
		var result    = [];  
		// var nradiuss = lconcat(samples(1.0,3.0,21),samples(3.0,1.0,21));
		// var realcollisions = [];
		
		for (var isubiter = 0; isubiter < maxnsubiter; isubiter++) {
				
			if (lastindex > -1) {

				// console.log("isubiter ",isubiter);
				var lastnode     = this.lastnode;
				var othernode    = this.othernode;
				var lastlastnode = this.lastlastnode;
				var last3node    = this.last3node;

				// console.log("lastnode index ", nodeindex(lastnode), nodex(lastnode), nodey(lastnode), " othernode index ", nodeindex(othernode), nodex(othernode), nodey(othernode), " lastlastnode index ", nodeindex(lastlastnode), nodex(lastlastnode), nodey(lastlastnode));
				// var newr         = lcircular(nradiuss,nodes.length);
				var newr         = lcircular(nradiuss,lastindex);
				// console.log("newr ",newr);
				var bigr         = lastnode.r + newr * 2.1;
				var bignode      = new Circle(lastnode.x,lastnode.y,bigr);
				var side         = lcircular(sides,nodes.length);
				var lastside     = lcircular(sides,nodes.length-1);

				var found            = false;
				var incrradiusfactor = 1.0;

				if (side != lastside || lastindex == 1) {
					// console.log("!! switch side !!");
					othernode = lastlastnode;
				} 
				
				if (this.othernode != null) {
					// console.log("this.othernode != null");
					var allsides = [side,-side];
					for (var iside = 0; iside < allsides.length; iside++) 
					{
						var newnode = circles2tangent(lastnode,"OUT",othernode,"OUT",newr,allsides[iside]);
						if (newnode.x != NaN) {
							
							//for (var ireal = 0; ireal < realcollisions.length; ireal++ ) {
							//	drawcircle(canvas,realcollisions[ireal],d3.hsl(0.2*360.0,1.0,1.0));
							//}									
							// realcollisions = collidings(quadtree,cscale(newnode,1.0),this.collisionmargin);
							// console.log("othernode real collisions number", realcollisions.length);
							//for (var ireal = 0; ireal < realcollisions.length; ireal++ ) {
							//	drawcircle(canvas,realcollisions[ireal],d3.hsl(0.2*360.0,1.0,0.5));
							//}

							if (!checkcollisionquadtree(quadtree,newnode,this.collisionmargin)) {
							// if (!checkcirclescollision(this.nodes,newnode,this.collisionmargin)) {
								nodes.push(newnode);
								newnode.retouch = false;
								newnode.notfound = false;

								newnode.index      = nodes.length;
								newnode.colorindex = lastnode.colorindex + 1;

								this.nodes = nodes;
								this.last3node    = this.lastlastnode;
								this.lastlastnode = this.lastnode;
								this.lastnode  = newnode;
								this.othernode = othernode; 
							
								this.othernode.retouch = true;


								insertquadtree(quadtree,newnode);
								// drawcircle(canvas,new Circle(newnode.x,newnode.y,newnode.r*incrradiusfactor),fcolor(lastindex));
								this.fdraw(canvas,this,lastindex);
								found = true;
								result.push(newnode);
								// console.log("newnode ",newnode.r);
								break;
							}
							else
							{
								// console.log("othernode use collision: no new node yet");
							}
						}
					}						
				}

				if (found == false) {
					// console.log("found == false");

					var fsort = this.sortdist(lastnode);
					var fremovelast = function(item) {return (!(item == lastlastnode || item == last3node));};

					var ccollidings = collidings(quadtree,bignode,this.collisionmargin).filter(fremovelast).sort(fsort);
					// var ccollidings = collidings(quadtree,bignode,this.collisionmargin);
				
					// console.log("ccollidings ",ccollidings.length);

					for (var icol = 0; icol < ccollidings.length; icol++) {
						var ccolliding = ccollidings[icol];
						// if (lastnode != ccolliding && ((!(lastlastnode === ccolliding) && (side === lastside)) || (lastlastnode === ccolliding && !(side === lastside))))
						if (lastnode != ccolliding)
						{
							var allsides = [side,-side];
							for (var iiside = 0; iiside < allsides.length; iiside++) 
							{
								var newnode = circles2tangent(lastnode,"OUT",ccolliding,"OUT",newr,allsides[iiside]);
								if (newnode.x != NaN) {

									//for (var ireal = 0; ireal < realcollisions.length; ireal++ ) {
									//	drawcircle(canvas,realcollisions[ireal],d3.hsl(0.2*360.0,1.0,1.0));
									//}									
									// realcollisions = collidings(quadtree,newnode,this.collisionmargin);
									//for (var ireal = 0; ireal < realcollisions.length; ireal++ ) {
									//	drawcircle(canvas,realcollisions[ireal],d3.hsl(0.2*360.0,1.0,0.5));
									//}


									if (!checkcollisionquadtree(quadtree,newnode,this.collisionmargin)) {
									// if (!checkcirclescollision(ccollidings,newnode,this.collisionmargin)) {
									// if (!checkcirclescollision(this.nodes,newnode,this.collisionmargin)) {
										newnode.retouch = false;
										newnode.notfound = false;

										newnode.index = nodes.length;
										newnode.colorindex = lastnode.colorindex + 1;

										nodes.push(newnode);
										this.nodes = nodes;
										this.last3node    = this.lastlastnode;
										this.lastlastnode = this.lastnode;
										this.lastnode     = newnode;
										this.othernode    = ccolliding; 
									
										this.othernode.retouch = true;

										insertquadtree(quadtree,newnode);
										// drawcircle(canvas,new Circle(newnode.x,newnode.y,newnode.r*incrradiusfactor),fcolor(lastindex));
										this.fdraw(canvas,this,lastindex);
										found = true;
										result.push(newnode);
										// console.log("newnode ",newnode.r);
										break;
									}
								}
							}
						}
						if (found) {
							break;
						}
					} 
				}

				if (!found) {
					// console.log("no newnode lastindex",lastindex);
					var freenode = nodes[lastindex];
					freenode.notfound = true;
					// while (freenode.retouch && lastindex > 0)
					while ((freenode.retouch || freenode.notfound) && lastindex > 0)
					{
						// console.log("lastindex",lastindex,"retouch",freenode.retouch,"notfound",freenode.notfound);
						lastindex = lastindex - 1;
						freenode = nodes[lastindex];
					}
					// console.log("no newnode: good lastindex",lastindex);
					
				    this.lastnode     = nodes[lastindex];
					this.lastlastnode = nodes[lastindex-1];
				    this.othernode = null;

					// maxnsubiter = 3 * nsubiter;
				} else {
					lastindex = nodes.length - 1;
				}
				this.lastindex = lastindex;
			}
		}
		return result;
	}
}