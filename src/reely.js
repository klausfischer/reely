class Reely {
    constructor(element, options) {

      const _ = this;

      const defaults = {
        container: '.reely',
        imageArray : [],
        sensitivity: 35,
        drag : true,
        auto : false,
        edgeStop: false
      };

      _.settings = Object.assign(defaults, options);
      _.container = element;
      _.image = _.container.querySelector('img');
      _.oldX = 0;
      _.oldDiff = null;
      _.lastMove = "none";
      _.lastMoveConstant = "none";
      _.previousX = 0;
      _.i = 0;
      _.iAuto = 0;
      _.sensitivity = _.settings.sensitivity;
      _.autoplaySpeed = _.settings.autoplaySpeed;
      _.mobileRate = _.settings.sensitivity / 3;
      _.images = _.settings.imageArray;
      _.preloadImages = [];
      _.timer = null;
      _.touchOnThis = false;
      _.init();
    }

    init() {
      const _ = this;

      if (_.settings.auto === true) {
        _.auto(_.sensitivity);
      } else {
        // Test for smartphone browser.
        // Source : http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
          _.touchIsMoving();
        } else if(_.settings.drag === true ){
          _.drag();
          _.image.classList.add('rollerblade-drag');
        } else if (_.settings.drag === false) {
          _.mouseIsMoving();
        }
      }

              _.preload(_.images);
    }

    preload(imageArray) {
      const _ = this;

      if (!_.preloadImages.list) {
          _.preloadImages.list = [];
      }

      for (let i = 0; i < imageArray.length; i++) {
          const img = new Image();
          img.onload = function() {
              const index = _.preloadImages.list.indexOf(this);
              if (index !== -1) {
                  // remove this one from the array once it's loaded
                  // for memory consumption reasons
                  _.preloadImages.splice(index, 1);
              }
          }
          _.preloadImages.list.push(img);
          img.src = imageArray[i];
      }
    }

    auto(speed) {
      const _ = this;

      _.timer = setInterval(function() {
        _.iAuto++;

        if (_.iAuto >= _.images.length) {
          _.iAuto = 0;
        }
        _.image.setAttribute('src', _.images[_.iAuto]);
      }, speed);
    }

    autoStop() {
      clearInterval(this.timer);
    }

    drag() {
      const _ = this;
      let dragging = false;

      document.ondragstart = () => false;

      _.image.addEventListener('mousedown', (e) => {
        e.preventDefault;
        if (!dragging) {
          dragging = true;
        }
      });

      document.querySelector('body').addEventListener('mousemove', (e) => {
        e.preventDefault;
        if (dragging) {
          _.changeLogic(e.clientX, _.sensitivity);
        }
      });

      document.querySelector('body').addEventListener('mouseup', (e) => {
        e.preventDefault;
        if (dragging) {
          dragging = false;
        }
      });
    }

    mouseIsMoving() {
      const _ = this;

      document.querySelector('body').addEventListener('mousemove', (e) => {
        const xcoord = e.pageX;
        const deviceRate = _.sensitivity;

        _.changeLogic(xcoord, deviceRate);

      });
    }

    touchIsMoving() {
      const _ = this;
      var xcoord;
      var deviceRate = _.mobileRate;

      const update = function() {
        if (!_.touchOnThis) {
          return;
        }
        _.changeLogic(xcoord, deviceRate);
        requestAnimationFrame(update);
      }

      _.container.addEventListener('touchstart', (e) => {
        xcoord = e.pageX || e.touches[0].pageX;
        _.touchOnThis = true;
        requestAnimationFrame(update);
      });

      window.addEventListener('touchmove', (e) => {
        xcoord = e.pageX || e.touches[0].pageX;

        if (_.touchOnThis) {
          _.changeLogic(xcoord, deviceRate);
        }
      });

      window.addEventListener('touchend', (e) => {
        _.touchOnThis = false;
      });
    }

    changeLogic(xcoord, deviceRate) {
      const _ = this;

      if (_.oldDiff === null) {
              // If this is the first move, set _.oldDiff to
              // the current x coordinate and call the rotate method
              // at this current coordinate.
              _.oldDiff = xcoord;
              _.rotate(xcoord);
      }

      // Set the last direction moved for use in the
      // conditionals below.
      if (xcoord > _.oldDiff ) {
        _.lastMoveConstant = 'right';
      } else if (xcoord < _.oldDiff ) {
        _.lastMoveConstant = 'left';
      };

      if ( xcoord > _.previousX && _.lastMoveConstant === 'left' ) {
        // If moving right AND the last move was to the left, reset
        // oldDiff to current x position and iterate i by 1 to fix
        // image repition bug.

        _.oldDiff = xcoord;
        _.i++;
      } else if ( xcoord < _.previousX && _.lastMoveConstant === 'right' ) {
        // If moving left AND the last move was to the right, reset
        // oldDiff to current x position and de-iterate i by 1 to fix
        // image repition bug.

        _.oldDiff = xcoord;
        _.i--;
      }

      // Only call the rotate method when amount of pixels traveled
      // is greater than the specified rate.
      if (Math.abs(xcoord - _.oldDiff) > deviceRate) {
        _.rotate(xcoord);
        _.oldDiff = xcoord;
      }
      _.previousX = xcoord;
    }

    rotate(xcoord) {
      const _ = this;

      if(xcoord > _.oldX) {

        // moving right.
        if(_.lastMove === 'left') {
          // Fixes glitch when changing directions.
          _.i++;
        }

        if(_.i >= _.images.length) {
          if (!_.settings.edgeStop) {
            _.i = 0;
          } else {
            _.i = _.images.length - 1;
          }
        }

        _.image.setAttribute('src', _.images[_.i]);

        if (_.i >= _.images.length) {
          if (!_.settings.edgeStop) {
            _.i = 0;
          } else {
            _.i = _.images.length - 1;
          }
        } else {
          _.i++;
        }

        // Record last move direction.
        _.lastMove = 'right';

      } else if( xcoord < _.oldX ) {
        // moving left.

        if(_.lastMove === 'right') {
          // Fixes glitch when changing directions.
          _.i--;
        }

        if(_.i <= 0) {
          if (!_.settings.edgeStop) {
            _.i = _.images.length - 1;
          } else {
            _.i = 0;
          }
        }

        _.image.setAttribute('src', _.images[_.i]);

        if (_.i <= 0) {
          if (!_.settings.edgeStop) {
            _.i = _.images.length - 1;
          } else {
            _.i = 0;
          }
        } else {
          _.i--;
        }

        // Record last move direction.
        _.lastMove = 'left';

      }

      // Record the last x position for use when the method is called again.
      _.oldX = xcoord;
    }

  }

  const reely = function(options) {

    const containerElem = document.querySelector(options.container);

    let instance = containerElem.reely;

    if (!instance) {
      instance = new Reely(containerElem, options);
      containerElem.reely = instance;
      return instance;
    }

    if (opts === true) {
      return instance;
    }
  }

  export default reely;
