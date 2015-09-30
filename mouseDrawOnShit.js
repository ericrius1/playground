var MIN_POINT_DISTANCE = 0.01;
var MAX_POINT_DISTANCE = 1;

var SPATIAL_CONTROLLERS_PER_PALM = 2;
var TIP_CONTROLLER_OFFSET = 1;

var TRIGGER_ON_VALUE = 0.3;

var MAX_DISTANCE = 40;

var STROKE_WIDTH = 0.01
var MAX_POINTS_PER_LINE = 60;


var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
MyAvatar.bodyYaw = 0;
var whiteboard = Entities.addEntity({
  type: "Box",
  position: center,
  name: "whiteboard",
  dimensions: {
    x: 2,
    y: 1.5,
    z: .01
  },
  color: {
    red: 250,
    green: 250,
    blue: 250
  }
});



function MyController() {
  this.strokes = [];
  this.painting = false;



  this.strokeColor = {
    red: 200,
    green: 20,
    blue: 40
  };

  this.laserPointer = Overlays.addOverlay("circle3d", {
    size: {
      x: STROKE_WIDTH / 2,
      y: STROKE_WIDTH / 2
    },
    color: this.strokeColor,
    solid: true,
    position: center
  })
  this.triggerValue = 0;
  this.prevTriggerValue = 0;
  var _this = this;


  this.update = function(event) {
    var pickRay = Camera.computePickRay(event.x, event.y);
    this.search(pickRay);
    if (this.canPaint) {
      this.paint(this.intersection.intersection, this.intersection.surfaceNormal);
    }
  };

  this.paint = function(position, normal) {
    if (this.painting === false) {
      if (this.oldPosition) {
        this.newStroke(this.oldPosition);
      } else {
        this.newStroke(position);
      }
      this.painting = true;
    }



    var localPoint = Vec3.subtract(position, this.strokeBasePosition);
    //Move stroke a bit forward along normal so it doesnt zfight with mesh its drawing on 
    localPoint = Vec3.sum(localPoint, Vec3.multiply(normal, 0.001 + Math.random() * .001)); //rand avoid z fighting

    var distance = Vec3.distance(localPoint, this.strokePoints[this.strokePoints.length - 1]);
    if (this.strokePoints.length > 0 && distance < MIN_POINT_DISTANCE) {
      //need a minimum distance to avoid binormal NANs
      return;
    }
    if (this.strokePoints.length === 0) {
      localPoint = {
        x: 0,
        y: 0,
        z: 0
      };
    }

    this.strokePoints.push(localPoint);
    this.strokeNormals.push(normal);
    this.strokeWidths.push(STROKE_WIDTH);
    Entities.editEntity(this.currentStroke, {
      linePoints: this.strokePoints,
      normals: this.strokeNormals,
      strokeWidths: this.strokeWidths
    });
    if (this.strokePoints.length === MAX_POINTS_PER_LINE) {
      this.painting = false;
      return;
    }
    this.oldPosition = position
  }

  this.newStroke = function(position) {
    this.strokeBasePosition = position;
    this.currentStroke = Entities.addEntity({
      position: position,
      type: "PolyLine",
      color: this.strokeColor,
      dimensions: {
        x: 50,
        y: 50,
        z: 50
      },
      lifetime: 100
    });
    this.strokePoints = [];
    this.strokeNormals = [];
    this.strokeWidths = [];

    this.strokes.push(this.currentStroke);

  }

  this.squeeze = function() {
    this.tryPainting = true;

  }
  this.release = function() {
    this.painting = false;
    this.tryPainting = false;
    this.canPaint = false;
    this.oldPosition = null;
  }
  this.search = function(pickRay) {

    this.intersection = Entities.findRayIntersection(pickRay, true);
    if (this.intersection.intersects) {
      var distance = Vec3.distance(MyAvatar.position, this.intersection.intersection);
      if (distance < MAX_DISTANCE) {
        this.readyToPaint = true;
        var displayPoint = this.intersection.intersection;
        displayPoint = Vec3.sum(displayPoint, Vec3.multiply(this.intersection.surfaceNormal, .001));
        if (this.tryPainting) {
          this.canPaint = true;
        }
        Overlays.editOverlay(this.laserPointer, {
          visible: true,
          position: displayPoint,
          rotation: orientationOf(this.intersection.surfaceNormal)
        });

      } else {
        this.hitFail();
      }
    } else {
      this.hitFail();
    }
  };

  this.hitFail = function() {
    print("HIT FAIL")
    this.canPaint = false;
    Overlays.editOverlay(this.laserPointer, {
      visible: false
    });

  }

  this.cleanup = function() {
    Overlays.deleteOverlay(this.laserPointer);
    this.strokes.forEach(function(stroke) {
      Entities.deleteEntity(stroke);
    });
  }
}

var mouseController = new MyController();


function cleanup() {

  Entities.deleteEntity(whiteboard)
  mouseController.cleanup();
}

Script.scriptEnding.connect(cleanup);


function orientationOf(vector) {
  var Y_AXIS = {
    x: 0,
    y: 1,
    z: 0
  };
  var X_AXIS = {
    x: 1,
    y: 0,
    z: 0
  };

  var theta = 0.0;

  var RAD_TO_DEG = 180.0 / Math.PI;
  var direction, yaw, pitch;
  direction = Vec3.normalize(vector);
  yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
  pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
  return Quat.multiply(yaw, pitch);
}

function onMousePress(event) {
  if (event.isLeftButton) {
    mouseController.squeeze();
  }
}

function onMouseRelease() {
  mouseController.release();
}

function onMouseMove(event) {
  mouseController.update(event);
}

Controller.mousePressEvent.connect(onMousePress);
Controller.mouseReleaseEvent.connect(onMouseRelease);
Controller.mouseMoveEvent.connect(onMouseMove);