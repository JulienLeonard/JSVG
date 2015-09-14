function drawcircle(canvas,circle,color)
{
	// console.log("drawcircle",circle,color);
	var gl = canvas;
	var indicestart = gl.coords.length / 6;
	var ctriangles  = circletrianglepoints(gl,indicestart,circle.x,circle.y,circle.r,10);
	
	for (var i = 0; i < ctriangles.points.length; i++) 
	{
		var cpoint = ctriangles.points[i];
		gl.coords.push(cpoint[0], cpoint[1], color.r, color.g, color.b, color.a);
	}
	// for (var i = 0; i < ctriangles.indices.length; i++) 
	//{
		// gl.indices.push(indicestart + ctriangles.indices[i]);
	//}
	gl.indices = gl.indices.concat(ctriangles.indices);
	// console.log("drawcircle end: coords",gl.coords,"indices",gl.indices);
}

// deprecated
// function gldrawcircle(gl,circle,color)
// {
// 	// console.log("gldrawcircle",gl,circle,color);
// 	var nsegs = 10;

// 	// set the position
// 	var positionLocation = gl.getAttribLocation(program, "vertexPos");

// 	// set the color
// 	var ushadercolor = gl.getUniformLocation(program, "u_color");

// 	// Create a buffer.
// 	var buffer = gl.createBuffer();

// 	// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

// 	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// 	gl.enableVertexAttribArray(positionLocation);
// 	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 	// build the circle
// 	setcirclevertices(gl,circle[0], circle[1], circle[2], nsegs);

// 	// Set a random color.
// 	gl.uniform4f(ushadercolor, color[0],color[1],color[2],color[3]);
	
// 	// Draw the rectangle.
// 	gl.drawArrays(gl.TRIANGLE_FAN, 0, nsegs + 2);

// 	// useless: gl.viewport(100,100, 300, 300);
// }

//
// done to work wit batch rendering, so with TRIANGLES
//
function circletrianglepoints(gl, indicestart,x, y, r, totalSegs) 
{
	if (gl.cpoints.length == 0) 
	{
		gl.cpoints = [];
		// first compute around points
		var seg = (Math.PI * 2) / totalSegs ;
		gl.cpoints.push([0.0,0.0]);
		for (var i=0; i < totalSegs; i++) 
		{
			gl.cpoints.push([Math.sin(seg * i), Math.cos(seg * i)]);
		}
	}

	// then transgform the points with current coords and radius
	var verts = [];
	for (var i = 0; i < gl.cpoints.length; i++) 
	{
		verts.push([x + gl.cpoints[i][0] * r, y + gl.cpoints[i][1] * r]);
	}

	// then compute appropietely the indices, by triangle
	var indices = [];
	var o = indicestart;
	for (var i=0; i < totalSegs-1; i++)
	{
		indices.push(o + 0);
		indices.push(o + (i+1));
		indices.push(o + (i+2));
	}
	indices.push(o +0);
	indices.push(o + (totalSegs));
	indices.push(o + (1));

	// then create result
	var result = {};
	result.points  = verts;
	result.indices = indices;
	return result;
}

function computeViewPortMatrix(gl,viewbox)
{
	var xmin = viewbox[0],
		ymin = viewbox[1],
		xmax = viewbox[2],
		ymax = viewbox[3];
	var xcenter = (xmin + xmax)/2.0;
	var ycenter = (ymin + ymax)/2.0;
	
	var xwidth = xmax - xmin;
	var ywidth = ymax - ymin;

	var canvasratio = gl.canvasratio; // w/h

	var scalex = 2.0/xwidth,
        scaley = 2.0/ywidth * canvasratio,
		tx = -xcenter *scalex,
		ty = -ycenter * scaley;

	return new Float32Array([scalex, 0, 0, 0,
							 0, scaley, 0, 0,
							 0, 0, 1, 0,
							 tx, ty, 0, 1]);

}

function initcanvas(canvasname,w,h,background)
{
	// Get A WebGL context
	var div = document.getElementById(canvasname);
	div.innerHTML = "<canvas id = \"" + "canvas" + canvasname  + "\" width=\"" + w + "\" height=\"" + h + "\" />";
	var canvas = document.getElementById("canvas" + canvasname);
	
	var gl = getWebGLContext(canvas);
	if (!gl) {
		return;
	}

	var fragmentshaderscript = [
		"precision mediump float;",
		"varying vec4 vColor;",
		"void main(void) {",
		"   gl_FragColor = vColor;",
		"}"
		];

	var vertexshaderscript = [
		"attribute vec2  aVertexPosition;",
		"attribute vec4  aColor;",
		"uniform   mat4  uModelViewMatrix;",
		"uniform   float uAlpha;",
		"varying   vec4  vColor;",
		"void main(void) {",
		"   gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0.0, 1.0);",
		"   vColor = aColor  * uAlpha;",
		"}"
		];


	// setup GLSL program
	// vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
	// fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
	vertexShader   = loadShader(gl, vertexshaderscript.join("\n"),   gl.VERTEX_SHADER);
	fragmentShader = loadShader(gl, fragmentshaderscript.join("\n"), gl.FRAGMENT_SHADER);

	program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);	

	gl.canvasratio  = w/h;
	gl.mybackground = background.v4();

	gl.viewport(0,0, w, h);

	gl.modelviewmatrixloc = gl.getUniformLocation(program, 'uModelViewMatrix');
	gl.alphaloc           = gl.getUniformLocation(program, 'uAlpha');
	gl.vertexposloc       = gl.getAttribLocation(program,  'aVertexPosition');
	gl.colorloc           = gl.getAttribLocation(program,  'aColor');

	gl.enableVertexAttribArray(gl.vertexposloc);
	gl.enableVertexAttribArray(gl.colorloc);

	gl.cpoints = [];
	gl.batchs = [];
	initfornextbatch(gl);
	
	return gl;
}

//
// return a map bcoords and bindices of glbuffer loaded
function createnewbatch(gl,coords,indices)
{
	// console.log("createnewbatch coords",coords.length,"indices",indices.length);
	var result = {};
	result.bcoords  = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, result.bcoords);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);

	result.bindices = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, result.bindices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	result.indiceslength = indices.length;
	
	return result;
}

// here all the uniforms have alrady been set
function redrawbatch(gl,batch)
{
	// console.log("redrawbatch indices",batch.indiceslength);
	gl.bindBuffer(gl.ARRAY_BUFFER,         batch.bcoords);

	gl.vertexAttribPointer(gl.vertexposloc, 2, gl.FLOAT, false, 4 * 6, 0    );
	gl.vertexAttribPointer(gl.colorloc,     4, gl.FLOAT, false, 4 * 6, 2 * 4);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, batch.bindices);
	
	// console.log("indiceslength",batch.indiceslength);

	gl.drawElements(gl.TRIANGLES,  batch.indiceslength, gl.UNSIGNED_SHORT, 0 );
}

function resetviewbox(gl,viewbox)
{
	// redraw the webgl canvas
	gl.clearColor(gl.mybackground[0],gl.mybackground[1],gl.mybackground[2],1.0);     
	gl.clear(gl.COLOR_BUFFER_BIT);
	// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	// create the new buffer, bind the data, and add to the list of buffers
	var newbatch = createnewbatch(gl,gl.coords,gl.indices);
	gl.batchs.push(newbatch);

	// set the viewport matrix
	var newmodelViewMatrix = computeViewPortMatrix(gl,viewbox);
	gl.uniformMatrix4fv(gl.modelviewmatrixloc, false, newmodelViewMatrix);
	gl.uniform1f(gl.alphaloc, 1.0);

	// then redraw all the buffers
	for (var i = 0; i < gl.batchs.length; i++)
	{
		redrawbatch(gl,gl.batchs[i]);
	}

	// reset the data for the next batch
	initfornextbatch(gl);
}

function initfornextbatch(gl)
{
	gl.coords  = [];
	gl.indices = [];
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
