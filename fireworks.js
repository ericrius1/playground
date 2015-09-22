//
//  fireworks.js
//  examples/entityScripts
//
//  Created by Eric Levin on 9/21/15.
//  Copyright 2015 High Fidelity, Inc.
//
//  This is script creates a fireworks launcher that, when clicked, will explode fireworks
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var ZERO_VEC = {
        x: 0,
        y: 0,
        z: 0
    };


    // this is the "constructor" for the entity as a JS object we don't do much here, but we do want to remember
    // our this object, so we can access it in cases where we're called without a this (like in the case of various global signals)
    FireworksLauncher = function() {
        _this = this;

        this.resetKey = "resetMe";

        var HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
        this.explosionSound = SoundCache.getSound(HIFI_PUBLIC_BUCKET + "sounds/Guns/GUN-SHOT2.raw");

    };

    FireworksLauncher.prototype = {

        clickReleaseOnEntity: function(entityId, mouseEvent) {
            if (!mouseEvent.isLeftButton) {
                return;
            }
            this.explode();
        },

        startNearTouch: function() {
            this.explode();
        },

        explode: function() {
            print("EXPLODE")

            var animation = {
                fps: 30,
                frameIndex: 0,
                running: true,
                firstFrame: 0,
                lastFrame: 30,
                loop: true,
            };

            this.explosion = Entities.addEntity({
                type: "ParticleEffect",
                name: "explosion",
                position: this.position,
                emitVelocity: ZERO_VEC,
                emitRate: 100,
                particleRadius: 0.01,
                velocitySpread: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                emitAcceleration: {x: 0, y: -1, z: 0},
                textures: "https://raw.githubusercontent.com/ericrius1/SantasLair/santa/assets/smokeparticle.png",
                color: {
                    red: 255,
                    green: 255,
                    blue: 255
                },
                colorSpread: {
                    red: 0,
                    green: 0,
                    blue: 255
                },
                colorStart: {
                    red: 255,
                    green: 0,
                    blue: 0
                },
                colorFinish: {
                    red: 0,
                    green: 255,
                    blue: 0
                },
                animationSettings: animation,
                animationIsPlaying: true,
                lifespan: 0.7,
                lifetime: 3600 // 1 hour; just in case
            });

        },


        // preload() will be called when the entity has become visible (or known) to the interface
        // it gives us a chance to set our local JavaScript object up. In this case it means:
        preload: function(entityID) {
            this.entityID = entityID;

            //The launcher is static, so just cache its position once
            this.position = Entities.getEntityProperties(this.entityID, "position").position;
            this.explode();
        },

        unload: function() {
            print("UNLOAD")
            Entities.deleteEntity(this.explosion)
        }
    };

    // entity scripts always need to return a newly constructed object of our type
    return new FireworksLauncher();
})