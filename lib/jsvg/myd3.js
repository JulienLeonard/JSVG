function drawcircle(canvas,circle,color) {
    // .style("fill", d3.rgb(color[0],color[1],color[2]))
	
	canvas.append("circle").attr("cx", circle.x)
		.attr("cy", circle.y)
		.style("fill", color)
		.attr("r", circle.r);
}

function initcanvas(canvasname,w,h,background) {
	var _background = "#000000"
	var result = d3.select("#"+canvasname).append("svg")
		.attr("version","1.1")
		.attr("width", w)
		.attr("height", h)
		.attr("style","background: " + _background);

	return result;
}

function resetviewbox(canvas,viewbox) {
	var viewviewbox = convertviewboxwidthheight(viewbox);
	canvas.attr("viewBox", viewviewbox.join(" "));
}

function startanim(fframe) {
	d3.timer(fframe);
}

function relaunchloop(conditionresult) {
	return !conditionresult;
}

function bindcanvas(canvas,event,f,condition) {
	canvas.on(event,f,condition);
}

function myhsla(h,s,l,a) {
	return d3.hsl(h*360.0,s,l);
}