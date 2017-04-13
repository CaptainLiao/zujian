(function (window, $, undefined) {
    /**
     *  @param  {String}        $el             表单元素
     *  @param  {[Array]}       rules           自定义验证规则
     *  @param  {[Boolean]}     isCheckAll      表单提交前全文验证
     *  @param  {[Function]}    callback        全部验证成功后的回调
     *  rules 支持四个字段：name, rule, message, equalTo
     */
    function Validator($el, rules, isCheckAll, callback) {
        var required = 'required';
        var params = Array.prototype.slice.call(arguments);
        this.$el = $el;
        this._rules = [
            {// 用户名
                username: required,
                rule: /^[\u4e00-\u9fa5\w]{6,12}$/,
                message: '不能包含敏感字符'
            }, {// 密码
                password: required,
                rule: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@]{6,20}$/,
                message: '只支持数字字母下划线,且不为纯数字或字母'
            }, {// 重复密码
                password2: required,
                rule: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@]{6,20}$/,
                message: '只支持数字字母下划线,且不为纯数字或字母',
                equalTo: 'password'
            }, {// 手机
                mobile: required,
                rule: /^1[34578]\d{9}$/,
                message: '请输入有效的手机号码'
            }, {// 验证码
                code : required,
                rule: /^\d{6}$/,
                message: '请输入6位数字验证码'
            }, {// 邮箱
                email : required,
                rule: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                message: '请输入正确的邮箱'
            }
        ];
        this.isCheckAll = false;
        this.callback = callback;
        // 合并参数
        this._rules = this._rules.concat(params[1]);
        if(params[2]) {
            if(typeof params[2] == 'function') {
                this.callback = params[2];
            }else {// 提交表单时是否开启全部验证
                this.isCheckAll = params[2];
            }
        }
        // 用于存储合去重后的参数
        this.rules = [];
    }

    Validator.prototype._getKey = function (obj) {
        var k = '';
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                if( key !== 'rule' && key !== 'message' && key !== 'equalTo') {
                    k = key;
                }
            }
        }
        return k;
    };
    /**
     * 数组对象重复数据进行合并，后面的覆盖前面的
     */
    Validator.prototype.filterRules = function (arrObj) {
        var _this = this,
            h = {},
            res = [],
            arrObject = this._rules;
        $.each(arrObject, function (i, item) {
            var k = _this._getKey(item);
            try {
                if(!h[k] && h[k] !== 0) {
                    h[k] = i;
                    res.push(item);
                }else {
                    res[h[k]] = $.extend(res[h[k]], item);
                }
            }catch(e) {
                throw new Error('不是必填')
            }
        });
        this.rules = res;
        console.log(this.rules)
    };

    Validator.prototype.check = function () {
        var _this = this;
        $.each(_this.rules, function (i, item) {
            var key = _this._getKey(item),
                reg = item.rule,
                equalTo = item.equalTo,
                errMsg = item.message;

            _this.$el.find('[name='+key+']')
                .on('blur', function () {
                    var $this = $(this),
                        errorMsg = '',
                        val = $this.val(),
                        ranges = reg.toString().match(/(\d*,\d*)/),
                        range = '',
                        min = 0,
                        max = 0,
                        placeholderTxt = $(this).attr("placeholder") ? $(this).attr("placeholder") : '信息';

                    // 定义错误提示信息
                    if(val && val != 'undefined') { // 值不为空

                        if(ranges) { // 边界限定
                            range = ranges[0];
                            min = range.split(',')[0] ? range.split(',')[0].trim() : 0;
                            max = range.split(',')[1] ? range.split(',')[1].trim() : 0;
                            if(val.length < min || val.length > max) { // 处理边界限定的情况
                                if(min && max) {
                                    errorMsg = '<span class="error-msg">请输入'+min+'-'+max+'位'+placeholderTxt+'</span>';
                                }else if(min) {
                                    errorMsg = '<span class="error-msg">最少输入'+min+'位'+placeholderTxt+'</span>';
                                }else if(max) {
                                    errorMsg = '<span class="error-msg">最多输入'+max+'位'+placeholderTxt+'</span>';
                                }
                            }else { // 边界正确但匹配错误
                                errorMsg = '<span class="error-msg">'+errMsg+'</span>';

                            }
                        }else { // 没有边界限定
                            errorMsg = '<span class="error-msg">'+errMsg+'</span>';
                        }

                        if(equalTo) {
                            var equalToVal = _this.$el.find('[name='+equalTo+']').val();
                            if(val !== equalToVal) {
                                errorMsg = '<span class="error-msg">两次输入不一致，请重新输入</span>';
                            }
                        }

                    } else { // 值为空
                        // 不要求必填(required为空)，但对所填字段进行验证
                        if(item[key]) {
                            errorMsg = '<span class="error-msg">请输入'+placeholderTxt+'</span>'
                        }
                    }

                    if($('.error-msg').length > 0) return;

                    // 验证输入，显示提示信息
                    if(!reg.test(val) || (equalTo && val !== equalToVal)) {
                        if($this.siblings('.error-msg').length == 0) {
                            $this.after(errorMsg)
                                .siblings('.error-msg')
                                .hide()
                                .fadeIn();
                        }
                    }else {
                        $this.siblings('.error-msg').remove();
                    }
                })
                .on('focus', function () {
                    $(this).siblings('.error-msg').remove();
                })
        });

    };
    Validator.prototype.checkAll = function () {
        var _this = this;
        if(_this.isCheckAll) {
            _this.$el.find('[type=submit]')
                .click(function () {
                    _this.$el.find('[name]').trigger('blur');
                    if($('.error-msg').length > 0) {
                        console.log('有错误信息');
                        return false;
                    }else {
                        console.log('提交成功');
                        _this.callback();
                    }
                });
            return false;
        }
    };
    Validator.prototype.init = function () {
        this.filterRules();
        this.check();
        this.checkAll();
    };
    $.fn.validator = function (rules, isCheckAll, callback) {
        var validate = new Validator(this, rules, isCheckAll, callback);
        return validate.init();
    };
})(window, jQuery, undefined);