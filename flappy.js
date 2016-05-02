/* hepl-mmi/zwazo
 *
 * /flappy.js - Flappy bird main class
 *
 * coded by leny@flatLand!
 * started at 18/04/2016
 */

 ( function() {

     "use strict";

     var Flappy;

     // Game Manager
     Flappy = function( oApp ) {

         var game = this, // eslint-disabled-line consistent-this
             TubesPair;

         this.app = oApp;

         this.time = {
             "start": null,
             "current": null
         };

         // Background
         this.background = {
             "frame": {
                 "sx": 292,
                 "sy": 0,
                 "sw": 288,
                 "sh": 511,
                 "dx": 0,
                 "dy": 0,
                 "dw": game.app.width,
                 "dh": game.app.height
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         // Ground
         this.ground = {
             "frame": {
                 "sx": 584,
                 "sy": 0,
                 "sw": 336,
                 "sh": 112,
                 "dx": 0,
                 "dy": game.app.height - 112,
                 "dw": 336,
                 "dh": 112
             },
             "speed": 3,
             "maxOffset": 336 - game.app.width,
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             },
             "update": function() {
                 if ( this.frame.dx <= ( this.maxOffset * -1 ) ) { // on lui dit que quand il arrive au bord on le replace à sa place d'origine.
                     this.frame.dx = 0;
                 }
                 this.frame.dx -= this.speed;
                 this.draw();

             }
         };

         // Bird
         this.bird = {
             "frames": [
                 {
                     "sx": 229,
                     "sy": 762,
                     "sw": 34,
                     "sh": 24
                 },
                 {
                     "sx": 229,
                     "sy": 814,
                     "sw": 34,
                     "sh": 24
                 },
                 {
                     "sx": 229,
                     "sy": 866,
                     "sw": 34,
                     "sh": 24
                 }
             ],
             "init": function() {
                 // Restings properties
                 this.animation = {
                     "maxSteps": this.frames.length,
                     "step": 0
                 };
                 this.state = {
                     "speed": 0,
                     "acceleration": 0,
                     "boost": 0,
                     "isInDangerZone": false
                 };
                 this.score = {
                     "current": 0,
                     "previous": 0
                 };
                 this.position = {};
                 this.destinationFrame = {
                     "dx": game.app.width / 3 - 17,
                     "dy": game.app.height / 3 - 12,
                     "dw": 34,
                     "dh": 24

                 };
             },
             "draw": function( iStep ) {
                 var oFrom = this.frames[ iStep ],
                     oDest = this.destinationFrame,
                     oContext = game.app.context;

                 oContext.save();
                 oContext.translate( oDest.dx, oDest.dy );
                 oContext.rotate( this.state.speed / 10 );
                 oContext.drawImage(
                    game.spriteSheet,
                    oFrom.sx,
                    oFrom.sy,
                    oFrom.sw,
                    oFrom.sh,
                    oDest.dw / 2 * -1,
                    oDest.dh / 2 * -1,
                    oDest.dw,
                    oDest.dh
                 );
                 oContext.restore();
             },
             "update": function( oEvent ) {
                 var self = this;

                 // handle event. we ensure that the sended event is the good one.
                 if ( oEvent && ( oEvent.type === "click" || ( oEvent.type === "keyup" && oEvent.keyCode === 32 ) ) ) {
                     if ( !this.state.acceleration ) {
                         TubesPair.generate( 2 ); // on met les tuyaux.
                         game.started = true;
                         this.state.acceleration = 0.4;
                         this.state.boost = -5;
                     } else {
                         this.state.speed = this.state.boost;
                     }
                 }

                 // don't update bird if game isn't started.
                 if ( !game.started ) {
                     return;
                 }

                 // handle game over.
                 if ( this.destinationFrame.dy >= game.ground.frame.dy - this.destinationFrame.dh / 2 ) {
                     game.over();
                 } else {
                     this.state.speed += this.state.acceleration;
                     this.destinationFrame.dy += this.state.speed;
                 }

                 // update hitzone borders
                 this.position.top = this.destinationFrame.dy - this.destinationFrame.dh / 2;
                 this.position.bottom = this.destinationFrame.dy + this.destinationFrame.dh / 2;
                 this.position.left = this.destinationFrame.dx - this.destinationFrame.dw / 2;
                 this.position.right = this.destinationFrame.dx + this.destinationFrame.dw / 2;

                 // check tubes hitzones collision.
                 game.tubes.forEach( function( oTubesPair ) {
                     var oPosition = self.position;

                     if ( oPosition.left > oTubesPair.frame.top.dx - self.destinationFrame.dw && oPosition.right < oTubesPair.frame.top.dx + oTubesPair.frame.top.dw ) {
                         if ( oPosition.top < oTubesPair.frame.top.dy + oTubesPair.frame.top.dh || oPosition.bottom > oTubesPair.frame.bottom.dy ) {
                             game.over();
                         } else {
                             self.state.isInDangerZone = true;
                         }
                     }

                 } );

                 // Update score
                 if ( this.state.isInDangerZone ) {
                     if ( this.score.current === this.score.previous ) {
                         this.score.current++;
                     }
                 } else {
                     this.score.previous = this.score.current;
                 }
                 this.state.isInDangerZone = false;
             }
         };

         // flapiTitle
         this.flapiTitle = {
             "frame": {
                 "sx": 700,
                 "sy": 181,
                 "sw": 179,
                 "sh": 48,
                 "dx": game.app.width / 2 - ( 181 * 1.2 ) / 2,
                 "dy": 70,
                 "dw": 181 * 1.2,
                 "dh": 48 * 1.2
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         // getReady
         this.getReady = {
             "frame": {
                 "sx": 589,
                 "sy": 114,
                 "sw": 184,
                 "sh": 63,
                 "dx": game.app.width / 2 - 184 / 2,
                 "dy": 200,
                 "dw": 184,
                 "dh": 63
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         // playButton
         this.playButton = {
             "frame": {
                 "sx": 706,
                 "sy": 234,
                 "sw": 105,
                 "sh": 59,
                 "dx": game.app.width / 2 - 105 / 2,
                 "dy": 260,
                 "dw": 105,
                 "dh": 59
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         // gameOver
         this.gameOver = {
             "frame": {
                 "sx": 789,
                 "sy": 114,
                 "sw": 194,
                 "sh": 58,
                 "dx": game.app.width / 2 - 194 / 2,
                 "dy": 70,
                 "dw": 194,
                 "dh": 58
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         // scoreTable
         this.scoreTable = {
             "frame": {
                 "sx": 4,
                 "sy": 517,
                 "sw": 227,
                 "sh": 114,
                 "dx": game.app.width / 2 - 227 / 2,
                 "dy": 200,
                 "dw": 227,
                 "dh": 114
             },
             "draw": function() {
                 game._drawSpriteFromFrame( this.frame );
             }
         };

         oApp.drawScore = function() {
             var oContext = this.context;

             oContext.font = "100 24px Helvetica, Sans-serif";
             oContext.fillStyle = "#000";
             oContext.textBaseline = "top";
             oContext.fillText( game.bird.score.current, 210, 230 );
         };

         TubesPair = function( iDx ) {
             var iPairHeight = TubesPair.generateNextPairHeight();

             this.frame = {
                 "top": {
                     "sx": 112,
                     "sy": 646,
                     "sw": 52,
                     "sh": 320,
                     "dx": iDx,
                     "dy": iPairHeight,
                     "dw": 52,
                     "dh": 320

                 },
                 "bottom": {
                     "sx": 168,
                     "sy": 646,
                     "sw": 52,
                     "sh": 320,
                     "dx": iDx,
                     "dy": iPairHeight + 430,
                     "dw": 52,
                     "dh": 320
                 }
             };
         };

         TubesPair.prototype.draw = function() {
             game._drawSpriteFromFrame( this.frame.top );
             game._drawSpriteFromFrame( this.frame.bottom );
         };

         TubesPair.prototype.update = function() {
             var iPairHeight;

             this.frame.top.dx -= game.ground.speed;
             this.frame.bottom.dx -= game.ground.speed;

             if ( this.frame.top.dx < ( this.frame.top.dw * -1 ) ) {
                 this.frame.top.dx = game.app.width;
                 this.frame.bottom.dx = game.app.width;
                 iPairHeight = TubesPair.generateNextPairHeight();
                 this.frame.top.dy = iPairHeight;
                 this.frame.bottom.dy = iPairHeight + 430;
             }

             this.draw();
         };

         TubesPair.lastGeneratedPairHeight = -1 * ( 50 + Math.floor( Math.random() * 250 ) );

         TubesPair.generateNextPairHeight = function() {
             var iMultiplier = Math.round( Math.random() ) % 2 ? 1 : -1,
                 iMaxGap = 100,
                 iNewValue = TubesPair.lastGeneratedPairHeight + Math.floor( Math.random() * iMaxGap ) * iMultiplier;

             ( iNewValue > -50 ) && ( iNewValue = -50 );
             ( iNewValue < -300 ) && ( iNewValue = -300 );

             TubesPair.lastGeneratedPairHeight = iNewValue;

             return iNewValue;
         };

         TubesPair.generate = function( iAmount ) { // génère deux pair de tuyaux.
             var i = 0,
                 iTubesStartingPosition = 500,
                 iTubesGap = 180;

             for ( ; i < iAmount ; i++ ) {
                 game.tubes.push( new TubesPair( iTubesStartingPosition + ( iTubesGap * i ) ) );
             }
         };

         // utils
         this._drawSpriteFromFrame = function( oFrame ) {
             this.app.context.drawImage(
                this.spriteSheet,
                oFrame.sx,
                oFrame.sy,
                oFrame.sw,
                oFrame.sh,
                oFrame.dx,
                oFrame.dy,
                oFrame.dw,
                oFrame.dh
            );
         };

         // Setup Animation Loop
         this.animate = function() {
             this.time.current = Date.now();
             this.animationRequestID = window.requestAnimationFrame( this.animate.bind( this ) );

             // Draw: clear
             this.app.context.clearRect( 0, 0, this.app.width, this.app.height );
             // Draw: background
             this.background.draw();
             // Draw tubes
             this.tubes.forEach( function( oTubesPair ) {
                 oTubesPair.update();
             } );
             // Draw: Ground
             this.ground.update(); // On le met en dessous de draw tubes pour que les tubes soit dessinné en dessous du sol.
             // Draw: bird
             this.bird.update();
             if ( this.time.current - this.time.start > 50 ) {
                 this.time.start = Date.now();
                 ( ++this.bird.animation.step < this.bird.animation.maxSteps ) || ( this.bird.animation.step = 0 );
             }
             this.bird.draw( this.bird.animation.step );

             if ( game.started === false ) {
                 // Draw: gameOver
                 this.gameOver.draw();
                 // Draw: scoreTable;
                 this.scoreTable.draw();

                 oApp.drawScore();
             } else if ( !game.started ) {
                 // Draw: flapiTitle
                 this.flapiTitle.draw();
                 // Draw: getReady
                 this.getReady.draw();
                 // Draw: playButton
                 this.playButton.draw();
             }

         };

         this.over = function() {
             game.started = false;
             window.cancelAnimationFrame( this.animationRequestID );

             // window.alert( "Game Over, you suck! \n\nYour score: " + this.bird.score.current );

             // if ( window.confirm( "Wanna try again ?" ) ) {
             //     this.start();
             // }
         };

         // initialise Game
         this.start = function() {
             // declare click & keyboard event
             // !!! attention a ne déclarer nos élément qu'une seule fois
             if ( !this.eventsSetted ) {
                 this.app.canvas.addEventListener( "click", this.bird.update.bind( this.bird ) );
                 window.addEventListener( "keyup", this.bird.update.bind( this.bird ) );
                 this.eventsSetted = true;
             }
             // reset some var
             this.tubes = [];
             this.bird.init();
             this.time.start = Date.now();
             // Launch Animation
             this.animate();
         };

         // Load spriteSheet
         this.spriteSheet = new Image();
         this.spriteSheet.addEventListener( "load", this.start.bind( this ) );
         this.spriteSheet.src = "./resources/sprite.png";

     };

     window.Flappy = Flappy;

 } )();
