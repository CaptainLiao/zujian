function Matrix($el, options) {
    this.$el = $el;
    this.clientW = $(window).width();
    this.clientH = $(window).height();
    this.imgLen = 0;
    this.cur_x = 0;
    this.start_x = 0;
    // 差值: cur_x - start_x
    this.m = 0;

    this.params = $.extend({},{plus: 1.1, reduce: .9}, options);
    this.plus = this.params.plus;
    this.reduce = this.params.reduce;
    // 缩放初始值
    this.s = 1;
    this.flag = false;
}

Matrix.prototype.init = function () {

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
            clientWidth = _this.clientW,
            clientH = _this.clientH;

        index = $(this).index();

        $('body').append(mask).append(fui_pop);
        $('.fui-pop').append(fui_slider);

        if($imgs) {
            $imgs.each(function () {
                url = $(this).attr('src');
                li += ' <li class="fui-slider-item" style="width: '+clientWidth+'px;height:' +clientH+ 'px"><img src='+url+' alt=""></li>';
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
    var 
        _this = this,
        $slider =  $('.fui-slider'),
        clientW = this.clientW,
        imgLen = this.imgLen;

    $slider.on('touchstart', '.fui-slider-item', function (e) {
        var 
            index = $(this).index(),
            m = _this.m,
            left = parseInt($slider.css('left'));

        _this.start_x = e.originalEvent.touches[0].clientX;

        if(_this.flag) return;
        _this.flag = true;

        // 对imgLen 取模，确定index的边界值
        index = index % imgLen;

        $(this).on('touchmove', function (e) {
            _this.cur_x = e.originalEvent.touches[0].clientX;
            m = _this.cur_x - _this.start_x;

            // 滑动距离大于30px 才开始移动
            if(Math.abs(m) > 30) {
                if(index == 0 && m > 0 || index == imgLen - 1 && m < 0) {
                    if(_this.s == 1) {
                        m *= .4;
                    }
                }

                $slider.css('left', left+m+'px');
            }
        });

        $(this).on('touchend', function (e) {
            _this.flag = false;

            if(Math.abs(m) < clientW / 3){
                $slider.css('left', left +'px');
                return;
            }

             // 每次touchend的时候，将缩放值初始化
            _this.s = 1;

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

            $slider.find('img').css({
                    'z-index': 0,
                    'transform': 'scale(1)',
                    'transform-origin': '0% 0%'
                })
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

        // 缩放最大、最小值
        if(_this.s > 2) _this.s = 2;
        if(_this.s < .5) _this.s = .5;

        p_x = (oEvent.clientX / $(window).width()) * 100;
        p_y = (oEvent.clientY / $(window).height()) *100 ;

        $(this).find('img').css({
            'transform': 'scale('+_this.s+')',
            'z-index': 9999,
            'transform-origin':p_x+'% '+p_y+'%',
            '-webkit-transform-origin': p_x+'% '+p_y+'%'
        });
    })
};

$.fn.zoom = function (options, cb) {
    var zoom = new Matrix(this, options, cb);
    return zoom.chooseImg();
};