var HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
var blocks = [];


createBlocks({
    x: 540.8, 
    y: 497, 
    z: 509.3
});

function createBlocks(position) {
    var baseURL = HIFI_PUBLIC_BUCKET + "models/content/planky/";
    var NUM_BLOCKS_PER_COLOR = 4;
    var i, j;

    var blockTypes = [{
        url: "planky_blue.fbx",
        dimensions: {
            x: 0.05,
            y: 0.05,
            z: 0.25
        }
    }, {
        url: "planky_green.fbx",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.25
        }
    }, {
        url: "planky_natural.fbx",
        dimensions: {
            x: 0.05,
            y: 0.05,
            z: 0.05
        }
    }, {
        url: "planky_yellow.fbx",
        dimensions: {
            x: 0.03,
            y: 0.05,
            z: 0.25
        }
    }, {
        url: "planky_red.fbx",
        dimensions: {
            x: 0.1,
            y: 0.05,
            z: 0.25
        }
    }, ];

    var modelURL, entity;
    for (i = 0; i < blockTypes.length; i++) {
        for (j = 0; j < NUM_BLOCKS_PER_COLOR; j++) {
            modelURL = baseURL + blockTypes[i].url;
            entity = Entities.addEntity({
                type: "Model",
                modelURL: modelURL,
                position: Vec3.sum(position, {
                    x: j / 10,
                    y: i / 10,
                    z: 0
                }),
                shapeType: 'box',
                name: "block",
                dimensions: blockTypes[i].dimensions,
                collisionsWillMove: true,
                gravity: {
                    x: 0,
                    y: -2.5,
                    z: 0
                },
                velocity: {
                    x: 0,
                    y: -0.01,
                    z: 0
                }
            });

            blocks.push(entity);

        }
    }
}


function cleanup() {
    blocks.forEach(function(block) {
        // Entities.deleteEntity(block);
    })
}

Script.scriptEnding.connect(cleanup);