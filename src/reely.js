const reely = (element, opts) => {
  const options = Object.assign({
    imageArray: [],
    sensitivity: 10,
    drag: true,
    auto: false,
    edgeStop: false,
  }, opts);

  const container = element;
  const image = container.querySelector('img');
  const { sensitivity } = options;
  const mobileRate = options.sensitivity / 3;
  const images = options.imageArray;
  const preloadImages = [];
  const errorPrefix = '[reely]';
  let iAuto = 0;
  let oldX = 0;
  let oldDiff = null;
  let lastMove = 'none';
  let lastMoveConstant = 'none';
  let previousX = 0;
  let i = 0;
  let timer;
  let touchOnThis = false;

  const logError = (msg) => {
    console.error(`${errorPrefix} ${msg}`); // eslint-disable-line no-console
  };

  const rotate = (xcoord) => {
    if (xcoord > oldX) {
      // moving right.
      if (lastMove === 'left') {
        // Fixes glitch when changing directions.
        i += 1;
      }

      if (i >= images.length) {
        if (!options.edgeStop) {
          i = 0;
        } else {
          i = images.length - 1;
        }
      }

      image.setAttribute('src', images[i]);

      if (i >= images.length) {
        if (!options.edgeStop) {
          i = 0;
        } else {
          i = images.length - 1;
        }
      } else {
        i += 1;
      }

      // Record last move direction.
      lastMove = 'right';
    } else if (xcoord < oldX) {
      // moving left.

      if (lastMove === 'right') {
        // Fixes glitch when changing directions.
        i -= 1;
      }

      if (i <= 0) {
        if (!options.edgeStop) {
          i = images.length - 1;
        } else {
          i = 0;
        }
      }

      image.setAttribute('src', images[i]);

      if (i <= 0) {
        if (!options.edgeStop) {
          i = images.length - 1;
        } else {
          i = 0;
        }
      } else {
        i -= 1;
      }

      // Record last move direction.
      lastMove = 'left';
    }

    // Record the last x position for use when the method is called again.
    oldX = xcoord;

    // Dispatch slideChange event
    const ev = new CustomEvent('slideChanged', {
      detail: {
        currentSlide: i,
      },
    });

    container.dispatchEvent(ev);
  };

  const changeLogic = (xcoord, deviceRate) => {
    if (oldDiff === null) {
      // If this is the first move, set oldDiff to
      // the current x coordinate and call the rotate method
      // at this current coordinate.
      oldDiff = xcoord;
      rotate(xcoord);
    }

    // Set the last direction moved for use in the
    // conditionals below.
    if (xcoord > oldDiff) {
      lastMoveConstant = 'right';
    } else if (xcoord < oldDiff) {
      lastMoveConstant = 'left';
    }

    if (xcoord > previousX && lastMoveConstant === 'left') {
      // If moving right AND the last move was to the left, reset
      // oldDiff to current x position and iterate i by 1 to fix
      // image repition bug.

      oldDiff = xcoord;
      i += 1;
    } else if (xcoord < previousX && lastMoveConstant === 'right') {
      // If moving left AND the last move was to the right, reset
      // oldDiff to current x position and de-iterate i by 1 to fix
      // image repition bug.

      oldDiff = xcoord;
      i -= 1;
    }

    // Only call the rotate method when amount of pixels traveled
    // is greater than the specified rate.
    if (Math.abs(xcoord - oldDiff) > deviceRate) {
      rotate(xcoord);
      oldDiff = xcoord;
    }
    previousX = xcoord;
  };

  const preload = (imageArray) => {
    if (!preloadImages.list) {
      preloadImages.list = [];
    }

    for (let j = 0; j < imageArray.length; j += 1) {
      const img = new Image();
      img.onload = function onload() {
        const index = preloadImages.list.indexOf(this);
        if (index !== -1) {
          // remove this one from the array once it's loaded
          // for memory consumption reasons
          preloadImages.splice(index, 1);
        }
      };
      preloadImages.list.push(img);
      img.src = imageArray[j];
    }
  };

  const auto = (speed) => {
    timer = setInterval(() => {
      iAuto += 1;

      if (iAuto >= images.length) {
        iAuto = 0;
      }
      image.setAttribute('src', images[iAuto]);
    }, speed);
  };

  const drag = () => {
    let dragging = false;

    document.ondragstart = () => false;

    image.addEventListener('mousedown', (e) => {
      if (!dragging) {
        dragging = true;
      }
    });

    document.querySelector('body').addEventListener('mousemove', (e) => {
      if (dragging) {
        changeLogic(e.clientX, sensitivity);
      }
    });

    document.querySelector('body').addEventListener('mouseup', (e) => {
      if (dragging) {
        dragging = false;
      }
    });
  };

  const mouseIsMoving = () => {
    document.querySelector('body').addEventListener('mousemove', (e) => {
      const xcoord = e.pageX;
      const deviceRate = sensitivity;

      changeLogic(xcoord, deviceRate);
    });
  };

  const touchIsMoving = () => {
    const deviceRate = mobileRate;
    let xcoord;

    const update = function u() {
      if (!touchOnThis) {
        return;
      }
      changeLogic(xcoord, deviceRate);
      requestAnimationFrame(update);
    };

    container.addEventListener('touchstart', (e) => {
      xcoord = e.pageX || e.touches[0].pageX;
      touchOnThis = true;
      requestAnimationFrame(update);
    });

    window.addEventListener('touchmove', (e) => {
      xcoord = e.pageX || e.touches[0].pageX;

      if (touchOnThis) {
        changeLogic(xcoord, deviceRate);
      }
    });

    window.addEventListener('touchend', () => {
      touchOnThis = false;
    });
  };

  const slideTo = (slideNumber) => {
    if (slideNumber >= 0 && slideNumber < images.length) {
      i = slideNumber;
      lastMove = 'none';
      lastMoveConstant = 'none';
      image.setAttribute('src', images[i]);
      return true;
    }

    logError('Your desired slide number is smaller than 0 or bigger than the total slide amount');
  };

  const init = () => {
    if (options.auto === true) {
      auto(sensitivity);
    } else {
      // Test for smartphone browser.
      // Source : http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        touchIsMoving();
      } else if (options.drag === true) {
        drag();
      } else if (options.drag === false) {
        mouseIsMoving();
      }
    }

    preload(images);
  };

  return {
    init,
    slideTo,
  };
};

export default reely;
