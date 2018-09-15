"use strict";

/**
 * Creates a draggable band from a list of items
 * @copyright S. Derdeyn 2018
 * @license MIT
 */
var dragBand = function () {
  return {
    init: init
  };
  /**
   * Initialized a dragBand instance
   * @arg {Object} element - the container element containing list items
   * @arg {number} intialItemIndex - index of initially selected item
   * @arg {Object} options - optional settings
   * @arg {Object} options.leftScroller - element representing left scrollbutton (default null)
   * @arg {Object} options.rightscroller - element representing right scrollbutton (default null)
   * @arg {number} options.scrollstep - number of px to scroll when using wheel/scrollbutton (default 50)
   * @arg {number} options.elasticWidth - dragging elasticity beyond left/right edges in px (default 100)
   * @arg {number} options.hideScrollerMargin - scrollbutton becomes hidden when less than this px amount from edge (default 20)
   */

  function init(element, intialItemIndex, options) {
    var _C = element;
    options = options || {};
    var _leftScroller = options.leftScroller;
    var _rightscroller = options.rightscroller;
    var scrollstep = options.scrollstep || 50;
    var startIndex = intialItemIndex || null;
    var elasticWidth = options.elasticWidth || 100;
    var hideScrollerMargin = options.hideScrollerMargin || 20;
    var locked = false;
    var startX = null;
    var i = 0,
        i_next = 0;
    var currentX = getRelativePosition(_C.children[i], _C).x;
    var lastMovement = 0;
    var lastEvent = null;
    var spdPosA = 0;
    var currentSpeed = 0,
        fadeSpeed = 0;
    var speedometer = setInterval(function () {
      var spdPosB = getPosition(_C).x;
      currentSpeed = (spdPosB - spdPosA) * 10; // in px/s

      spdPosA = spdPosB;
    }, 100);
    var N = _C.children.length; // need for lef & right limits

    var containerWidth = recalculateContainerWidth();
    var leftLimit = _C.parentElement.offsetLeft;
    var rightLimit = _C.parentElement.offsetWidth - containerWidth;
    var selectedIndex = startIndex;
    selectItem(selectedIndex);

    function selectItem(itemIndex) {
      var setPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      selectedIndex = itemIndex;
      if (setPosition) setX(getPositionForIndex(itemIndex));
      refreshSelection(selectedIndex);
    }

    function recalculateContainerWidth() {
      var width = 0;

      for (var ci = 0; ci < N; ci++) {
        width += _C.children[ci].offsetWidth; //console.log("child. width " + _C.children[ci].offsetWidth);
      } //console.log("cont. width " + width);


      _C.style.width = "".concat(width, "px");
      return width;
    }

    function setX(newX) {
      //limit new position
      currentX = Math.min(leftLimit, Math.max(rightLimit, newX));
      _C.style.left = "".concat(currentX, "px");

      _C.classList.toggle('smooth', !(locked = false));

      refreshScrollers(currentX);
    }

    function refreshScrollers(xPos) {
      if (_leftScroller) {
        _leftScroller.style.opacity = isLeftScrollerVisible(xPos) ? "1" : "0";
        _leftScroller.style.pointerEvents = isLeftScrollerVisible(xPos) ? "all" : "none"; // enables click-through when disabled
      }

      if (_rightscroller) {
        _rightscroller.style.opacity = isRightScrollerVisible(xPos) ? "1" : "0";
        _rightscroller.style.pointerEvents = isRightScrollerVisible(xPos) ? "all" : "none"; // enables click-through when disabled
      }
    }

    function isLeftScrollerVisible(xPos) {
      return !(xPos > leftLimit - hideScrollerMargin);
    }

    function isRightScrollerVisible(xPos) {
      return !(xPos < rightLimit + hideScrollerMargin);
    }

    function refreshSelection(index) {
      for (var _i = 0; _i < N; _i++) {
        _C.children[_i].classList.toggle('selected', _i == index);
      }
    }

    function resized(e) {
      containerWidth = recalculateContainerWidth();
      leftLimit = _C.parentElement.offsetLeft;
      rightLimit = _C.parentElement.offsetWidth - containerWidth; //setToItemPosition(i);

      setX(getPositionForIndex(selectedIndex));
    }

    function unify(e) {
      return e.changedTouches ? e.changedTouches[0] : e;
    }

    ;

    function dragStarted(e) {
      if (!locked) {
        //console.log(e.type);
        lastEvent = e.type;
        startX = unify(e).clientX;

        _C.classList.toggle('smooth', !(locked = true));
      }
    }

    ;

    function dragStopped(e) {
      //console.log(e.type);
      lastEvent = e.type;

      if (locked) {
        var dx = unify(e).clientX - startX,
            s = Math.sign(dx),
            childStarts = [];
        lastMovement = dx;
        var stopX = currentX + lastMovement;
        currentX = stopX + currentSpeed * .125;
        setX(currentX); //console.log("Exit", { currentSpeed, currentX, stopX });

        startX = null;
      }
    }

    ;

    function drag(e) {
      //if(lastEvent != e.type ) console.log(e.type);
      //lastEvent = e.type;
      if (locked) {
        var tx = Math.round(unify(e).clientX - startX);
        var newX = currentX + tx;
        var leftElasticLimit = leftLimit + elasticWidth;
        var rightElasticLimit = rightLimit - elasticWidth;

        if (newX <= leftElasticLimit && newX > rightElasticLimit) {
          _C.style.left = "".concat(newX, "px");
          refreshScrollers(newX); //console.log("left set ", [ newX, _C.offsetWidth, containerWidth]);
        }
      }
    }

    ;
    document.body.addEventListener('mousemove', drag, false);
    document.body.addEventListener('touchmove', drag, false);

    _C.addEventListener('mousedown', dragStarted, false);

    _C.addEventListener('touchstart', dragStarted, false);

    document.body.addEventListener('mouseup', dragStopped, false);
    document.body.addEventListener('touchend', dragStopped, false);
    window.addEventListener('resize', resized, false);

    _C.addEventListener('blur', function (e) {
      console.log("blur");
    }, false);

    _C.addEventListener("wheel", function (e) {
      setX(currentX - Math.sign(e.deltaY) * scrollstep);
    }, false); //bind click handler to children and all their descendants (most likely <a>'s)


    var _loop = function _loop(ci) {
      links = _C.children[ci].getElementsByTagName("*"); // just bind to everything underneath.. not just <a>'s

      for (var linkIndex = 0; linkIndex < links.length; linkIndex++) {
        links[linkIndex].addEventListener('click', function (e) {
          //console.log("clicked last move: " + Math.abs(lastMovement));
          if (Math.abs(lastMovement) >= 50) {
            e.preventDefault();
            return false;
          }

          selectItem(ci, true);
          this.blur(); //remove ugly FF dashed line
          //console.log("Clicked a link");
        }, true);
      }
    };

    for (var ci = 0; ci < N; ci++) {
      var links;

      _loop(ci);
    }

    if (_leftScroller) _leftScroller.addEventListener('click', function (e) {
      if (isLeftScrollerVisible(currentX)) {
        setX(currentX + scrollstep);
      }
    }, true);
    if (_rightscroller) _rightscroller.addEventListener('click', function (e) {
      if (isLeftScrollerVisible(currentX)) {
        setX(currentX - scrollstep);
      }
    }, true);

    function getPositionForIndex(itemIndex) {
      if (itemIndex) {
        var child = _C.children[itemIndex];
        var childLeft = getRelativePosition(child, _C).x;
        return -childLeft + child.offsetWidth / 2;
      } else {
        return currentX;
      }
    } // Helper function to get an element's exact position


    function getPosition(el) {
      var xPos = 0;
      var yPos = 0;

      while (el) {
        if (el.tagName == "BODY") {
          // deal with browser quirks with body/window/document and page scroll
          var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
          var yScroll = el.scrollTop || document.documentElement.scrollTop;
          xPos += el.offsetLeft - xScroll + el.clientLeft;
          yPos += el.offsetTop - yScroll + el.clientTop;
        } else {
          // for all other non-BODY elements
          xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
          yPos += el.offsetTop - el.scrollTop + el.clientTop;
        }

        el = el.offsetParent;
      }

      return {
        x: xPos,
        y: yPos
      };
    }

    function getRelativePosition(el, elParent) {
      var parentPos = getPosition(elParent);
      var elementPos = getPosition(el);
      return {
        x: elementPos.x - parentPos.x,
        y: elementPos.y - parentPos.y
      };
    }

    return {
      selectItem: selectItem
    };
  }
}();