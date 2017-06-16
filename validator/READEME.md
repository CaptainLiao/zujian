## validator2.js 使用说明

之前已经写过一个表单验证插件了，为什么还会重复造轮子呢？第一个问题是代码结构比较乱，虽然通过原型继承的写法将处理分层，但业务逻辑和数据结构混杂在一起，
导致第二个问题——可扩展性和灵活性差。

认真分析表单验证的过程，可以分为两步：怎么验证和如何验证。怎么验证是数据层面的问题，如何验证是业务逻辑层面的问题。

点击：[这里](https://github.com/CaptainLiao/zujian/tree/master/validator) 查看源码

### 策略模式将对象和规则区分

如何让算法（数据层）和对象（逻辑层）分开来，使得算法可以独立于使用它的客户而变化？这里引入策略模式。

**什么是策略模式**

定义一系列的算法,把每一个算法封装起来, 并且使它们可相互替换。本模式使得算法可独立于使用它的客户而变化。

即：策略模式把对象本身和运算规则区分开来，其功能非常强大，因为这个设计模式本身的核心思想就是面向对象编程的多形性的思想。

关于策略模式的更多定义，[参见](http://blog.csdn.net/hguisu/article/details/7558249/)

下面我们就开始运用策略模式来解决代码分层问题。

### 理想中的插件调用

在开始代码之前，我们希望用更简单的方式调用插件。

````
    // 获取表单form元素
    var form = document.getElementById('myForm');

    // 创建表单校验实例
    var validation = new FormValidator();
    // 编写校验配置
    validation.add(form.username, 'isEmpty', '用户名不能为空s');
    validation.add(form.password, 'minLength: 6', '密码长度不能小于6个字符');
    validation.add(form.password2, 'isEqualTo: password', '密码不一致');
    validation.add(form.mobile, 'isMobile', '请填写正确的手机号');

    // 开始校验，并接收错误信息
    $('#submit-btn').click(function() {
        var errorMsg = validation.start();

        // 如果有错误信息输出，说明校验未通过
        if(errorMsg){
            console.log(errorMsg);
            return false;
        }
    })

````
**add()方法参数说明**

>   参数1：需要验证的表单项DOM元素，form[name属性]
>   参数2：验证方法，用冒号分割，冒号后的值为方法的参数（可选）
>   参数3：错误提示信息

### 编写验证函数

这一步，我们只编写验证的函数，即数据层

````
var VerifyPolicies = {
    isEmpty: function(value, errMsg) {
        if(value == '') return errMsg;
    },

    // 最小长度
    minLength: function(value, length, errMsg) {
        if (value.length < length) return errMsg;
    },
    // 手机号码
    isMobile: function(value, errMsg) {
        if(!/^1[34578]\d{9}$/.test(value)) return errMsg;
    },
    // 是否相等
    isEqualTo: function (value, toDom, errMsg) {
        var toValue = document.getElementById(toDom).value;

        if(value !== toValue) return errMsg;
    }
};

````
### 编写验证逻辑

````
function FormValidator(VerifyPolicy) {
    this.verifyPolicies = VerifyPolicy ? VerifyPolicy : VerifyPolicies;
    // 待执行的验证函数数组
    this.validateFn = [];
}


FormValidator.prototype.add = function(dom, rules, errMsg) {
    var _this = this;

    this.validateFn.push(function() {
        var args = [];
        var rule = rules.split(':');
        var ruleName = rule[0];
        var ruleParam = rule[1];
        var value = dom.value;

        args.push(value);
        if(ruleParam) args.push(ruleParam.trim());
        args.push(errMsg);

        // 这里调用apply只是为了传参，如果支持ES6，也可以这样做：
        // return _this.verifyPolicies[ruleName](...args)
        return _this.verifyPolicies[ruleName].apply(null, args);
    })
};

FormValidator.prototype.start = function() {
    for(var i =0; ; i++) {
        var msg = this.validateFn[i]();
        if(msg) return msg;
    }
};

````
至此，整个表单验证已经初步完成，在此方法之上，可以随意添加方法了。

## validator使用说明

该插件依赖于1.8.0以上的jQuery版本，支持IE8+验证，根据表单的name字段进行验证，所以，必须明确指定要验证表单的name值（参考上面的validator.html）。

### 如何使用？

首先在页面一次引入jQuery.js, validator.js, 然后选择表单元素开启验证。

````
<script src="../jquery-1.8.3.min.js"></script>
<script src="validator.js"></script>
<script>
        $('form').validator(rules, true)
</script>
````

validator可选三个参数：

*   rules：      自定义验证规则
*   isCheckAll： 是否开启提交表单时全局验证
*   callback：   全部验证成功后的回调

### 其他说明

1、该插件默认开启6项验证：用户名，密码，确认密码，手机，邮箱，验证码，支持表单提交时全局验证

2、你完全可以自定义验证规则，使用如下：

````
[
        {// 用户名
            username: 'required',
            rule: /^[\u4e00-\u9fa5\d]{6,12}$/,
            message: '只支持数字loo2222'
        },
        {// 密码
            password: 'required',
            rule: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@]{6,20}$/,
            message: 'mimmimmia'
        },
        {// 重复密码
            password2: 'required',
            rule: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@]{6,20}$/,
            message: '只支持数字字母下划线,不能为纯数字或字母2222',
            equalTo: 'password'
        },
        {// 座机
            telephone : 'required',
            rule: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,
            message: '请输入正确的座机'
        }
    ]

````
3、纯JS无ui（更灵活，或许会考虑加入默认UI）