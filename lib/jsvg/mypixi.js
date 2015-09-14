function drawcircle(canvas,circle,color) {
	// console.log("drawcircle",circle,color);

	if (graphpacketncircles > 10) {
		graphpacket = new PIXI.Graphics();;
		canvas.addChild(graphpacket);
		graphpacketncircles = 0;
	}

	graphpacket.lineStyle(0);
	graphpacket.beginFill(color.hexa(), color.a);
	graphpacket.drawCircle(circle.x,circle.y,circle.r);
	graphpacket.endFill();    

	graphpacketncircles++;

	
}

function initcanvas(canvasname,w,h,background) {

    stage = new PIXI.Stage(background.hexa(), true);
    
    stage.interactive = true;

    canvas = new PIXI.Graphics();
	stage.addChild(canvas);

	graphpacket = new PIXI.Graphics();
	canvas.addChild(graphpacket);

    var rendererOptions  = { antialias : true};

    renderer = PIXI.autoDetectRenderer(w, h,rendererOptions);
    
    document.body.appendChild(renderer.view);

	viewboxpixi = [0,0,w,h];

	return canvas;
}

function resetviewbox(canvas,viewbox) {
	// console.log("resetviewbox viewbox",viewbox);
	// canvas.attr("viewBox", viewbox.join(" "));

	// renderer.render(canvas);
	var newwidth  = (viewbox[2]-viewbox[0]);
	var newheight = (viewbox[3]-viewbox[1]);
	var newratio  = newwidth / newheight;

	var pixiwidth  = (viewboxpixi[2]-viewboxpixi[0]);
	var pixiheight = (viewboxpixi[3]-viewboxpixi[1]);
	var pixiratio  = pixiwidth / pixiheight;

	var scalex   = pixiwidth / newwidth;
	var scaley   = pixiheight / newheight;
	var newscale = mymin([scalex,scaley]);

	var unewwidth = newwidth / newratio * pixiratio;
	var unewheight = newheight;
	if (scalex == newscale) {
		unewwidth = newwidth;
		unewheight = newheight / newratio * pixiratio;
	}

	var newcx = (viewbox[2]+viewbox[0])/2.0;
	var newcy = (viewbox[3]+viewbox[1])/2.0;

	var unewx1 =  (newcx - unewwidth/2.0)  + pixiwidth/2.0;
	var unewy1 =  (newcy - unewheight/2.0) + pixiheight/2.0;

	// console.log("unewx1",unewx1,"unewy1",unewy1,"newscale",newscale);
	
	canvas.position.x = -viewbox[0] * newscale ;
	canvas.position.y = -viewbox[1] * newscale;
	canvas.scale.x    = newscale;
	canvas.scale.y    = newscale;
	renderer.render(stage);

	// console.log("newscale",canvas.scale.x,"newposition",canvas.position.x,canvas.position.y);
	// TODO;
}

function startanim(fframe) {
	// d3.timer(fframe);
    requestAnimFrame(fframe);
}

function relaunchloop(conditionresult,flaunch) {
	if (conditionresult) {
		requestAnimFrame( flaunch );
	}
}

function bindcanvas(canvas,event,f,condition) {
	// canvas.on(event,f,condition);
	// TODO
}

function myhsla(h,s,l,a) {
	// return d3.hsl(h,s,l);
	return (new Color()).hsla(h,s,l,a);
}
