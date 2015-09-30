var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}
var PI = Math.PI;
var totalTime = 0;
var FIRE_COLOR = {
    red: 255,
    green: 255,
    blue: 255
};

myOrientation = Quat.fromPitchYawRollDegrees(-90, 0, 0.0);

var LIGHT_COLOR = {
    red: 255,
    green: 100,
    blue: 28
}

var animationSettings = JSON.stringify({
    fps: 30,
    running: true,
    loop: true,
    firstFrame: 1,
    lastFrame: 10000
});


var fire = Entities.addEntity({
    type: "ParticleEffect",
    name: "fire",
    animationSettings: animationSettings,
    textures: "https://hifi-public.s3.amazonaws.com/alan/Particles/Particle-Sprite-Smoke-1.png",
    position: {
        x: 551.45,
        y: 494.82,
        z: 502.05
    },
    emitRate: 100,
    colorStart: {
        red: 70,
        green: 70,
        blue: 137
    },
    color: {
        red: 200,
        green: 99,
        blue: 42
    },
    colorFinish: {
        red: 255,
        green: 99,
        blue: 32
    },
    radiusSpread: .01,
    radiusStart: .02    ,
    radiusEnd: 0.001,
    particleRadius: .05,
    radiusFinish: 0.0,
    emitOrientation: myOrientation,
    emitSpeed: .3,
    speedSpread: 0.1,
    alphaStart: 0.1,
    alpha: 0.3,
    alphaFinish: 0.1,
    emitDimensions: {x: 1, y: 1, z: .1},
    polarFinish: 0.1,
    emitAcceleration: {
        x: 0.0,
        y: 0.0,
        z: 0.0
    },
    accelerationSpread: {
        x: 0.1, 
        y: 0.01, 
        z: 0.1
    },
    lifespan: 1
});



function cleanup() {
    Entities.deleteEntity(fire);
}
// Script.scriptEnding.connect(cleanup);
Script.update.connect(update);
