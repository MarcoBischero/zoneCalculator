// JavaScript Document
function disableme (what,form) {
	what = document.getElementById(what);
	what.disabled = true;
	what.value="uploading...";
	eval('document.'+form+'.submit()');
}
function hideBusyLayer() {
		var busyLayer = document.getElementById("busy_layer")
		if (busyLayer != null) {
			busyLayer.style.visibility = "hidden";
			busyLayer.style.height = "0px";
		}
		var loading = document.getElementById("loading-layer")
		if (loading != null) {
			loading.style.display = "none";
			
		}
		var content = document.getElementById("content")
		content.style.display = "block";
		
}