;!function ($) {
    "use strict";
    var PTR = function (ele) {
        this.container = $(ele);
        this.container.addClass('pull-to-refresh');
        this.distance = 60; // 设置参考的下拉位移
        this.attachEvent();
    };
    // 判断是否有touch事件发生
    var isTouch = (function () {
        var isSupportTouch = !!'ontouchstart' in document || window.documentTouch;
        return isSupportTouch;
    })();
    var touchEvents = {
        start: isTouch ? 'touchstart': 'mousedown',
        move: isTouch ? 'touchmove':'mousemove',
        end: isTouch ? 'touchend': 'mouseup'
    };
    // 获取事件发生时相对于文档的距离（含滚动距离）
    function getTouchPosition(e) {
         var e = e.orinalEvent || e;
         console.log(e)
         if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
             return {
                 x: e.targetTouches[0].pageX,
                 y: e.targetTouches[0].pageY
             }
         }else {
             return {
                 x: e.pageX,
                 y: e.pageY
             }
         }
    };
    PTR.prototype.touchStart = function (e) {
        var p = getTouchPosition(e);
        this.start = p;
        this.diffX = this.diffY = 0;
    };
    PTR.prototype.touchMove = function (e) {
        if(this.container.hasClass('refreshing')) return;
        if(!this.start) return false;
        var p = getTouchPosition(e);
        this.diffX = p.x - this.start.x;
        this.diffY = p.y - this.start.y;
        if(this.diffY < 0) return;
        this.container.addClass('touching');
        e.preventDefault();
        e.stopPropagation();
        // 设置container的位移小于页面滚动的距离，给人一种用力下拉的错觉，提升用户体验
        this.diffY = Math.pow(this.diffY, .8);
        this.container.css('transform', 'translate3d(0,'+ this.diffY +'px, 0)');
        if(this.diffY < this.distance) {
            this.container.removeClass('pull-up').addClass('pull-down')
        }else {
            this.container.removeClass('pull-down').addClass('pull-up')
        }
    };
    PTR.prototype.touchEnd = function (e) {
        var _this = this;
        this.start = false;
        this.container.removeClass('pull-down');
        this.container.removeClass('pull-up');
        this.container.removeClass('touching');
        this.container.css('transform','');
        if(this.diffY >= this.distance) {
            this.container.addClass('refreshing');
            this.container.trigger('pull-to-refresh')
        }
    };
    // 事件处理程序，通过$.proxy(fn, content)绑定执行函数的上下文。
    PTR.prototype.attachEvent = function () {
        var ele = this.container;
        ele.on(touchEvents.start, $.proxy(this.touchStart, this));
        ele.on(touchEvents.move, $.proxy(this.touchMove, this));
        ele.on(touchEvents.end, $.proxy(this.touchEnd, this));
    };
    // 实例化构造函数
    var pullToRefresh = function (ele) {
        new PTR(ele)
    };
    var pullToRefreshDone = function (ele) {
        $(ele).removeClass('refreshing');
    };
    // jQuery 插件编写的一般模式
    $.fn.pullToRefresh = function () {
        // return 是插件可链式调用
        // this 在这里是一个jQuery对象，相当于$(ele)。因为在即时执行函数作用域中，没必要用“$(this)”的方式来把this包裹到一个jQuery对象中，因为this本身已经是被包装好的jQuery对象。
        // this.each()使插件代码为多元素集合中的每个元素单独起作用
        return this.each(function () {
            pullToRefresh(this);
        })
    };
    $.fn.pullToRefreshDone = function () {
        return this.each(function () {
            pullToRefreshDone(this);
        })
    }

}(window.jQuery);