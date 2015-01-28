/*
 *  Project: Scroll Slide
 *  Description: Mousewheel based slideshow with support for internal animation
 *  Author: Michael Botelho
 *  License: MIT
 */

;(function ($, window, document, undefined) {

    //global variables
    var scrollSlide = "scrollSlide";
    var dataKey = "mdb_" + scrollSlide;
    var delay = 1200;
    var d;
    var child;
    var opts = {};
    var winHeight = $(window).height();
    var isAnim = true;
    var ease = (jQuery.easing['easeOutQuart']) ? 'easeOutQuart' : 'swing';
    var fx;
    var currEl;
    var nextEl;
    var prevEl;
    var half1;
    var half2;
    var backgroundUrl;

    //private methods
    var initSlides = function($this, i) {
        $this.addClass('fixed');
        $this.css({height: winHeight});
    };

    var hashController = function(delta) {

        if(isAnim) {
            setTimeout(function() {
                if (delta < 0) {
                    d = 'down';
                    setHash('down');
                }
                else {
                    d = 'up';
                    setHash('up');
                }
                isAnim = true;
            }, delay);
        }
        isAnim = false;
    };

    var wheel = function(event){

        var delta = 0;
        if (!event)
            event = window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta/120;
        } else if (event.detail) {
            delta = -event.detail/3;
        }
        if (delta)
            hashController(delta);
        if (event.preventDefault)
            event.preventDefault();
        event.returnValue = false;
    };

    var setHash = function( dir ) {
        var $sib = (dir === 'down') ? getSibling('next') : getSibling('prev');
        d = dir;
        if($sib.length > 0) {
            window.location.hash = '!/' + $sib.attr('id');
        }
    };

    var getSibling = function(direction) {
        var $curr = $('#' + window.location.hash.replace('#!/', ''));
        if(direction === 'next') {
            child = $curr.next(opts.sectionClass);
        }
        if(direction === 'prev') {
            child = $curr.prev(opts.sectionClass);
        }
        return child;
    };

    var animController = function() {
        var $curr = $('#' + window.location.hash.replace('#!/', ''));
        fx = $curr.data('transition');
        currEl = $curr;
        nextEl = (currEl.next()) ? currEl.next(opts.sectionClass) : '';
        prevEl = (currEl.prev()) ? currEl.prev(opts.sectionClass) : '';
        transition(fx);

    };

    var transition = function(fx) {
        var nextFx = nextEl.data('transition');
        var prevFx = prevEl.data('transition');
        if(d === 'up') {
            if(nextFx)
                transitionConfig[d][fx][nextFx]();
        }
        if(d === 'down') {
            if(prevFx)
                transitionConfig[d][fx][prevFx]();
        }
        if(!d) {
            setLandingCss();
        }
        childAnim();
    };

    var setLandingCss = function(){
        $(opts.sectionClass).css({zIndex:1});

        if(currEl.length > 0) {
            currEl.css({zIndex: 3, opacity: 1});
        }
        else {
            $($(opts.sectionClass)[0]).css({zIndex: 3, opacity: 1})
        }
    };

    var transitionConfig = {
        'up' : {
            'fade' :  {
                'fade' : function() {
                    fade('up');
                },
                'slideUp' : function() {
                    slideUp({zIndex: 3, top: 0},{top: '100%'});
                },
                'split' : function() {
                    splitHide('up');
                }
            },
            'slideUp' : {
                'fade' : function() {
                    slideUp({zIndex: 3, opacity: 1}, {opacity: 0});
                },
                'slideUp' : function() {
                    slideUp({zIndex: 3, top: 0}, {top: '100%'});
                },
                'split' : function() {
                    splitHide('up');
                }
            },
            'split' : {
                'fade' : function() {
                    splitShow('up');
                },
                'slideUp' : function() {
                    slideUp({zIndex: 3, top: 0}, {top: '100%'});
                },
                'split' : function() {
                    splitShow('up');
                }
            }
        },
        'down' : {
            'fade' :  {
                'fade' : function() {
                    fade('down');

                },
                'slideUp' : function() {
                    fade('down');

                },
                'split' : function() {
                    splitHide('down');
                }
            },
            'slideUp' : {
                'fade' : function() {
                    slideDown('prev');
                },
                'slideUp' : function() {
                    slideDown('prev');
                },
                'split' : function() {
                    slideUp({zIndex: 3, top: '100%'},{top: 0}, true);
                }
            },
            'split' : {
                'fade' : function() {
                    splitShow('down');
                },
                'slideUp' : function() {
                    splitShow('down');
                },
                'split' : function() {
                    splitShow('down');
                }
            }
        }
    };

    //animations
    var splitHide = function(dir) {
        $(opts.sectionClass).css({zIndex: 1});
        var Ell = (dir === 'down') ? prevEl : nextEl;
        split(Ell);
        currEl.css({zIndex: 2});
        Ell.css({zIndex: 3, backgroundImage : 'none'});
        half1.css({top: 0}).animate({top: '-100%'},{duration: opts.transitionDuration, easing: opts.easing, complete : function(){
            Ell.css({backgroundImage : backgroundUrl, zIndex: 2});
            currEl.css({zIndex: 3});
            half1.remove();
            half2.remove();
        }});
        half2.css({top : 0}).animate({top: '100%'},{duration: opts.transitionDuration, easing: opts.easing});

    };

    var splitShow = function(dir) {
        split(currEl);
        $(opts.sectionClass).css({zIndex: 1});
        var Ell = (dir === 'down') ? prevEl : nextEl;
        Ell.css({zIndex: 2});
        currEl.css({zIndex: 3, backgroundImage : 'none'});
        half1.animate({top: 0},{duration: opts.transitionDuration, easing: opts.easing, complete : function(){
            currEl.css({backgroundImage : backgroundUrl});
            half1.remove();
            half2.remove();

        }});
        half2.animate({top: 0},{duration: opts.transitionDuration, easing: opts.easing});
    };


    var split = function(el) {
        half1 = $('<div class="half"></section>');
        half2= $('<div class="half"></section>');
        backgroundUrl  = el.css('backgroundImage');
        half1.css({backgroundImage : backgroundUrl, backgroundPosition : 'left center', top: '-100%'});
        half2.css({backgroundImage : backgroundUrl, backgroundPosition : 'right center', top: '100%'});
        el.prepend(half1, half2);

    };

    var fade = function(dir) {
        $(opts.sectionClass).css({zIndex: 1});
        var Ell = (dir === 'up') ? nextEl : prevEl;
        Ell.css({zIndex: 2});
        currEl.css({opacity: 0, zIndex: 3}).animate({opacity: 1}, {duration: opts.transitionDuration, easing: opts.easing});
    };

    var slideDown = function(sib) {
        $(opts.sectionClass).css({zIndex: 1});
        var Ell = (sib === 'next') ? nextEl : prevEl;
        Ell.css({zIndex: 2});
        currEl.css({zIndex: 3, top: '100%'}).animate({top: 0}, {duration: opts.transitionDuration, easing: opts.easing});
    };

    var slideUp = function(css, anim, split) {
        $(opts.sectionClass).css({zIndex: 1});
        var el1 = (split) ? prevEl : currEl;
        var el2 = (split) ? currEl : nextEl;
        el1.css({zIndex: 2});
        el2.css(css).animate(anim, {duration: opts.transitionDuration, easing: opts.easing, complete : function(){
            if(split) {
                el1.css({zIndex: 2});
                el2.css({zIndex: 3});
            }
            else {
                el1.css({zIndex: 3});
                el2.css({zIndex: 2});
            }
        }});
    };

    var childAnim = function() {
        var cssObjStart = {};
        var cssObjEnd = {};

        var animChildren = currEl.children('.anim');
        $(opts.sectionClass).children('.anim').css({visibility: 'hidden', position: 'absolute'});

        if(animChildren.length > 0) {
            animChildren.each(function(){
                var $this = $(this);

                var duration = ($this.data('duration')) ? parseInt($this.data('duration')) : 800;
                var del = ($this.data('delay')) ? $this.data('delay') : 0;

                var startCss = cleanArray($this.data('start').replace(/\s+/g, '').split(';'));
                var endCss = cleanArray($this.data('end').replace(/\s+/g, '').split(';'));

                if(startCss.length === endCss.length) {

                    cssObjStart = arrayToCssObject(startCss);
                    cssObjEnd = arrayToCssObject(endCss);
                    cssObjStart.visibility = 'visible';
                    $this.css(cssObjStart);
                    $this.delay(del).animate(cssObjEnd, {duration: duration, easing: opts.easing});

                    cssObjEnd = {};
                    cssObjStart = {};
                }
                else {
                    console.log('your in & out attributes for the element at position '+($this.index() + 1 )+' must match');
                }
            });
        }
    };

    var arrayToCssObject = function(arr) {
        var outObj = {};
        for(var i=0; i < arr.length; i++) {
            var rule = arr[i].split(':');
            outObj[rule[0]] = rule[1];
        }
        return outObj;
    };

    var cleanArray = function(arr) {
        return $.map( arr, function(v){
            return v === "" ? null : v;
        });
    };

    var getCurrSlide = function() {
            return currEl;


    };

    var ScrollSlide = function (element, options) {
        this.element = element;

        // default options
        this.options = {
            sectionClass : '.section',
            transitionDuration : 800,
            easing : ease
        };

        /*
         * Initialization
         */

        this.init(options);
    };

    ScrollSlide.prototype = {
        init: function (options) {
            opts = $.extend(this.options, options);

            //find child elements
            child = this.element.children(this.options.sectionClass);

            var initId = $(child[0]).attr('id');
            var initHash = window.location.hash;
            if(!initHash) {
                window.location.hash = '!/' + initId;
            }

            //set child .anim css at init
            $(opts.sectionClass).children('.anim').css({visibility: 'hidden', position: 'absolute', zIndex: 10});

            //initialize each slide
            child.each(function(i){
                initSlides($(this), i);
            });


            $(child[0]).css({zIndex: 2});


            //mousewheel listeners
            if (window.addEventListener) {
                window.addEventListener('DOMMouseScroll', wheel, false);
            }
            window.onmousewheel = document.onmousewheel = wheel;

            //hashchange
            animController();
            window.onhashchange = animController;

        },

        scroll : function ( dir ) {
            setHash(dir);
        },

        currSlide : function() {
           return getCurrSlide();
        }
    };


    $.fn[scrollSlide] = function (options) {

        var plugin = this.data(dataKey);

        if (plugin instanceof ScrollSlide) {
            if (typeof options !== 'undefined') {
                plugin.init(options);
            }
        } else {
            plugin = new ScrollSlide(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };

}(jQuery, window, document));

