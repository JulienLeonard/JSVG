function mymax(values) {
	// return d3.max(values)
	if (values.length < 1) {
		return  null;
	}
	var result = values[0];
	for (var i = 1; i < values.length; i++) {
		if (values[i] > result) {
			result = values[i];
		}
	}
	return result;
}

function mymin(values) {
	// return d3.min(values)
	if (values.length < 1) {
		return null;
	}
	var result = values[0];
	for (var i = 1; i < values.length; i++) {
		if (values[i] < result) {
			result = values[i];
		}
	}
	return result;
}

// TODO: must define proper encapsulation to have multiple concurrent seeds
var randomseed = 0;

function initrandomseed(seed) {
	randomseed = seed;
}

function myrandom() {
    var x = Math.sin(randomseed++) * 10000;
    return x - Math.floor(x);
}

function rand(min, max) {
	return myrandom() * (max - min) + min;
}

function randitem(array) {
	return array[Math.floor(rand(0.0,array.length))];
}

function lcircular(array,index) {
	return array[index % array.length];
}

function lconcat(list1,list2) {
	return list1.concat(list2);
}

function lrepeat(v,ntimes) {
	var result = [];
	var i = 0;
	for (i = 0; i < ntimes; i++) {
		result.push(v);
	}
	return result;
}

function sample(v1,v2,abs) {
	return v1 + (v2-v1) *abs;
}

function abscissa(t1,t2,t) {
    if (t > t2) {
        return t2;
	}
	else if (t < t1) {
        return t1;
	}
	else if (t1 == t2) {
        return t1;
	}
	return (t - t1)/(t2 - t1);
}

function samples(v1,v2,nitems) {
	var result = [];
	var i = 0;
	for (i=0; i< nitems;i++) {
		var abs = i/nitems;
		result.push(sample(v1,v2,abs));
	}
	return result;
}


function lfill(value, len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr.push(value);
  }
  return arr;
}

function llast(list) {
	return list[list.length-1];
}

function lfirst(list) {
	return list[0];
}

function lsum(list) {
	var result = 0;
	for (var index = 0; index < list.length; index++) {
		result += list[index];
	}
	return result;
}

function lreverse(list) {
	var result = [];
	for (var i = list.length - 1; i > -1; i = i-1) {
		result.push(list[i]);
	} 
	return result;
}

function randfluctuate(value,ratio) {
	return rand(value *(1.0-ratio), value *(1.0+ratio));
}

function lrandfluctuate(list,ratio) {
	var result = [];
	for (var index = 0; index < list.length; index++) {
		result.push(randfluctuate(list[index],ratio));
	}
	return result;
}

function lgeo(v1,v2,rfactor,nitems) {
    var result = [1.0];
    for (var i = 0; i < nitems-1; i++) {
        result.push(llast(result)*rfactor);
	}
	for (var i = 0; i < nitems; i++) {
		result[i] = 1.0-result[i];
	}
	var minv = lfirst(result);
	var maxv = llast(result);

	for (var i = 0; i < nitems; i++) {
		var abscissav = abscissa(minv,maxv,result[i]);
		result[i] = sample(v1,v2,abscissav);
	}
	return result;
}

function rcircular(vmin, vmax, value) {
	var result = value;
	var size = vmax - vmin;
	if ( value <  vmin)
	{
		var times     = Math.floor( (value-vmax) / size );
		var remains   = (value-vmax) - times * size;
		result = vmax + remains;		
	}
	else if (value > vmax )
	{	
		var times     = Math.floor( (value-vmin ) / size );
		var remains   = (value-vmin) - times * size;
		result = vmin + remains;
	}

	return result;
}

function rtrim(vmin,vmax,value) {
	var result = 0.0;
    if (value >= vmax)
		result = vmax;
    else if (value <= vmin)
		result = vmin;
    else
		result = value;

    return result;
}
