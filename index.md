<!DOCTYPE html>
<html lang="en">
	<head>
		<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
		<meta content="utf-8" http-equiv="encoding">
        <style type="text/css">
            body {
                margin: 0;
                overflow: hidden;
            }
        </style>
		<script src="lib/three.min.js"></script>
		<script src="lib/Detector.js"></script>
		<script src="lib/Coordinates.js"></script>
		<script src="lib/OrbitControls.js"></script>
		<script src="lib/stats.min.js"></script>
		<script src="lib/dat.gui.min.js"></script>
		<script src="lib/tween.min.js"></script>
        <script src="lib/utilities.js"></script>
		<script src="js/Mirror.js"></script>
		<script src="js/WaterShader.js"></script>
        <script src="fonts/helvetiker_regular.typeface.js"></script>
		<script type="text/javascript">
		function getParameterByName(name) {
			var match = RegExp('[?&]' + name + '=([^&]*)')
							.exec(window.location.search);
			//return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
			return "Project Hugo Elias.JS";
        }
        function init() {
		    var loadScript = getParameterByName('load');
		    if (typeof loadScript !== 'undefined') {
			    var thescript = document.createElement('script');
			    thescript.setAttribute('type','text/javascript');
			    thescript.setAttribute('src',loadScript);
                thescript.setAttribute('onerror',"alert('script not found')");
			    document.getElementsByTagName('head')[0].appendChild(thescript);
		    }
        }
		</script>
	</head>
	<body onload="init()">
        <div id="container">
        </div>
	</body>
</html>
