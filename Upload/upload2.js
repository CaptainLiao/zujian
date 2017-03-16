!function(window, $, undefined) {
    /**
     * @param   {String}    $el       必填  挂载元素
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
        var defaults = {
            debug: false,
            maxLen: 10,
            maxSize: 6,
            maxWidth: 5000,
            quality: 1
        };
        this.$el = $el;
        this.url = url;
        this.images = [];
        // 图片个数
        this.n = 0;
        // 文件大小总数
        this.fileSize = 0;

        this.options = $.extend({}, defaults, opts);
        // 成功后的回调
        this.callback = callback;
    }
    Uploader.prototype._tips = function (msg) {
        alert(msg)
    };

    Uploader.prototype.showUpload = function () {
        var _this =this;
        console.log($('.fui-mask').length>0)
        this.$el.on('click', function() {
            if(document.body.addEventListener == undefined) {
                alert('傻逼还在用IE');
                return false;
            }

            var mask ='<div class="fui-mask"></div>';
            var upload = '<div class="fui-upload_box">'+
                '<a class="fui-close iconfont">&#xe6ac;</a>'+
                '<div class="fui-upload_choose clearfix">'+
                '<div class="fui-upload_input-box fl">'+
                '<div>点击选择文件</div>'+
                '<input id="uploadInput" tabindex="-1" class="fui-upload_input" type="file" multiple accept="image/jpeg,image/jpg,image/png">'+
                '</div>'+
                '<div class="fui-upload_drag fl" id="fui-upload_drag"><span class="clearfix2"></span></div>'+
                '</div>'+
                '<div class="fui-upload_status-bar clearfix">'+
                '<div class="fui-upload_info fl">选中 0 个文件，共 0 M</div>'+
                '<div class="fui-upload_btn fr">'+
                '<a class="fui-upload_add" type="button">继续添加</a>'+
                '<a class="fui-upload_submit" type="button">点击上传</a>'+
                '</div>'+
                '</div>'+
                '<ul class="fui-upload_preview clearfix" id="fui-upload_preview">'+

                '</ul>'+
                '</div>';
            $('body').append(mask).append(upload);


            _this.change();

            if(document.body.addEventListener != undefined) {
                _this.dragImg();
            }else {
                alert('傻逼还在用IE')
            }


            //submit
            $('.fui-upload_submit').click(function() {
                _this.submit(_this.url, {});
            });

            // 继续添加
            $('.fui-upload_add').click(function () {
                $('#uploadInput').trigger('click');
            });

            _this.closeUpload();
        })
    };

    Uploader.prototype.dragImg = function () {
        var _this = this,
            dragBox = document.getElementById('fui-upload_drag');

        // 代码段一：很关键！如果没有这段代码且没有代码段二，drop事件的 e.preventDefault() 就失效了。
        // dragBox.addEventListener('dragover', function (e) {
        //     e.preventDefault();
        // }, false);

        dragBox.addEventListener('drop', function (e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            _this.previewImg(e.dataTransfer);
        }, false);

        // 代码段二：很关键！防止用户瞎比拖（通过浏览器预览图片）。
        //拖离
        document.addEventListener('dragleave',function(e){e.preventDefault();});
        //拖后放
        document.addEventListener('drop',function(e){e.preventDefault();});
        //拖进
        document.addEventListener('dragenter',function(e){e.preventDefault();});
        //拖来拖去
        document.addEventListener('dragover',function(e){e.preventDefault();});
    };
    /**
     * <input> 的change事件
     */
    Uploader.prototype.change = function (ev) {
        var _this = this,
            uploadInput = document.getElementById('uploadInput'),
            isIE = /ie/i.test(navigator.userAgent.toLowerCase()),
            isIE6 = /msie 6.0/i.test(navigator.userAgent.toLowerCase()),
            li = '';
        if(isIE) {
            //li += '<li class="fui-upload_preview_item" style="width: 80%;height: 240px;overflow: hidden"><img id="fui-upload_preview_item" style="width:100%"></li>';
            //document.getElementById('fui-upload_preview').innerHTML = li;
            console.log(uploadInput)
            var pic = document.getElementById('fui-upload_preview_item');
            uploadInput.onchange = function (ev) {
                uploadInput.select();
                console.log(1)
                var reallocalpath = document.selection.createRange().text;
                console.log(reallocalpath);
                pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + reallocalpath + "\")";
                // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
                pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            };

        }else {
            uploadInput.addEventListener('change', function (ev) {
                ev.preventDefault();
                _this.previewImg(this);
            });
        }
        return this;
    };
    /**
     * 暂不支持 IE10 以下浏览器预览
     * @param   {Object}    inputObj    选择或拖放图片的容器（需用原生JS获取）
     */
    Uploader.prototype.previewImg = function (inputObj) {
        // 使用jquery 取不到files
        var _this = this,
            files = inputObj.files,
            len = files.length,
            maxLen = _this.options.maxLen;

        console.log(len)
        if(len == 0) return;
        if(len > maxLen || $('.fui-upload_file').length > maxLen-1 || _this.images.length > maxLen) {
            _this._tips('不能超过'+maxLen+'个图片');
            return;
        }
        var li = '';
        Array.prototype.forEach.call(files, function (file) {

            // 得到图片地址（blob对象）（IE 10+）
            var
                url = window.URL.createObjectURL(file),
                type = file.type,
                maxSize = _this.options.maxSize;

            _this.fileSize +=file.size;
            if(file.size > maxSize*1024*1024){
                _this._tips('单张图片不能超过'+maxSize+'M');
                return;
            }
            ++_this.n;
            if(_this.n > maxLen) {
                _this.n = maxLen;
                _this._tips('图片总数不能超过'+maxLen +'张');
                return;
            }

            li +='<li class="fui-upload_preview_item"> <img src='+url+' alt='+file.name+'> <a class="fui-icon-del iconfont">&#xe63d;</a></li>';

            _this.compress(file, type);

        });

        // 显示缩略图
        $('.fui-upload_preview').append(li);

        // 删除图片
        _this.del();

        $('.fui-upload_info').text('选中 '+ _this.n+' 个文件，共 '+(_this.fileSize/1024/1024).toFixed(2)+' M')
    };

    Uploader.prototype.del = function () {
        var _this = this;
        $('.fui-upload_preview_item').hover(
            function () {
                var del = $(this).find('.fui-icon-del');
                del.stop().fadeIn();

            },
            function () {
                var del = $(this).find('.fui-icon-del');
                del.stop().fadeOut();

            });

        $('.fui-upload_box').on('click', '.fui-icon-del',function () {
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
            console.log(_this.images);
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

    Uploader.prototype.closeUpload = function () {
        $('.fui-mask').click(function () {
            $(this).remove();
            $('.fui-upload_box').remove();
        });

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