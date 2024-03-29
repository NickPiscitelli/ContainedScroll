/* 
 * Contained Scroll - Perfect Scrollbar Fork
 * Nick Picitelli 2014
 * Perfect Scrollbar
 * Copyright (c) 2012, 2014 Hyeonje Alex Jun and other contributors
 * Licensed under the MIT License
 */
(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  'use strict';
  // The default settings for the plugin
  var defaultSettings = {
    wheelSpeed: 10,
    wheelPropagation: false,
    minScrollbarLength: null,
    suppressScrollY: false,
    scrollYMarginOffset: 0,
    includePadding: false,
    scrollSizeRatio: .8
  };
  var getEventClassName = (function () {
    var incrementingId = 0;
    return function () {
      var id = incrementingId;
      incrementingId += 1;
      return '.contained-scroll-' + id;
    };
  }());
  $.fn.containedScroll = function (suppliedSettings, option) {
    return this.each(function () {
      // Use the default settings
      var settings = $.extend(true, {}, defaultSettings),
          $this = $(this);
      if (typeof suppliedSettings === "object") {
        // But over-ride any supplied
        $.extend(true, settings, suppliedSettings);
      } else {
        // If no settings were supplied, then the first param must be the option
        option = suppliedSettings;
      }
      // Catch options
      if (option === 'update') {
        if ($this.data('contained-scroll-update')) {
          $this.data('contained-scroll-update')();
        }
        return $this;
      }
      else if (option === 'destroy') {
        if ($this.data('contained-scroll-destroy')) {
          $this.data('contained-scroll-destroy')();
        }
        return $this;
      }
      if ($this.data('contained-scroll')) {
        // if there's already contained-scroll
        return $this.data('contained-scroll');
      }
      // Or generate new perfectScrollbar
      // Set class to the container
      $this.addClass('ps-container');
      var $scrollbarYRail = $this.parent().find('.ps-ycontain');
      var $scrollbarY = $scrollbarYRail.find('.ps-scrollbar-y'),
          scrollbarYActive,
          containerWidth,
          containerHeight,
          contentWidth,
          contentHeight,
          scrollHeight,
          scrollbarYTop,
          scrollbarYHeight,
          scrollbarYRight = parseInt($scrollbarYRail.css('right'), 10),
          eventClassName = getEventClassName();
      var updateContentScrollTop = function (currentTop, deltaY) {
        var newTop = currentTop + deltaY,
            maxTop = scrollHeight - scrollbarYHeight;
        if (newTop < 0) {
          scrollbarYTop = 0;
        }
        else if (newTop > maxTop) {
          scrollbarYTop = maxTop;
        }
        else {
          scrollbarYTop = newTop;
        }
        var scrollTop = parseInt(scrollbarYTop * (contentHeight - scrollHeight) / (scrollHeight - scrollbarYHeight), 10);
        $this.scrollTop(scrollTop);
        updateScrollbarCss();
      };
      var getSettingsAdjustedThumbSize = function (thumbSize) {
        if (settings.minScrollbarLength) {
          thumbSize = Math.max(thumbSize, settings.minScrollbarLength);
        }
        return thumbSize;
      };
      var updateScrollbarCss = function () {
        //$scrollbarYRail.css({top: $this.scrollTop(), right: scrollbarYRight - $this.scrollLeft(), height: containerHeight, display: scrollbarYActive ? "inherit": "none"});
        $scrollbarYRail.find('.ps-scrollbar-y').css({top: scrollbarYTop});
      };
      var updateBarSizeAndPosition = function () {
        containerWidth = settings.includePadding ? $this.innerWidth() : $this.width();
        containerHeight = settings.includePadding ? $this.innerHeight() : $this.height();
        scrollHeight = $this.height() * (settings.scrollSizeRatio || 1);
        contentWidth = $this.prop('scrollWidth');
        contentHeight = $this.prop('scrollHeight');
        if (!settings.suppressScrollY && scrollHeight + settings.scrollYMarginOffset < contentHeight) {
          scrollbarYActive = true;
          scrollbarYHeight = getSettingsAdjustedThumbSize(parseInt(scrollHeight * scrollHeight / contentHeight, 10));
          scrollbarYTop = parseInt($this.scrollTop() * (scrollHeight - scrollbarYHeight) / (contentHeight - scrollHeight), 10);
          if ($this.scrollTop() + containerHeight === contentHeight){
            scrollbarYTop = scrollHeight - scrollbarYHeight
          }
        }
        else {
          scrollbarYActive = false;
          scrollbarYHeight = 0;
          scrollbarYTop = 0;
          $this.scrollTop(0);
        }
        updateScrollbarCss();
      };
      var bindMouseScrollYHandler = function () {
        var currentTop,
            currentPageY;
        $scrollbarY.bind('mousedown' + eventClassName, function (e) {
          currentPageY = e.pageY;
          currentTop = $scrollbarY.position().top;
          $scrollbarYRail.addClass('in-scrolling');
          e.stopPropagation();
          e.preventDefault();
        });
        $(document).bind('mousemove' + eventClassName, function (e) {
          if ($scrollbarYRail.hasClass('in-scrolling')) {
            updateContentScrollTop(currentTop, e.pageY - currentPageY);
            e.stopPropagation();
            e.preventDefault();
          }
        });
        $(document).bind('mouseup' + eventClassName, function (e) {
          if ($scrollbarYRail.hasClass('in-scrolling')) {
            $scrollbarYRail.removeClass('in-scrolling');
          }
        });
        currentTop =
        currentPageY = null;
      };
      // check if the default scrolling should be prevented.
      var shouldPreventDefault = function (deltaX, deltaY) {
        var scrollTop = $this.scrollTop();
        if (deltaX === 0) {
          if (!scrollbarYActive) {
            return false;
          }
          if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= contentHeight - containerHeight && deltaY < 0)) {
            return !settings.wheelPropagation;
          }
        }
        return true;
      };
      // bind handlers
      var bindMouseWheelHandler = function () {
        // FIXME: Backward compatibility.
        // After e.deltaFactor applied, wheelSpeed should have smaller value.
        // Currently, there's no way to change the settings after the scrollbar initialized.
        // But if the way is implemented in the future, wheelSpeed should be reset.
        settings.wheelSpeed /= 10;
        var shouldPrevent = false;
        $this.bind('mousewheel' + eventClassName, function (e, deprecatedDelta, deprecatedDeltaX, deprecatedDeltaY) {
          var deltaX = e.deltaX * e.deltaFactor || deprecatedDeltaX,
              deltaY = e.deltaY * e.deltaFactor || deprecatedDeltaY;
          shouldPrevent = false;
          if (!settings.useBothWheelAxes) {
            // deltaX will only be used for horizontal scrolling and deltaY will
            // only be used for vertical scrolling - this is the default
            $this.scrollTop($this.scrollTop() - (deltaY * settings.wheelSpeed));
            $this.scrollLeft($this.scrollLeft() + (deltaX * settings.wheelSpeed));
          } else if (scrollbarYActive && !scrollbarXActive) {
            // only vertical scrollbar is active and useBothWheelAxes option is
            // active, so let's scroll vertical bar using both mouse wheel axes
            if (deltaY) {
              $this.scrollTop($this.scrollTop() - (deltaY * settings.wheelSpeed));
            } else {
              $this.scrollTop($this.scrollTop() + (deltaX * settings.wheelSpeed));
            }
            shouldPrevent = true;
          } else if (scrollbarXActive && !scrollbarYActive) {
            // useBothWheelAxes and only horizontal bar is active, so use both
            // wheel axes for horizontal bar
            if (deltaX) {
              $this.scrollLeft($this.scrollLeft() + (deltaX * settings.wheelSpeed));
            } else {
              $this.scrollLeft($this.scrollLeft() - (deltaY * settings.wheelSpeed));
            }
            shouldPrevent = true;
          }
          // update bar position
          updateBarSizeAndPosition();
          shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
          if (shouldPrevent) {
            e.stopPropagation();
            e.preventDefault();
          }
        });
        // fix Firefox scroll problem
        $this.bind('MozMousePixelScroll' + eventClassName, function (e) {
          if (shouldPrevent) {
            e.preventDefault();
          }
        });
      };
      var bindRailClickHandler = function () {
        var stopPropagation = function (e) { e.stopPropagation(); };
        $scrollbarY.bind('click' + eventClassName, stopPropagation);
        $scrollbarYRail.bind('click' + eventClassName, function (e) {
          var halfOfScrollbarLength = parseInt(scrollbarYHeight / 2, 10),
              positionTop = e.pageY - $scrollbarYRail.offset().top - halfOfScrollbarLength,
              maxPositionTop = containerHeight - scrollbarYHeight,
              positionRatio = positionTop / maxPositionTop;
          if (positionRatio < 0) {
            positionRatio = 0;
          } else if (positionRatio > 1) {
            positionRatio = 1;
          }
          $this.scrollTop((contentHeight - containerHeight) * positionRatio);
        });
      };
      // bind mobile touch handler
      var bindMobileTouchHandler = function () {
        var applyTouchMove = function (differenceX, differenceY) {
          $this.scrollTop($this.scrollTop() - differenceY);
          $this.scrollLeft($this.scrollLeft() - differenceX);
          // update bar position
          updateBarSizeAndPosition();
        };
        var startCoords = {},
            startTime = 0,
            speed = {},
            breakingProcess = null,
            inGlobalTouch = false;
        $(window).bind("touchstart" + eventClassName, function (e) {
          inGlobalTouch = true;
        });
        $(window).bind("touchend" + eventClassName, function (e) {
          inGlobalTouch = false;
        });
        $this.bind("touchstart" + eventClassName, function (e) {
          var touch = e.originalEvent.targetTouches[0];
          startCoords.pageX = touch.pageX;
          startCoords.pageY = touch.pageY;
          startTime = (new Date()).getTime();
          if (breakingProcess !== null) {
            clearInterval(breakingProcess);
          }
          e.stopPropagation();
        });
        $this.bind("touchmove" + eventClassName, function (e) {
          if (!inGlobalTouch && e.originalEvent.targetTouches.length === 1) {
            var touch = e.originalEvent.targetTouches[0];
            var currentCoords = {};
            currentCoords.pageX = touch.pageX;
            currentCoords.pageY = touch.pageY;
            var differenceX = currentCoords.pageX - startCoords.pageX,
              differenceY = currentCoords.pageY - startCoords.pageY;
            applyTouchMove(differenceX, differenceY);
            startCoords = currentCoords;
            var currentTime = (new Date()).getTime();
            var timeGap = currentTime - startTime;
            if (timeGap > 0) {
              speed.x = differenceX / timeGap;
              speed.y = differenceY / timeGap;
              startTime = currentTime;
            }
            e.preventDefault();
          }
        });
        $this.bind("touchend" + eventClassName, function (e) {
          clearInterval(breakingProcess);
          breakingProcess = setInterval(function () {
            if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
              clearInterval(breakingProcess);
              return;
            }
            applyTouchMove(speed.x * 30, speed.y * 30);
            speed.x *= 0.8;
            speed.y *= 0.8;
          }, 10);
        });
      };
      var bindScrollHandler = function () {
        $this.bind('scroll' + eventClassName, function (e) {
          updateBarSizeAndPosition();
        });
      };
      var destroy = function () {
        $this.unbind(eventClassName);
        $(window).unbind(eventClassName);
        $(document).unbind(eventClassName);
        $this.data('contained-scroll', null);
        $this.data('contained-scroll-update', null);
        $this.data('contained-scroll-destroy', null);
        $scrollbarY.hide();
        $scrollbarYRail.hide();
        // clean all variables
        $scrollbarY =
        containerWidth =
        containerHeight =
        contentWidth =
        contentHeight =
        scrollbarYHeight =
        scrollbarYTop =
        scrollbarYRight = null;
      };
      var supportsTouch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
      var initialize = function () {
        updateBarSizeAndPosition();
        bindScrollHandler();
        bindMouseScrollYHandler();
        bindRailClickHandler();
        if (supportsTouch) {
          bindMobileTouchHandler();
        }
        if ($this.mousewheel) {
          bindMouseWheelHandler();
        }
        $this.data('contained-scroll', $this);
        $this.data('contained-scroll-update', updateBarSizeAndPosition);
        $this.data('contained-scroll-destroy', destroy);
      };
      // initialize
      initialize();
      return $this;
    });
  };
}));
