function Matrix($el, options) {
    this.$el = $el;
    this.clientW = $(window).width();
    this.imgLen = 0;
    this.cur_x = 0;
    this.start_x = 0;
    // 差值
    this.m = 0;

    this.params = $.extend({},{plus: 1.1, reduce: .9}, options);
    this.plus = this.params.plus;
    this.reduce = this.params.reduce;
    // 缩放初始值
    this.s = 1;
    this.flag = false;
}

Matrix.prototype.chooseImg = function () {
    var _this = this,
        $wrap  = this.$el;
    $wrap.on('click','img' ,function () {
        var mask = $('<div class="fui-mask"></div>'),
            fui_pop = $('<div class="fui-pop"></div>'),
            fui_slider = $('<ul class="fui-slider"></ul>'),
            index,
            $imgs = $wrap.find('img'),
            url = '',
            li = '',
            clientWidth = _this.clientW;

        index = $(this).index();

        $('body').append(mask).append(fui_pop);
        $('.fui-pop').append(fui_slider);

        if($imgs) {
            $imgs.each(function () {
                url = $(this).attr('src');
                li += ' <li class="fui-slider-item" style="width: '+clientWidth+'px"><img src='+url+' alt=""></li>';
                _this.imgLen++;
            });
            $('.fui-slider').append(li)
                .width(_this.imgLen * 100 +'%')
                .css('left', -index * clientWidth +'px');
        }else {
            alert('请选择图片@@');
            return
        }

        _this.touchSlide();
        _this.closeImg();
        _this.scale();
    })
};
Matrix.prototype.closeImg = function () {
    var _this = this;
    $('.fui-slider-item').on('click', function (e) {
        $('.fui-pop, .fui-mask').remove();
        _this.imgLen = 0;
    })
};
Matrix.prototype.touchSlide = function () {
    var _this = this,
        $slider =  $('.fui-slider'),
        clientW = this.clientW,
        imgLen = this.imgLen;

    $slider.on('touchstart', '.fui-slider-item', function (e) {
        var index = $(this).index(),
            m = _this.m,
            left = parseInt($slider.css('left'));
        _this.start_x = e.originalEvent.touches[0].clientX;

        if(_this.flag) return;
        _this.flag = true;

        $(this).on('touchmove', function (e) {
            _this.cur_x = e.originalEvent.touches[0].clientX;
            m = _this.cur_x - _this.start_x;
            if(Math.abs(m) > 50) {
                console.log(m);
                console.log(m);
                $slider
                    .css('left', left+m+'px')
                    .find('.fui-slider-item').css({
                    'transform': 'scale(1)',
                    'transform-origin': '0% 0%'
                });
            }
        });

        $(this).on('touchend', function (e) {
            _this.flag = false;
            // 每次touchend的时候，将缩放值初始化
            _this.s = 1;

            if(Math.abs(m) < clientW / 3){
                $slider.css('left', left+'px');
                return;
            }

            index = index % imgLen;

            if(index ==0){
                if(m > 0) {
                    $slider.css('left', left+'px');
                }else {
                    $slider.css('left', left-clientW+'px');
                }
            }else if(index < imgLen-1){
                if(m > 0) {
                    $slider.css('left', left+clientW+'px');
                }else {
                    $slider.css('left', left-clientW+'px');
                }

            }else{
                if(m < 0) {
                    $slider.css('left', left+'px');
                }else {
                    $slider.css('left', left+clientW+'px');
                }
            }

        });
    })
};

Matrix.prototype.scale = function() {
    var _this = this;

    $('.fui-slider').on('mousewheel','.fui-slider-item', function(e) {

        var
            oEvent = e.originalEvent,
            p_x = 0,
            p_y = 0,
            delta = oEvent.wheelDelta || -oEvent.delta;

        if(delta > 0) {
            _this.s *= _this.plus;
        }else {
            _this.s *= _this.reduce;
        }
     

        p_x = (oEvent.clientX / $(window).width()) * 100;
        p_y = (oEvent.clientY / $(window).height()) *100 ;

        $(this).css({
            'transform': 'scale('+_this.s+')',
            'transform-origin':p_x+'% '+p_y+'%',
            '-webkit-transform-origin': p_x+'% '+p_y+'%'
        });
    })
};

$.fn.zoom = function (options, cb) {
    var zoom = new Matrix(this, options, cb);
    return zoom.chooseImg();
};