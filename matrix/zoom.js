;!(function (window, $, undefined) {
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

            //_this.touchSlide();

            //_this.scale();
            _this.touchToScale();

            _this.closeImg();
        })
    };
    Matrix.prototype.closeImg = function () {
        var _this = this;

        $('.fui-slider-item').on('click', function (e) {
            console.log('aa')
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

    Matrix.prototype.slideMove = function (context ,e) {

        var
            $this = context,
            _this = this,
            $slider =  $('.fui-slider'),
            clientW = this.clientW,
            imgLen = this.imgLen;
        var
            index = $this.index(),
            m = _this.m,
            left = parseInt($slider.css('left'));

        console.log(index)

        _this.start_x = e.originalEvent.touches[0].clientX;

        if(_this.flag) return;
        _this.flag = true;

        // 对imgLen 取模，确定index的边界值
        index = index % imgLen;

        $this.on('touchmove', function (e) {

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

        $this.on('touchend', function (e) {
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
    };

    Matrix.prototype.touchToScale = function () {
        var _this = this;

        $('.fui-slider').on('touchstart','.fui-slider-item', function(e) {

            console.log(e)
            var
                clientW = _this.clientW,
                oEvent = e.originalEvent,
                touches = oEvent.touches,
                start_x1 = 0,
                start_x2 = 0,
                m_x = 0,
                n_x = 0,
                center_x = 0,
                center_y = 0,
                delta = oEvent.wheelDelta || -oEvent.delta;

            if(touches.length <2){
                _this.slideMove($(this), e);
            }else {
                touches.length = 2;

                start_x1 = touches[0].clientX;
                start_x2 = touches[1].clientX;
                start_y1 = touches[0].clientY;
                start_y2 = touches[1].clientY;

                center_x = start_x1 + (start_x2 - start_x1)/2;
                center_y = start_y1 + (start_y2 - start_y1)/2;
                m_x = Math.abs(start_x1 - start_x2);

                $(this).on('touchmove', function (e) {
                    var
                        oEvent = e.originalEvent,
                        touches = oEvent.touches,
                        move_x1 = 0,
                        move_x2 = 0;

                    if(touches.length <2){
                        return false;
                    }else {
                        touches.length = 2;
                    }

                    move_x1 = touches[0].clientX;
                    move_x2 = touches[1].clientX;

                    n_x = Math.abs(move_x1 - move_x2);
                });

                $(this).on('touchend', function (e) {
                    var
                        oEvent = e.originalEvent,
                        touches = oEvent.touches,
                        move_x1 = 0,
                        move_x2 = 0;

                    if(touches.length <2){

                    }else {
                        touches.length = 2;
                    }

                    move_x1 = touches[0].clientX;
                    move_x2 = touches[1].clientX;

                    n_x = Math.abs(move_x1 - move_x2);
                });

                if(m_x > n_x) {
                    _this.s = 1- (Math.abs(m_x-n_x)/2)/clientW;
                }else {
                    _this.s = 1+ (Math.abs(m_x-n_x)/2)/clientW;
                }

                $(this).css({
                    'transform': 'scale('+_this.s+')',
                    'z-index': 9999,
                    'transform-origin':center_x+'% '+center_y+'%',
                    '-webkit-transform-origin': center_x+'% '+center_y+'%'
                });
            }


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
})(window, jQuery);