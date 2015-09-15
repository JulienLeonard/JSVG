// <script type="text/javascript" src="./d3.v3/d3.v3.min.js"></script>
// <script type="text/javascript" src="myd3.js"></script>
// <script type="text/javascript" src="sylvester.js"></script>
// <script type="text/javascript" src="myquadtree.js"></script>
// <script type="text/javascript" src="utils.js"></script>
// <script type="text/javascript" src="geoutils.js"></script>
// <script type="text/javascript" src="bpattern.js"></script>
// <script type="text/javascript" src="bpatternbao.js"></script>


var canvasname    = "incredible";
var quadtree      = null;
var lastpatternid = 0;
var patterns      = [];
var canvas        = null;

function bidirection(i,modulo) {
	if ((i % (2*modulo)) < modulo) {
		return i % modulo;
	} else {
		return modulo - (i % modulo);
	}
}

function fdraw(canvas,pattern,lastindex) {
	// var ncolor = myhsla(lastindex/10.0, 1.0, 0.5, 1.0);

	var newnode  = pattern.nodes[pattern.nodes.length-1];
	var lastnode = pattern.nodes[pattern.nodes.length-2];

	var colorindex = newnode.colorindex;
	var factor = 14.5;
	var ncolor = myhsla((bidirection(colorindex,(14100*factor)) + 19000*factor)/(34100*factor), 1.0, bidirection(colorindex,(3410*factor))/(3410*1.1*factor),1.0);

	// console.log("fdraw circle",newnode,"ncolor",ncolor);

	drawcircle(canvas,cscale(newnode,2.5),ncolor);

	if (arecircletangent(newnode,lastnode) && false) {
		var seg = [ccenter(newnode),ccenter(lastnode)];
		var ccircles = linecircles(seg[0],seg[1],10);
		for (var ic = 0; ic < ccircles.length; ic++) {
			var ccircle = ccircles[ic];
			// console.log(" ccircle ", ccircle.x,"",ccircle.y);
			var light = 0.0;
			if (lcircular(pattern.sides,lastindex+1) < 0) {
				light = 1.0;
			}
			// drawcircle(canvas,cscale(ccircle,2.0),ncolor);
			// drawcircle(canvas,new Circle(ccircle.x,ccircle.y,newnode.r/0.5),ncolor);
		}
	}
}


function context() {

	initrandomseed(0);

	var w = 2000,
		h = 1000,
	    background = Color.prototype.black();
	

	canvas = initcanvas(canvasname,w,h,background);

	var iter = 0;
	var maxiter = 5000000;
	var viewbox0 = [];


	// var touchdrawcircle = function(event) {
	// 		for (var i = 0; i < event.touches.length; i++) {
	// 			var touch = event.touches[i];
	// 			drawcircle(canvas,circle(touch.pageX, touch.pageY,1.0),ncolor);
	// 			// ctx.beginPath();
	// 			// ctx.arc(touch.pageX, touch.pageY, 20, 0, 2*Math.PI, true);
	// 			// ctx.fill();
	// 			// ctx.stroke();
	// 		}
	// };

	var createpattern = function(x,y) {
		var newnodes = [new Circle(0.0,1.0,1.0),new Circle(2.0,1.0,1.0)];
		// var newnodes = [new Circle(eventcoords[0]-1.0,eventcoords[1],1.0),new Circle(eventcoords[0]+1.0,eventcoords[1],1.0)];

		// drawcircle(canvas,circle(eventcoords[0],eventcoords[1],10.0),d3.hsl(myrandom() * 360.0, 1,1));
		if (!checkcollisionquadtree(quadtree,newnodes[0],0.001) && !checkcollisionquadtree(quadtree,newnodes[1],0.001)) {

			var inode = 0;
			for (inode = 0; inode < newnodes.length; inode++) {
				// var ncolor = d3.hsl(myrandom()*360.0, 1.0, 0.5);
				var ncolor = myhsla((1%1600/(1600)), 1.0, 0.5, 1.0);
				insertquadtree(quadtree,newnodes[inode]);
				drawcircle(canvas,newnodes[inode],Color.prototype.rgba(0.5,0.5,0.5,1.0));
			}


			//  add a frame to limit the circles. Only in quadtree, not in nodess
			var framecircle = new Circle(0.0,0.0,2000.0);
			var framecenters = circlepoints(framecircle,6000,0.0);
			for (var iframe = 0; iframe < framecenters.length; iframe++) {
				var framecenter  = framecenters[iframe];
				var cframe = new Circle(framecenter.x, framecenter.y,1.0);
				insertquadtree(quadtree,cframe);
				// drawcircle(canvas,cframe,myhsla(0.0,1.0,0.5,1.0));
			}
			

			var side = 1.0;
			if (patterns.length % 2 == 0) {
				side = 1.0;
			}

			// function(lastindex) {return d3.hsl(((lastindex+10)%(41))/(41)*360.0, 1.0, ((lastindex+10)%(10))/(10));},
			var niter = 105;
			var noffset = 3;
			var ncircles = [];
			for (var incircle = noffset; incircle < niter + noffset; incircle++) {
				ncircles.push(Math.round(incircle * 6.5));
			}
			var bside = new BS();
			for (var incircle = 0; incircle < niter - noffset; incircle++) {
				bside.push(ncircles[incircle]).alts(samples(1,75,8));
				// bside.push(ncircles[incircle]).alts([1]);
			}
			var sides = bside.list();

			var radii = [];
			for (var incircle = 0; incircle < niter-noffset; incircle++) {
				var ncircle = ncircles[incircle];
				// var rsupport = lgeo(1.0,5.0,0.99,ncircle/2);
				var rsupport = samples(1.0,1.0,29);
				// console.log("rsupport",rsupport);
				rsupport = rsupport.concat(lreverse(rsupport));
				// console.log("after reverse rsupport",rsupport);
				
				// radii = radii.concat(lrandfluctuate(rsupport),0.1);
				radii = radii.concat(rsupport);
			}

			// console.log("radii ",radii);

			// color: function(lastindex) {return d3.hsl(((lastindex)%(28))/(28)*360.0, 1.0,0.7);},
			// function(lastindex) {return d3.hsl((100.0 + 50.0*lcircular(sides,lastindex+1)), 1.0,0.7);},
			   
			var newpattern = new bpatternbaoswitch(sides,
												   radii,
												   newnodes,
												   fdraw);
			patterns.push(newpattern);

			// maxiter = lsum(ncircles)-640;
			// maxiter = 2;
		}
	};

	var touchdrawcircle = function(event) {
		var eventcoords = d3.mouse(this);
		createpattern(eventcoords[0],eventcoords[1]);
	};

	// document.getElementsByTagName("body")[0].addEventListener("touchstart",touchdrawcircle,false);
	// var body = document.getElementsByTagName("body")[0];
	// body.addEventListener("mousedown",touchdrawcircle,false);

	bindcanvas(canvas,"mousedown",touchdrawcircle, false);
	bindcanvas(canvas,"touchstart",touchdrawcircle, false);


	quadtree = initquadtree();
	console.log("quadtree " + quadtree);


	viewbox0 = mergeviewboxes(circleviewbox(new Circle(0.0,1.0,1.0)),circleviewbox(new Circle(2.0,3.0,1.0)));

	console.log("init viewbox0",viewbox0);

	function iterframe() {

		console.log("iterframe iter",iter);

		if (patterns.length < 1) {
			createpattern(0.0,0.0);
		}

		if (iter < maxiter && patterns.length > 0) {
			if ((iter % 1000) == 0) {
			  console.log("iter ",iter);
			}
			lastpatternid += 1;
			lastpattern = lcircular(patterns,lastpatternid);
			result = lastpattern.iter(quadtree,canvas,1000);

			for (var iresult = 0; iresult < result.length; iresult++) {
				var nnewnode = result[iresult];
				viewbox0 = mergeviewboxes(circleviewbox(nnewnode),viewbox0);
			}
			iter += result.length;
		}
	
		if (patterns.length > 0) {
			// var qcircles = quadtree.circles();
			// console.log("quadtree.circles",qcircles.length);
			// for (var ic = 0; ic < qcircles.length; ic++) {
			// 	drawcircle(canvas,circle(qcircles[ic].x,qcircles[ic].y,qcircles[ic].radius * 0.5),d3.hsl(0.0,1.0,0.5));
			// }

			if (false) {
				var allquads = quadtree.leaves();
				// console.log("quadtree.quads",allquads.length);
				for (var iquad = 0; iquad < allquads.length; iquad++) {
					var quad = allquads[iquad];
					if (quad.isdrawn != true) {
						var p1 = new Point(quad.xmin,quad.ymin);
						var p2 = new Point(quad.xmax,quad.ymin);
						var p3 = new Point(quad.xmax,quad.ymax);
						var p4 = new Point(quad.xmin,quad.ymax);
						// console.log("quad i ",iquad, " descr ",quad.descr());

						var segs = [[p1,p2],[p2,p3],[p3,p4],[p4,p1]];
						for (iseg = 0; iseg < segs.length; iseg++) {
							var seg = segs[iseg];
							var ccircles = linecircles(seg[0],seg[1],10);
							for (var ic = 0; ic < ccircles.length; ic++) {
								var ccircle = ccircles[ic];
								// console.log(" ccircle ", ccircle.x,"",ccircle.y);
								drawcircle(canvas,new Circle(ccircle.x,ccircle.y,0.1),myhsla(0.5,1.0,1.0,1.0));
							}
						}
						quad.isdrawn = true;
					}
				}
			}
		}



		var viewviewbox = squareviewbox(expandviewbox(viewbox0,3.0));
		
		// viewviewbox = [-1000.0,-1000.0,1000.0,1000.0];
		// console.log("update viewviewbox",viewviewbox,"viewbox0",viewbox0);

		// drawcircle(canvas,new Circle(viewviewbox[0],viewviewbox[1],0.1),0xFF0000);
		// drawcircle(canvas,new Circle(viewviewbox[0],viewviewbox[3],0.1),0xFF00FF);
		// drawcircle(canvas,new Circle(viewviewbox[2],viewviewbox[1],0.1),0x00FFFF);
		// drawcircle(canvas,new Circle(viewviewbox[2],viewviewbox[3],0.1),0x00FF00);

		// drawcircle(canvas,new Circle((viewviewbox[0]+viewviewbox[2])/2.0,(viewviewbox[1]+viewviewbox[3])/2.0,0.1),0xFFFFFF);


		resetviewbox(canvas,viewviewbox);

		if (iter >= maxiter) {
			// var data = canvas.toDataURL();
			// var win = window.open();
			// win.document.write("<img src='" + data + "'/>");
            // Canvas2Image.saveAsPNG(renderer.view);
			// console.log("iter maxiter stops");
		}

		return relaunchloop(iter < maxiter,iterframe);
	}

	return iterframe;
}

startanim(context());

// var time;
// function draw() {
//     requestAnimationFrame(draw);
//     var now = new Date().getTime(),
//         dt = now - (time || now);
 
//     time = now;
 
//     // Drawing code goes here... for example updating an 'x' position:
//     this.x += 10 * dt; // Increase 'x' by 10 units per millisecond
// }