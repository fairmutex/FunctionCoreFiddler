function loadFile() {
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
      alert("Um, couldn't find the fileinput element.");
  } else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
  } else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
  }

  function receivedText(e) {

      var matches = e.target.result.match(
          new RegExp(
              "\\<path([^>]*)\\>\\<\\/path>",
              "gi"
          )
      );

      //console.log(matches);
      var scene = new THREE.Scene();
      var camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);

      camera.position.set(0, 10, 50);
      camera.lookAt(scene.position);
      var renderer = new THREE.WebGLRenderer({
          antialias: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x999999);
      document.body.appendChild(renderer.domElement);

      var controls = new THREE.OrbitControls(camera, renderer.domElement);
      scene.add(new THREE.AxesHelper(1));
      container = new THREE.Object3D(); //create an empty container
      scene.add(container);
      container.scale.set(0.1, 0.1, 0.1);


      matches = matches.reverse();

      matches.forEach(function(element) {
          console.log(element);
          let arc = new Arc(element)
          console.log(JSON.stringify(arc));
          container.add(drawArc(arc));
      });


      render();


      function render() {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
      }

  }




  let Arc = class {
      constructor(Path) {
          {
              //<path d="M 420 400 A 20 20 0 0 0 400 380" style="stroke: rgb(51, 85, 51); stroke-width: 5; fill: none;"></path>
              var Tokens = Path.split(' ');
              this.MoveX = parseFloat(Tokens[2]);
              this.MoveY = parseFloat(Tokens[3]);
              this.RadiusX = parseFloat(Tokens[5]);
              this.RadiusY = parseFloat(Tokens[6]);
              this.XAxisRotation = parseFloat(Tokens[7]);
              this.LargeArcFlag = parseFloat(Tokens[8]);
              this.SweepFlag = parseFloat(Tokens[9]);
              this.X = parseFloat(Tokens[10]);
              this.Y = parseFloat(Tokens[11].slice(0, -1));

              this.Red = parseFloat(Tokens[13].slice(4, -1));
              this.Green = parseFloat(Tokens[14].slice(0, -1));
              this.Blue = parseFloat(Tokens[15].slice(0, -2));
              this.StrokeWidth = parseFloat(Tokens[17].slice(0, -1));

              if (this.Red == 51)
                  this.ColorShort = "DG";
              else if (this.Red == 102)
                  this.ColorShort = "LG";
              else if (this.Red == 136)
                  this.ColorShort = "P";
              else if (this.Red == 68)
                  this.ColorShort = "B";

          }


      }
  }


  function drawArc(arc) {
      var radius = arc.RadiusX;
      var offset = 400;

      var pointStart = new THREE.Vector3(arc.MoveX - offset, arc.MoveY - offset, 0); //.normalize().multiplyScalar(radius);
      var pointEnd = new THREE.Vector3(arc.X - offset, arc.Y - offset, 0); //.normalize().multiplyScalar(radius);

      var color = rgbToHex(arc.Red, arc.Green, arc.Blue);
      var newArc = setArc3D(pointStart, pointEnd, 50, color, false);
      var zMultiplier = document.getElementById('zMultiplier').value;
      newArc.translateZ(arc.StrokeWidth * zMultiplier);
      //newArc11.translate( 1, 1, 1 );
      return newArc;
  }



  function setArc3D(pointStart, pointEnd, smoothness, color, clockWise) {
      // calculate normal
      var cb = new THREE.Vector3(),
          ab = new THREE.Vector3(),
          normal = new THREE.Vector3();
      cb.subVectors(new THREE.Vector3(), pointEnd); //,Math.random() * 2);
      ab.subVectors(pointStart, pointEnd); //,Math.random() * 2);
      cb.cross(ab);
      normal.copy(cb).normalize();
      // normal = cb;
      // get angle between vectors
      var angle = pointStart.angleTo(pointEnd);
      if (clockWise) angle = angle - Math.PI * 2;
      var angleDelta = angle / (smoothness - 1);

      var geometry = new THREE.Geometry();
      for (var i = 0; i < smoothness; i++) {
          geometry.vertices.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i))
      }

      var arc = new THREE.Line(geometry, new THREE.LineBasicMaterial({
          color: color
      }));
      return arc;
  }



  function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }




}