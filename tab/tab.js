;!function () {
    var tabContentItem = $('.fui-tab_container');
    tabContentItem.eq(0).show();
    $('.fui-tab').on('click', 'a', function () {
        var $index = $(this).index();
        if(!$(this).hasClass('fui-active')) {
            $(this).addClass('fui-active').siblings().removeClass('fui-active');
            tabContentItem
                .eq($index).show()
                .siblings().hide();
        }
    });
}();