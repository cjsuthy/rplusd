
(function($) {

	// Settings.
		var settings = {

			// Keyboard shortcuts.
				keyboardShortcuts: {

					// If true, enables scrolling via keyboard shortcuts.
						enabled: true,

					// Sets the distance to scroll when using the left/right arrow keys.
						distance: 50

				},

			// Scroll wheel.
				scrollWheel: {

					// If true, enables scrolling via the scroll wheel.
						enabled: true,

					// Sets the scroll wheel factor. (Ideally) a value between 0 and 1 (lower = slower scroll, higher = faster scroll).
						factor: 1

				},

			// Scroll zones.
				scrollZones: {

					// If true, enables scrolling via scroll zones on the left/right edges of the scren.
						enabled: true,

					// Sets the speed at which the page scrolls when a scroll zone is active (higher = faster scroll, lower = slower scroll).
						speed: 15

				},

			// Dragging.
				dragging: {

					// If true, enables scrolling by dragging the main wrapper with the mouse.
						enabled: true,

					// Sets the momentum factor. Must be a value between 0 and 1 (lower = less momentum, higher = more momentum, 0 = disable momentum scrolling).
						momentum: 0.875,

					// Sets the drag threshold (in pixels).
						threshold: 10

				},

			// If set to a valid selector , prevents key/mouse events from bubbling from these elements.
				excludeSelector: 'input:focus, select:focus, textarea:focus, audio, video, iframe',

			// Link scroll speed.
				linkScrollSpeed: 1000

		};

	// Vars.
		var	$window = $(window),
			$document = $(document),
			$body = $('body'),
			$html = $('html'),
			$bodyHtml = $('body,html'),
			$wrapper = $('#wrapper');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ],
			short:    '(min-aspect-ratio: 16/7)',
			xshort:   '(min-aspect-ratio: 16/6)'
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Tweaks/fixes.

		// Mobile: Revert to native scrolling.
			if (browser.mobile) {

				// Disable all scroll-assist features.
					settings.keyboardShortcuts.enabled = false;
					settings.scrollWheel.enabled = false;
					settings.scrollZones.enabled = false;
					settings.dragging.enabled = false;

				// Re-enable overflow on body.
					$body.css('overflow-x', 'auto');

			}

		// IE: Various fixes.
			if (browser.name == 'ie') {

				// Enable IE mode.
					$body.addClass('is-ie');

				// Page widths.
					$window
						.on('load resize', function() {

							// Calculate wrapper width.
								var w = 0;

								$wrapper.children().each(function() {
									w += $(this).width();
								});

							// Apply to page.
								$html.css('width', w + 'px');

						});

			}

		// Polyfill: Object fit.
			if (!browser.canUse('object-fit')) {

				$('.image[data-position]').each(function() {

					var $this = $(this),
						$img = $this.children('img');

					// Apply img as background.
						$this
							.css('background-image', 'url("' + $img.attr('src') + '")')
							.css('background-position', $this.data('position'))
							.css('background-size', 'cover')
							.css('background-repeat', 'no-repeat');

					// Hide img.
						$img
							.css('opacity', '0');

				});

			}

	// Keyboard shortcuts.
		if (settings.keyboardShortcuts.enabled)
			(function() {

				$wrapper

					// Prevent keystrokes inside excluded elements from bubbling.
						.on('keypress keyup keydown', settings.excludeSelector, function(event) {

							// Stop propagation.
								event.stopPropagation();

						});

				$window

					// Keypress event.
						.on('keydown', function(event) {

							var scrolled = false;

							switch (event.keyCode) {

								// Left arrow.
									case 37:
										$document.scrollLeft($document.scrollLeft() - settings.keyboardShortcuts.distance);
										scrolled = true;
										break;

								// Right arrow.
									case 39:
										$document.scrollLeft($document.scrollLeft() + settings.keyboardShortcuts.distance);
										scrolled = true;
										break;

								// Page Up.
									case 33:
										$document.scrollLeft($document.scrollLeft() - $window.width() + 100);
										scrolled = true;
										break;

								// Page Down, Space.
									case 34:
									case 32:
										$document.scrollLeft($document.scrollLeft() + $window.width() - 100);
										scrolled = true;
										break;

								// Home.
									case 36:
										$document.scrollLeft(0);
										scrolled = true;
										break;

								// End.
									case 35:
										$document.scrollLeft($document.width());
										scrolled = true;
										break;

							}

							// Scrolled?
								if (scrolled) {

									// Prevent default.
										event.preventDefault();
										event.stopPropagation();

									// Stop link scroll.
										$bodyHtml.stop();

								}

						});

			})();

	// Scroll wheel.
		if (settings.scrollWheel.enabled)
			(function() {

				// Based on code by @miorel + @pieterv of Facebook (thanks guys :)
				// github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
					var normalizeWheel = function(event) {

						var	pixelStep = 10,
							lineHeight = 40,
							pageHeight = 800,
							sX = 0,
							sY = 0,
							pX = 0,
							pY = 0;

						// Legacy.
							if ('detail' in event)
								sY = event.detail;
							else if ('wheelDelta' in event)
								sY = event.wheelDelta / -120;
							else if ('wheelDeltaY' in event)
								sY = event.wheelDeltaY / -120;

							if ('wheelDeltaX' in event)
								sX = event.wheelDeltaX / -120;

						// Side scrolling on FF with DOMMouseScroll.
							if ('axis' in event
							&&	event.axis === event.HORIZONTAL_AXIS) {
								sX = sY;
								sY = 0;
							}

						// Calculate.
							pX = sX * pixelStep;
							pY = sY * pixelStep;

							if ('deltaY' in event)
								pY = event.deltaY;

							if ('deltaX' in event)
								pX = event.deltaX;

							if ((pX || pY)
							&&	event.deltaMode) {

								if (event.deltaMode == 1) {
									pX *= lineHeight;
									pY *= lineHeight;
								}
								else {
									pX *= pageHeight;
									pY *= pageHeight;
								}

							}

						// Fallback if spin cannot be determined.
							if (pX && !sX)
								sX = (pX < 1) ? -1 : 1;

							if (pY && !sY)
								sY = (pY < 1) ? -1 : 1;

						// Return.
							return {
								spinX: sX,
								spinY: sY,
								pixelX: pX,
								pixelY: pY
							};

					};

				// Wheel event.
					$body.on('wheel', function(event) {

						// Disable on <=small.
							if (breakpoints.active('<=small'))
								return;

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Stop link scroll.
							$bodyHtml.stop();

						// Calculate delta, direction.
							var	n = normalizeWheel(event.originalEvent),
								x = (n.pixelX != 0 ? n.pixelX : n.pixelY),
								delta = Math.min(Math.abs(x), 150) * settings.scrollWheel.factor,
								direction = x > 0 ? 1 : -1;

						// Scroll page.
							$document.scrollLeft($document.scrollLeft() + (delta * direction));

					});

			})();

	// Scroll zones.
		if (settings.scrollZones.enabled)
			(function() {

				var	$left = $('<div class="scrollZone left"></div>'),
					$right = $('<div class="scrollZone right"></div>'),
					$zones = $left.add($right),
					paused = false,
					intervalId = null,
					direction,
					activate = function(d) {

						// Disable on <=small.
							if (breakpoints.active('<=small'))
								return;

						// Paused? Bail.
							if (paused)
								return;

						// Stop link scroll.
							$bodyHtml.stop();

						// Set direction.
							direction = d;

						// Initialize interval.
							clearInterval(intervalId);

							intervalId = setInterval(function() {
								$document.scrollLeft($document.scrollLeft() + (settings.scrollZones.speed * direction));
							}, 25);

					},
					deactivate = function() {

						// Unpause.
							paused = false;

						// Clear interval.
							clearInterval(intervalId);

					};

				$zones
					.appendTo($wrapper)
					.on('mouseleave mousedown', function(event) {
						deactivate();
					});

				$left
					.css('left', '0')
					.on('mouseenter', function(event) {
						activate(-1);
					});

				$right
					.css('right', '0')
					.on('mouseenter', function(event) {
						activate(1);
					});

				$wrapper
					.on('---pauseScrollZone', function(event) {

						// Pause.
							paused = true;

						// Unpause after delay.
							setTimeout(function() {
								paused = false;
							}, 500);

					});

			})();

	// Dragging.
		if (settings.dragging.enabled)
			(function() {

				var dragging = false,
					dragged = false,
					distance = 0,
					startScroll,
					momentumIntervalId, velocityIntervalId,
					startX, currentX, previousX,
					velocity, direction;

				$wrapper

					// Prevent image drag and drop.
						.on('mouseup mousemove mousedown', '.image, img', function(event) {
							event.preventDefault();
						})

					// Prevent mouse events inside excluded elements from bubbling.
						.on('mouseup mousemove mousedown', settings.excludeSelector, function(event) {

							// Prevent event from bubbling.
								event.stopPropagation();

							// End drag.
								dragging = false;
								$wrapper.removeClass('is-dragging');
								clearInterval(velocityIntervalId);
								clearInterval(momentumIntervalId);

							// Pause scroll zone.
								$wrapper.triggerHandler('---pauseScrollZone');

						})

					// Mousedown event.
						.on('mousedown', function(event) {

							// Disable on <=small.
								if (breakpoints.active('<=small'))
									return;

							// Clear momentum interval.
								clearInterval(momentumIntervalId);

							// Stop link scroll.
								$bodyHtml.stop();

							// Start drag.
								dragging = true;
								$wrapper.addClass('is-dragging');

							// Initialize and reset vars.
								startScroll = $document.scrollLeft();
								startX = event.clientX;
								previousX = startX;
								currentX = startX;
								distance = 0;
								direction = 0;

							// Initialize velocity interval.
								clearInterval(velocityIntervalId);

								velocityIntervalId = setInterval(function() {

									// Calculate velocity, direction.
										velocity = Math.abs(currentX - previousX);
										direction = (currentX > previousX ? -1 : 1);

									// Update previous X.
										previousX = currentX;

								}, 50);

						})

					// Mousemove event.
						.on('mousemove', function(event) {

							// Not dragging? Bail.
								if (!dragging)
									return;

							// Velocity.
								currentX = event.clientX;

							// Scroll page.
								$document.scrollLeft(startScroll + (startX - currentX));

							// Update distance.
								distance = Math.abs(startScroll - $document.scrollLeft());

							// Distance exceeds threshold? Disable pointer events on all descendents.
								if (!dragged
								&&	distance > settings.dragging.threshold) {

									$wrapper.addClass('is-dragged');

									dragged = true;

								}

						})

					// Mouseup/mouseleave event.
						.on('mouseup mouseleave', function(event) {

							var m;

							// Not dragging? Bail.
								if (!dragging)
									return;

							// Dragged? Re-enable pointer events on all descendents.
								if (dragged) {

									setTimeout(function() {
										$wrapper.removeClass('is-dragged');
									}, 100);

									dragged = false;

								}

							// Distance exceeds threshold? Prevent default.
								if (distance > settings.dragging.threshold)
									event.preventDefault();

							// End drag.
								dragging = false;
								$wrapper.removeClass('is-dragging');
								clearInterval(velocityIntervalId);
								clearInterval(momentumIntervalId);

							// Pause scroll zone.
								$wrapper.triggerHandler('---pauseScrollZone');

							// Initialize momentum interval.
								if (settings.dragging.momentum > 0) {

									m = velocity;

									momentumIntervalId = setInterval(function() {

										// Momentum is NaN? Bail.
											if (isNaN(m)) {

												clearInterval(momentumIntervalId);
												return;

											}

										// Scroll page.
											$document.scrollLeft($document.scrollLeft() + (m * direction));

										// Decrease momentum.
											m = m * settings.dragging.momentum;

										// Negligible momentum? Clear interval and end.
											if (Math.abs(m) < 1)
												clearInterval(momentumIntervalId);

									}, 15);

								}

						});

			})();

	// Link scroll.
		$wrapper
			.on('mousedown mouseup', 'a[href^="#"]', function(event) {

				// Stop propagation.
					event.stopPropagation();

			})
			.on('click', 'a[href^="#"]', function(event) {

				var	$this = $(this),
					href = $this.attr('href'),
					$target, x, y;

				// Get target.
					if (href == '#'
					||	($target = $(href)).length == 0)
						return;

				// Prevent default.
					event.preventDefault();
					event.stopPropagation();

				// Calculate x, y.
					if (breakpoints.active('<=small')) {

						x = $target.offset().top - (Math.max(0, $window.height() - $target.outerHeight()) / 2);
						y = { scrollTop: x };

					}
					else {

						x = $target.offset().left - (Math.max(0, $window.width() - $target.outerWidth()) / 2);
						y = { scrollLeft: x };

					}

				// Scroll.
					$bodyHtml
						.stop()
						.animate(
							y,
							settings.linkScrollSpeed,
							'swing'
						);

			});

	// Gallery.
		$('.gallery')
			.on('click', 'a', function(event) {

				var $a = $(this),
					$gallery = $a.parents('.gallery'),
					$modal = $gallery.children('.modal'),
					$modalImg = $modal.find('img'),
					href = $a.attr('href');

				// Not an image? Bail.
					if (!href.match(/\.(jpg|gif|png|mp4)$/))
						return;

				// Prevent default.
					event.preventDefault();
					event.stopPropagation();

				// Locked? Bail.
					if ($modal[0]._locked)
						return;

				// Lock.
					$modal[0]._locked = true;

				// Set src.
					$modalImg.attr('src', href);

				// Set visible.
					$modal.addClass('visible');

				// Focus.
					$modal.focus();

				// Delay.
					setTimeout(function() {

						// Unlock.
							$modal[0]._locked = false;

					}, 600);

			})
			.on('click', '.modal', function(event) {

				var $modal = $(this),
					$modalImg = $modal.find('img');

				// Locked? Bail.
					if ($modal[0]._locked)
						return;

				// Already hidden? Bail.
					if (!$modal.hasClass('visible'))
						return;

				// Stop propagation.
					event.stopPropagation();

				// Lock.
					$modal[0]._locked = true;

				// Clear visible, loaded.
					$modal
						.removeClass('loaded')

				// Delay.
					setTimeout(function() {

						$modal
							.removeClass('visible')

						// Pause scroll zone.
							$wrapper.triggerHandler('---pauseScrollZone');

						setTimeout(function() {

							// Clear src.
								$modalImg.attr('src', '');

							// Unlock.
								$modal[0]._locked = false;

							// Focus.
								$body.focus();

						}, 475);

					}, 125);

			})
			.on('keypress', '.modal', function(event) {

				var $modal = $(this);

				// Escape? Hide modal.
					if (event.keyCode == 27)
						$modal.trigger('click');

			})
			.on('mouseup mousedown mousemove', '.modal', function(event) {

				// Stop propagation.
					event.stopPropagation();

			})
			.prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
				.find('img')
					.on('load', function(event) {

						var $modalImg = $(this),
							$modal = $modalImg.parents('.modal');

						setTimeout(function() {

							// No longer visible? Bail.
								if (!$modal.hasClass('visible'))
									return;

							// Set loaded.
								$modal.addClass('loaded');

						}, 275);

					});
// Word Array 

var words = document.getElementsByClassName('word');
var wordArray = [];
var currentWord = 0;

words[currentWord].style.opacity = 1;
for (var i = 0; i < words.length; i++) {
  splitLetters(words[i]);
}

function changeWord() {
  var cw = wordArray[currentWord];
  var nw = currentWord == words.length-1 ? wordArray[0] : wordArray[currentWord+1];
  for (var i = 0; i < cw.length; i++) {
    animateLetterOut(cw, i);
  }
  
  for (var i = 0; i < nw.length; i++) {
    nw[i].className = 'letter behind';
    nw[0].parentElement.style.opacity = 1;
    animateLetterIn(nw, i);
  }
  
  currentWord = (currentWord == wordArray.length-1) ? 0 : currentWord+1;
}

function animateLetterOut(cw, i) {
  setTimeout(function() {
		cw[i].className = 'letter out';
  }, i*80);
}

function animateLetterIn(nw, i) {
  setTimeout(function() {
		nw[i].className = 'letter in';
  }, 340+(i*80));
}

function splitLetters(word) {
  var content = word.innerHTML;
  word.innerHTML = '';
  var letters = [];
  for (var i = 0; i < content.length; i++) {
    var letter = document.createElement('span');
    letter.className = 'letter';
    letter.innerHTML = content.charAt(i);
    word.appendChild(letter);
    letters.push(letter);
  }
  
  wordArray.push(letters);
}

changeWord();
setInterval(changeWord, 4000);

// End Word Array



// <-------------------	Walking People Start ------------------>

console.clear();
console.log("lsakdfalskjdflnksd");

const config = {
  src:
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png",
  rows: 15,
  cols: 7
};

// UTILS

const randomRange = (min, max) => min + Math.random() * (max - min);

const randomIndex = (array) => randomRange(0, array.length) | 0;

const removeFromArray = (array, i) => array.splice(i, 1)[0];

const removeItemFromArray = (array, item) =>
  removeFromArray(array, array.indexOf(item));

const removeRandomFromArray = (array) =>
  removeFromArray(array, randomIndex(array));

const getRandomFromArray = (array) => array[randomIndex(array) | 0];

// TWEEN FACTORIES

const resetPeep = ({ stage, peep }) => {
  const direction = Math.random() > 0.5 ? 1 : -1;
  // using an ease function to skew random to lower values to help hide that peeps have no legs
  const offsetY = 100 - 250 * gsap.parseEase("power2.in")(Math.random());
  const startY = stage.height - peep.height + offsetY;
  let startX;
  let endX;

  if (direction === 1) {
    startX = -peep.width;
    endX = stage.width;
    peep.scaleX = 1;
  } else {
    startX = stage.width + peep.width;
    endX = 0;
    peep.scaleX = -1;
  }

  peep.x = startX;
  peep.y = startY;
  peep.anchorY = startY;

  return {
    startX,
    startY,
    endX
  };
};

const normalWalk = ({ peep, props }) => {
  const { startX, startY, endX } = props;

  const xDuration = 10;
  const yDuration = 0.25;

  const tl = gsap.timeline();
  tl.timeScale(randomRange(0.5, 1.5));
  tl.to(
    peep,
    {
      duration: xDuration,
      x: endX,
      ease: "none"
    },
    0
  );
  tl.to(
    peep,
    {
      duration: yDuration,
      repeat: xDuration / yDuration,
      yoyo: true,
      y: startY - 10
    },
    0
  );

  return tl;
};

const walks = [normalWalk];

// CLASSES

class Peep {
  constructor({ image, rect }) {
    this.image = image;
    this.setRect(rect);

    this.x = 0;
    this.y = 0;
    this.anchorY = 0;
    this.scaleX = 1;
    this.walk = null;
  }

  setRect(rect) {
    this.rect = rect;
    this.width = rect[2];
    this.height = rect[3];

    this.drawArgs = [this.image, ...rect, 0, 0, this.width, this.height];
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, 1);
    ctx.drawImage(...this.drawArgs);
    ctx.restore();
  }
}

// MAIN

const img = document.createElement("img");
img.onload = init;
img.src = config.src;

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const stage = {
  width: 0,
  height: 0
};

const allPeeps = [];
const availablePeeps = [];
const crowd = [];

function init() {
  createPeeps();

  // resize also (re)populates the stage
  resize();

  gsap.ticker.add(render);
  window.addEventListener("resize", resize);
}

function createPeeps() {
  const { rows, cols } = config;
  const { naturalWidth: width, naturalHeight: height } = img;
  const total = rows * cols;
  const rectWidth = width / rows;
  const rectHeight = height / cols;

  for (let i = 0; i < total; i++) {
    allPeeps.push(
      new Peep({
        image: img,
        rect: [
          (i % rows) * rectWidth,
          ((i / rows) | 0) * rectHeight,
          rectWidth,
          rectHeight
        ]
      })
    );
  }
}

function resize() {
  stage.width = canvas.clientWidth;
  stage.height = canvas.clientHeight;
  canvas.width = stage.width * devicePixelRatio;
  canvas.height = stage.height * devicePixelRatio;

  crowd.forEach((peep) => {
    peep.walk.kill();
  });

  crowd.length = 0;
  availablePeeps.length = 0;
  availablePeeps.push(...allPeeps);

  initCrowd();
}

function initCrowd() {
  while (availablePeeps.length) {
    // setting random tween progress spreads the peeps out
    addPeepToCrowd().walk.progress(Math.random());
  }
}

function addPeepToCrowd() {
  const peep = removeRandomFromArray(availablePeeps);
  const walk = getRandomFromArray(walks)({
    peep,
    props: resetPeep({
      peep,
      stage
    })
  }).eventCallback("onComplete", () => {
    removePeepFromCrowd(peep);
    addPeepToCrowd();
  });

  peep.walk = walk;

  crowd.push(peep);
  crowd.sort((a, b) => a.anchorY - b.anchorY);

  return peep;
}

function removePeepFromCrowd(peep) {
  removeItemFromArray(crowd, peep);
  availablePeeps.push(peep);
}

function render() {
  canvas.width = canvas.width;
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);

  crowd.forEach((peep) => {
    peep.render(ctx);
  });

  ctx.restore();
}

})(jQuery);

// <-------------------	Walking People FIN ------------------>


// ACCORDIAN START // 

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}