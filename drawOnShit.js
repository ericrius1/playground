/////////////////////////////////////////////////////////////////
//
// other constants
//

var RIGHT_HAND = 1;
var LEFT_HAND = 0;

var MIN_POINT_DISTANCE = 0.01;

var SPATIAL_CONTROLLERS_PER_PALM = 2;
var TIP_CONTROLLER_OFFSET = 1;

var TRIGGER_ON_VALUE = 0.3;

var MAX_DISTANCE = 3;

var STROKE_WIDTH = 0.03
var MAX_POINTS_PER_LINE = 40;


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



function MyController(hand, triggerAction) {
  this.hand = hand;
  this.strokes = [];

  if (this.hand === RIGHT_HAND) {
    this.getHandPosition = MyAvatar.getRightPalmPosition;
    this.getHandRotation = MyAvatar.getRightPalmRotation;
  } else {
    this.getHandPosition = MyAvatar.getLeftPalmPosition;
    this.getHandRotation = MyAvatar.getLeftPalmRotation;
  }

  this.triggerAction = triggerAction;
  this.palm = SPATIAL_CONTROLLERS_PER_PALM * hand;
  this.tip = SPATIAL_CONTROLLERS_PER_PALM * hand + TIP_CONTROLLER_OFFSET;


  this.strokeColor = {
    red: 200,
    green: 20,
    blue: 160
  };

  this.laserPointer = Overlays.addOverlay("circle3d", {
    size: {
      x: STROKE_WIDTH/2,
      y: STROKE_WIDTH/2
    },
    color: this.strokeColor,
    solid: true,
    position: center
  })
  this.triggerValue = 0;
  this.prevTriggerValue = 0;
  var _this = this;


  this.update = function() {
    this.updateControllerState()
    this.search();
    if (this.shouldPaint) {
      this.paint(this.intersection.intersection, this.intersection.surfaceNormal);
    }
  };

  this.paint = function(position, normal) {
    // print("POSITION " + position.z)
    if (!this.painting) {
      this.newStroke(this.intersection.intersection);
      this.painting = true;
    }

    if (this.strokePoints.length > MAX_POINTS_PER_LINE) {
      this.painting = false;
      return;
    }


    var localPoint = Vec3.subtract(position, this.strokeBasePosition);
    //Move stroke a bit forward along normal so it doesnt zfight with mesh its drawing on 
    localPoint = Vec3.sum(localPoint, Vec3.multiply(normal, .001));  

    if (this.strokePoints.length > 0 && Vec3.distance(localPoint, this.strokePoints[this.strokePoints.length - 1]) < MIN_POINT_DISTANCE) {
      //need a minimum distance to avoid binormal NANs
      return;
    }

    this.strokePoints.push(localPoint);
    this.strokeNormals.push(this.intersection.surfaceNormal);
    this.strokeWidths.push(STROKE_WIDTH);
    Entities.editEntity(this.currentStroke, {
      linePoints: this.strokePoints,
      normals: this.strokeNormals,
      strokeWidths: this.strokeWidths
    });
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

  this.updateControllerState = function() {
    var triggerValue = Controller.getActionValue(this.triggerAction);
    if (triggerValue > TRIGGER_ON_VALUE && this.prevTriggerValue <= TRIGGER_ON_VALUE) {
      this.squeeze();
    } else if (triggerValue < TRIGGER_ON_VALUE && this.prevTriggerValue >= TRIGGER_ON_VALUE) {
      this.release()
    }

    this.prevTriggerValue = triggerValue;
  }

  this.squeeze = function() {
    if (this.readyToPaint) {
      this.shouldPaint = true;
    }

  }
  this.release = function() {
    this.painting = false;
    this.shouldPaint = false;
    this.readyToPaint = false;
  }
  this.search = function() {

    // the trigger is being pressed, do a ray test
    var handPosition = this.getHandPosition();
    var pickRay = {
      origin: handPosition,
      direction: Quat.getUp(this.getHandRotation())
    };

    this.intersection = Entities.findRayIntersection(pickRay, true);
    if (this.intersection.intersects && this.intersection.properties.name !== "laserPointer") {
      var distance = Vec3.distance(handPosition, this.intersection.intersection);
      if (distance < MAX_DISTANCE) {
        this.readyToPaint = true;
        var displayPoint = this.intersection.intersection;
        displayPoint = Vec3.sum(displayPoint, Vec3.multiply(this.intersection.surfaceNormal, .001));  
   
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
    this.readyToPaint = false;
    // this.shouldPaint = false;
    Entities.editEntity(this.laserPointer, {
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

var rightController = new MyController(RIGHT_HAND, Controller.findAction("RIGHT_HAND_CLICK"));
var leftController = new MyController(LEFT_HAND, Controller.findAction("LEFT_HAND_CLICK"));

function update() {
  rightController.update();
  leftController.update();
}

function cleanup() {
  rightController.cleanup();
  leftController.cleanup();
  Entities.deleteEntity(whiteboard)
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);


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