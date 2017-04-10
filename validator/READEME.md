### 使用说明

该插件依赖于1.8.0以上的jQuery版本，支持IE8+验证，根据表单的name字段进行验证，所以，必须明确指定要验证表单的name值（参考上面的validator.html）。

1、该插件默认开启6项验证：用户名，密码，确认密码，手机，邮箱，验证码

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