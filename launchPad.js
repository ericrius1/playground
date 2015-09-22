var center = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));
var scriptURL = Script.resolvePath("fireworks.js");

var launcher = Entities.addEntity({
    type: "Box",
    position: center,
    dimensions: {x: .1, y: 0.1, z: 0.1},
    color: {red: 100, green: 20, blue: 100},
    script: scriptURL
});


function cleanup() {
    Entities.deleteEntity(launcher);
}

Script.scriptEnding.connect(cleanup)