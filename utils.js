
var utils = (function(){
    var fay = {};

    // 返回当前时间的毫秒数
    fay.getTime = Date.now() 
                  || function getTime() {return new Date().getTime();};

    // 对象复制
    fay.extend = function(target, obj) {
        if(obj && typeof obj !== 'object') return throw new Error(obj + 'is not object');
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
    };

    /*
     * 获取 url 的参数
     */
    fay.getUrlParams = function (url) {
        var url = url || location.search,
            params = {},
            route = '';
        if(url) {
            route = url.split("?")[1].split("&");
            route.forEach(function (item) {
                var item = item.split("=");
                if(item) {
                    params[item[0]] = item[1].replace(/(.*)([.|\#]$)/,"$1");
                }
            })
        }else {
            console.log('未找到参数!')
        }
        return params;
    };

    // 设置cookies
    fay.setCookie = function (name, value, time) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + time);
        document.cookie = name + "=" + encodeURIComponent(value)
            + ((time == null) ? "" : ";expires=" + exdate.toUTCString())+";path=/";
    };

    // 读取cookies
    fay.getCookie = function (c_name) {
        if (document.cookie.length>0)
        {
            c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1)
            {
                c_start=c_start + c_name.length+1;
                c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                return decodeURIComponent(document.cookie.substring(c_start,c_end))
            }
        }
        return ""
    };

    // 删除cookies
    fay.delCookie = function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cookieval = this.getCookie(name);
        if(cookieval)
            document.cookie = name +"="+ cookieval +";expires=" + exp.toUTCString();
    };

    /**
     * mergeArr 合并含有相同value对象元素的数组
     * @param {Array} arr   数组
     * @param {String} key  字段
     * @return {Object}
     *
     * @example
     * var arr = [{m:1,n:22}, {m:1,x:54}, {m:5,e:29},{m:5,k:9}]
     * this.mergeArr(arr, 'm')
     * {
     *  1:[{m:1,n:22},{m:1,x:54}],
     *  5:[{m:5,e:29},{m:5,k:9}]
     * }
     */
    fay.mergeArr = function (arr, key) {
        var obj = {};
        arr.forEach(function (item, index, arr) {
            var m = item[key];
            if(!obj[m]) {
                obj[m] = [item];
            }else {
                [].push.call(obj[m],item);
            }
        });
        return obj;
    };

        /**
     * mergeArr 合并含有相同value对象元素的数组
     * @param {Array} arr   数组
     * @return {Object}
     *
     * @example
     * var arr = [{1:2,8:0,3:5},{1:0,8:8,3:51}]
     * this.mergeArr(arr)
     * {
     *  {1:[2,0],3:[5,51],8:[0,8]}
     * }
     */
    fay.mergeArrByKey = function(arr) {
        var obj = {},
            result = [],
            key;
        arr.forEach(function (item, index, arr) {
            for(key in item) {
                if(!obj[key]){
                    obj[key] = [];
                    obj[key].push(item[key])
                }else{
                    obj[key].push(item[key])
                }
            }

        });
        for(var i in obj) {
            result.push(obj[i])
        }
        return result;
    };

    /**
     * by    对象数组排序
     *
     */
    fay.sortBy = function (name) {
        return function (o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    };

    /**
     * 将时间戳转化为标准时间格式
     *
     * */
    fay.switchTimestamp = function (timestamp, newStandard) {
        // 设置需要的时间格式
        var newStandard = newStandard || '$2月$3日';
        var newDate = new Date();
        var standardTime = "",
            fullYear='',month = '', day='',
            arr = [];
        function getArr(newDate) {
            fullYear = newDate.getFullYear();
            month = newDate.getMonth()+1;
            day = newDate.getDate();
            arr.push(fullYear);
            arr.push(month);
            arr.push(day);
            if(arr[1] < 10) {
                arr[1] = '0'+arr[1]
            }
            if(arr[2] < 10) arr[2] = '0'+arr[2];
            standardTime = arr.join('/');
            return standardTime;
        }
        if(/^\d{13}$/.test(timestamp)) {
            newDate.setTime(timestamp);
            standardTime = getArr(newDate);
        }else if(/^\d{16}$/.test(timestamp)) {
            newDate.setTime(timeStamp / 1000);
            standardTime = getArr(newDate);
        } else {
            console.error("时间戳格式不正确");
        }
        // 返回需要的时间格式
        return standardTime.replace(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, newStandard);
    };

        /*
     * 将日期字符串转为时间戳
     * @param    {Date}  date(天)    "0-31"
     * return 1484733218000
     */
    fay.toTimeStamp = function (date) {
        if(date) {
            var d = new Date();
            d.setDate(d.getDate() + date);
            return d;
        }else {
            return Date.parse(new Date());
        }
    };

        // 长按事件
    fay.longPress = function (ele, cb, clickCb) {
        var timeOut = 0;
        ele.on({
            touchstart: function (e) {
                var objTarget = e.target ? e.target : e.srcElement;
                console.log($(this).find(".panel_info").attr("data-id"));
                timeOut = setTimeout(function () {
                    var name = prompt("请修改礼品单",'');
                }, 500);
                return false;
            },
            touchmove: function (e) {
                clearTimeout(timeOut);
                timeOut = 0;
                return false;
            },
            touchend: function (e) {
                clearTimeout(timeOut);
                if(timeOut) {
                    clickCb;
                }
                return false;
            }
        })
    };
    fay.throttle = function(method, context, delay) {
        var delayTime = delay || 1000;
        clearTimeout(context.tId);
        context.tId = setTimeout(function(){
            method.call(context);
        }, delayTime);
    };

    return fay;
})()
