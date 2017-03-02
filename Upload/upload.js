!function(window, $, undefined) {
    function Uploader(el, opts, callback) {
        this.submitBtn = $(el);
        this.n = 0;
        this.images = [];
        this.defaults = {
            debug: false,
            maxLen: 6,
            maxSize: 6,
            maxWidth: 1000,
            quality: .8
        };
        this.options = $.extend({}, this.defaults, opts);
        // 成功后的回调
        this.callback = callback;
    }
    Uploader.prototype._tips = function (msg) {
        alert(msg)
    };
    Uploader.prototype.change = function () {
        var _this = this,
            uploadInput = document.getElementById('uploadInput');
        uploadInput.addEventListener('change', function () {
            // 使用jquery 取不到files
            var files = this.files,
                len = files.length,
                maxLen = _this.options.maxLen;
            console.log(len);
            if(len == 0) return;
            if(len > maxLen || $('.fui-upload_file').length > maxLen-1 || _this.images.length > 6) {
                _this._tips('不能超过'+maxLen+'个图片');
                return;
            }
            // 遍历files，显示缩略图
            var li = '';
            Array.prototype.forEach.call(files, function (file) {
                // 得到图片地址（blob对象）
                var url = window.URL.createObjectURL(file);
                var type = file.type;
                var maxSize = _this.options.maxSize;
                if(file.size > maxSize*1024*1024){
                    _this._tips('单张图片不能超过'+maxSize+'M');
                    return;
                }
                ++_this.n;
                if(_this.n > maxLen) {
                    _this.n = maxLen;
                    return;
                }
                li +='<li class="fui-upload_file"><img src='+url+' alt='+file.name+'><span class="iconfont-fui fui-icon-close">&#xe60d;</span></li>';
                _this.compress(file, type);
            });
            // 显示缩略图
            $('.fui-upload_files').append(li);
            // 删除图片
            _this.del();
        });
        return this;
    };
    Uploader.prototype.del = function () {
        var _this = this;
        $('.fui-upload_files').on('click', '.fui-icon-close',function () {
            // 首先移除当前li标签（表面删除）
            $(this).parent().remove();
            // 通过图片名字判断删除（彻底删除）
            var name = $(this).siblings().attr('alt');
            _this.images.forEach(function (blob,index,arr) {
                if(blob.name == name) {
                    arr.splice(index,1);
                    --_this.n;
                }
            });
        })
    };
    Uploader.prototype.compress = function (file, img_type) {
        var _this = this;
        createImageBitmap(file).then(function (imageBitmap) {
            var mimeType = "image/jpeg",
                max_w = _this.options.maxWidth,
                quality = _this.options.quality,
                c_w = '',
                c_h = '',
                i_w = imageBitmap.width,
                i_h = imageBitmap.height;
            if(img_type!=undefined && img_type=="image/png"){
                mimeType = "image/png";
            }
            if(i_w > max_w || i_h > max_w) {    // 按照宽高最大的一边进行缩放
                if(i_w > i_h) {
                    c_w = max_w;
                    c_h = max_w * (i_h / i_w);
                }else {
                    c_h = max_w;
                    c_w = max_w * (i_w / i_h);
                }
            }else {     // 不缩放
                c_w = i_w;
                c_h = i_h;
            }
            var canvas = document.createElement('canvas');
            canvas.width = c_w;
            canvas.height = c_h;
            // 开始缩放
            canvas.getContext('2d').drawImage(imageBitmap, 0, 0, i_w, i_h, 0, 0, c_w, c_h);
            // 处理图片质量
            canvas.toBlob(function (blob) {
                blob.name = file.name;
                _this.images.push(blob);
            }, mimeType, quality);
        });
    };
    Uploader.prototype.submitClick = function (url, param) {
        var _this = this,
            fd = new FormData(document.getElementById('uploadForm')),
            images = this.images,
            params = param,
            apiURL = url,
            debug = this.options.debug,
            callback = this.callback;

        if(images.length>0) {
            images.forEach(function (img) {
                fd.append('images', img)
            })
        }else {
            _this._tips('请选择图片后上传！');
            return;
        }
        if(!apiURL) return;
        if(params && params instanceof Object && Object.keys(params).length> 0) {
            for(var key in params) {
                if(Object.prototype.hasOwnProperty.call(params, key)) {
                    fd.append(key, params[key]);
                }
            }
        }
        $.ajax({
            url: apiURL,
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            beforeSend: function (xhr) {
                $('[type="submit"]').prop('disabled', true)
            },
            complete: function (res) {
                $('[type="submit"]').prop('disabled', false);
                if(debug) console.log(res.responseJSON);
                callback && callback instanceof Function && callback(res);
            }
        })
    };
    /**
     * submit 必填参数
     *@param    {String}    url     上传服务器地址
     *@param    {Object}    params    上传参数
     */
    Uploader.prototype.submit = function (url, params) {
        var _this = this;
        this.submitBtn.on('click', function (e) {
            console.log('aaa');
            _this.submitClick(url, params);
            e.preventDefault();
        });
        return this;
    };

    /**
     * @param   {Object}    opts    可选参数
     *
     * opts: {
     *      debug: false,   默认关闭
     *      maxLen: 6,      最多上传图片数量
     *      maxSize: 4, 最大上传图片尺寸(M)
     *      maxWidth: 1000,     输出的最大分辨率
     *      quality: .8,    输出图片的质量[0-1]
     * }
     */
    $.fn.upload = function (opts, callback) {
        console.log(this);
        var uploader = new Uploader(this, opts, callback);
        return uploader.change();

    }
}(window, jQuery);