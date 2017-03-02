!function (window, $,undefined) {
    var Pagination = function (el, total) {
        this.container = $(el);
        this.total = total;
        this.index = 1;
        this.init();
        this.attachEvent();

    };
    Pagination.prototype.init = function (page) {
        var curPage = page ? page : 1;
        console.log(this.index);
        this.container.html(this.showPage(curPage, this.total));
    };
    Pagination.prototype.showPage = function (page, totalPage) {
        var str = '<li class="page-active">'+page+'</li>';
        for(var i=1; i<=3; i++) {
            if(page - i > 1) {
                str = '<li class="page-item">'+(page-i)+'</li>' +' '+ str;
            }
            if(page + i < totalPage) {
                str = str +" "+'<li class="page-item">'+(page+ i)+'</li>'
            }
        }
        if(page-4 >1) {
            str = '<li class="page-none">... </li>' +str;
        }
        if (page >1) {
            str= '<li class="page-up">上一页</li>'+ ' '+'<li class="page-item">1</li>' +' '+ str;
        }

        if(page+4< totalPage) {
            str = str+ '<li class="page-none"> ...</li>';
        }
        if(page < totalPage) {
            str = str + " " +'<li class="page-item">'+totalPage+'</li>' +" " +'<li class="page-down">下一页</li>'
        }
        return str;
    };
    Pagination.prototype.attachEvent = function () {
        var _this = this;
        this.container.on('click', 'li', function () {
            var txt = $.text($(this));
            var i = parseInt(txt);
            if(i) _this.index = i;
            switch (txt) {
                case "上一页":
                    --_this.index;

                    break;
                case '下一页':
                    ++_this.index;
                    break;
                case '...':
                    break;
            }
            _this.init(_this.index);
        })
    };
    $.fn.pagination = function (total) {
        new Pagination(this, total)
    }
}(window,jQuery);