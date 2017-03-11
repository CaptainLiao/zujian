!function(window, $, undefined) {
    /**
     * @param   {String}    el       必填  挂载元素
     * @param   {String}    url      必填  上传服务器地址
     * @param   {Object}    opts     可选  参数
     * @param   {Function}  callback 可选  上传成功的回调（ajax）
     *
     * opts: {
     *      debug: false,   默认关闭
     *      maxLen: 6,      最多上传图片数量
     *      maxSize: 4, 最大上传图片尺寸(M)
     *      maxWidth: 1000,     输出的最大分辨率
     *      quality: .8,    输出图片的质量[0-1]
     * }
     */
     function Uploader($el, url, opts, callback) {
        this.$el = $el;
        this.url = url;
         this.images = [];
        // 图片个数
        this.n = 0;
        // 文件大小总数
        this.fileSize = 0;
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
    Uploader.prototype.showUpload = function () {
        var _this =this;
        this.$el.on('click', function() {
            var mask ='<div class="fui-mask"></div>';
            var upload = '<div class="fui-upload_box">'+
                            '<div class="fui-upload_choose">'+
                                '<div class="fui-upload_input-box">'+
                                    '<div>点击选择文件</div>'+
                                    '<input id="uploadInput" class="fui-upload_input" type="file" multiple accept="image/jpeg,image/jpg,image/png">'+
                                '</div>'+
                            '</div>'+
                            '<div class="fui-upload_status-bar clearfix">'+
                                '<div class="fui-upload_info fl">选中 0 个文件，共 0 M</div>'+
                                '<div class="fui-upload_btn fr">'+
                                    '<button class="fui-upload_add" type="button">继续添加</button>'+
                                    '<button class="fui-upload_submit" type="button">点击上传</button>'+
                                '</div>'+
                            '</div>'+
                            '<ul class="fui-upload_preview clearfix">'+

                            '</ul>'+
                        '</div>';
            $('body').append(mask).append(upload); 

            _this.change();

            //submit
            $('.fui-upload_submit').click(function() {
                _this.submit(_this.url, {});
            })         
        })
    };
    /**
     * <input> 的change事件
     */
     Uploader.prototype.change = function (ev) {
        var _this = this,
        uploadInput = document.getElementById('uploadInput');
        uploadInput.addEventListener('change', function (ev) {
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
                console.log(file.size)
                console.log(file)
                _this.fileSize +=file.size;
                if(file.size > maxSize*1024*1024){
                    _this._tips('单张图片不能超过'+maxSize+'M');
                    return;
                }
                ++_this.n;
                if(_this.n > maxLen) {
                    _this.n = maxLen;
                    return;
                }
                li +='<li class="fui-upload_preview_item"> <img src='+url+' alt=""></li>';

                _this.compress(file, type);
            });

            // 显示缩略图
            $('.fui-upload_preview').append(li);

            // 删除图片
            _this.del();
            console.log(_this.n)
            console.log(_this.fileSize)
            $('.fui-upload_info').text('选中 '+ _this.n+' 个文件，共 '+(_this.fileSize/1024/1024).toFixed(2)+' M')
        });

        return this;
    };
    Uploader.prototype.del = function () {
        var _this = this;
        $('.fui-upload_files').on('click', '.fui-icon-close',function () {
            // 首先移除当前li标签（表面删除）
            var $this = $(this);
            _this.timer = null;
            $this.parent().fadeOut(300);
            _this.timer = setTimeout(function () {
                $this.parent().remove()
            },300);
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
    /**
     *必填参数：
     *@param    {String}    url     上传服务器地址
     *@param    {Object}    param    上传参数
     */
     Uploader.prototype.submit = function (url, param) {
        var _this = this,
        fd = new FormData(document.getElementById('uploadForm')),
        images = this.images,
        submitBtn = this.submitBtn,
        params = param,
        apiURL = url,
        debug = this.options.debug,
        callback = this.callback;
        console.log(param);
        console.log(images);
        if(images.length>0) {
            images.forEach(function (img) {
                fd.append('images', img)
            })
        }else {
            _this._tips('请选择图片后上传！');
            return;
        }
        if(params) {
            if(params instanceof Object && Object.keys(params).length> 0) {
                for(var key in params) {
                    if(Object.prototype.hasOwnProperty.call(params, key)) {
                        fd.append(key, params[key]);
                    }
                }
            }
        }else {
            _this._tips('上传参数为空！');
            return;
        }
        if(!apiURL) {
            _this._tips('上传url参数不能为空！');
            return;
        }

        $('.fui-upload-progressbar').show();
        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", updateProgress);
        xhr.upload.addEventListener("load", transferComplete);
        xhr.upload.addEventListener("error", transferFailed);
        xhr.upload.addEventListener("abort", transferCanceled);

        xhr.open('POST', apiURL, true);
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.send(fd);

        function updateProgress(evt) {
            console.log(evt)
            if (evt.lengthComputable) {
                console.log(evt.loaded);
                var percentComplete = evt.loaded / evt.total;
                $('.fui-progress-line1').width(percentComplete*100+'%');
            } else {
                alert('你的浏览器版本太低，不支持进度条！');
            }
        }
        function transferComplete(evt) {
            _this.timer = null;
            _this.timer = setTimeout(function () {
                $('.fui-upload-progressbar').fadeOut();
            }, 500)
            _this._tips('upload completed')
        }
        function transferFailed(evt) {
            alert("An error occurred while transferring the file.");
        }
        function transferCanceled(evt) {
            alert("The transfer has been canceled by the user.");
        }
        // $.ajax({
        //     url: apiURL,
        //     type: 'POST',
        //     data: fd,
        //     processData: false,
        //     contentType: false,
        //     beforeSend: function (xhr) {
        //         //$('[type="submit"]').prop('disabled', true)
        //         submitBtn.prop('disabled', true)
        //     },
        //     complete: function (res) {
        //         submitBtn.prop('disabled', false);
        //         if(debug) console.log(res.responseJSON);
        //         callback && callback instanceof Function && callback(res);
        //     }
        // })
    };

    var uploader = '';
    $.fn.upload = function (url, opts, callback) {
        console.log(this);
        uploader = new Uploader(this, url, opts, callback);
        return uploader.showUpload();

    };
    $.fn.submit = function (url, opts) {
        return uploader.submit(url, opts);
    }
}(window, jQuery);