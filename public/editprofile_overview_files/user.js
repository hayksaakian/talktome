define(["tooltip"], function() {
    XL.User = {
        activeTab : null,
        updateActiveTab: function() {
            if(this.activeTab) {
                $('.sidebar .linkList li.tab').each(function() {
                    var href = $(this).find('a').attr('href');
                    var id = null;
                    if(href.match(/#(.+)$/))
                        id = RegExp.$1;
                    else if(href.match(/(^|\/)([^\/]+)$/)) {
                        href = RegExp.$2;
                    }
                    if ((id && id == XL.User.activeTab) || (!id && document.location.href.indexOf(href) != -1)) {
                        $(this).addClass('active').append('<div class="tabArrow"></div>');
                        if($(this).parents('.subnav').size() > 0) {
                            $(this).parents('.subnav').prev().addClass('active');
                        }
                    }
                    else {
                        $(this).removeClass('active').find('.tabArrow').remove();
                    }
                });

                if(document.location.href.match(/home.htm/)) {
                    $('.sidebar .subnav').hide();
                    $('.sidebar>div>.linkList>li').each(function() {
                        if($(this).find('a').attr('href').split(/#/)[1] == XL.User.activeTab) {
                            $(this).next('.subnav').show();
                        }
                    });
                }

                $('.tabContent').each(function() {
                    if ($(this).attr('id') == XL.User.activeTab) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }
        }
    };

    $(function() {
        $('.sidebar .linkList li.tab').live('click', function() {
            XL.User.activeTab = $(this).find('a').attr('href').split(/#/)[1];
            XL.User.updateActiveTab();
        });

        $('.profilepic').live('click', function() {
            document.location.href="/editprofile_images.htm";
        });

        $('#homeHeaderButton').addClass('active');
    });

});