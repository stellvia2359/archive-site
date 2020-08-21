$(function () {
    site.initialize();
    utility.hideLoadingMask();

});
var versionNumber = "20200818"
var site = {
    initialize: function () {
        $(".my-site-link").click(site.navLinkClick);
        $(".home-link").click(site.loadHome);
        $(".external-link").click(utility.closeMenu);
        $('#back-to-top').click(function () {
            utility.backToTop();
            return false;
        });
        $(window).scroll(function () {
            if ($(this).scrollTop() > 50) {
                $('#back-to-top').fadeIn();
            } else {
                $('#back-to-top').fadeOut();
            }
        });
        site.loadHome();
        utility.loadTooltip();
    },
    navLinkClick: function (e) {
        utility.closeMenu();
        utility.showLoadingMask();
        event.preventDefault();
        $("body").removeClass("welcome");
        $('[data-toggle="popover"]').popover('dispose')
        var target = $(e.target);
        var url = $(target).data("url") + "?v=" + versionNumber;
        $.ajax({
            url: url,
            dataType: "html",
            success: function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                $(target).addClass("active");
                utility.loadPopover();
                utility.generateStars();
                utility.backToTop();
                utility.hideLoadingMask();
            }
        });
    },
    loadHome: function () {
        var url = "home.html?v=" + versionNumber;
        $.ajax({
            url: url,
            async: false,
            dataType: "html",
            success: function (data) {
                $(".nav-link").removeClass("active");
                $("#main-content").html(data);
            }
        });
    }
}

var utility = {
    showLoadingMask: function () {
        $(".lmask").show();
    },
    hideLoadingMask: function () {
        $(".lmask").hide();
    },
    loadPopover: function () {
        $(".equipment-info-content").hide();
        $(".equipment-info").data("content", $(".equipment-info").closest(".media").children(".equipment-info-content").html());
        var equipmentInfo = $(".equipment-info");
        for (var i = 0; i < equipmentInfo.length; i++) {
            var title = $(equipmentInfo[i]).siblings(".equipment-name").text();
            var content = $(equipmentInfo[i]).closest(".media").children(".equipment-info-content").html();
            $(equipmentInfo[i]).attr("title", title);
            $(equipmentInfo[i]).data("content", content);
        }
        $('[data-toggle="popover"]').popover({
            html: true
        });
    },
    loadTooltip: function () {
        $('[data-toggle="tooltip"]').tooltip();
    },
    closeMenu: function () {
        $('#sidebarMenu').collapse("hide");
    },
    backToTop: function () {
        $('body,html').animate({
            scrollTop: 0
        }, 400);
    },
    generateStars: function () {
        var stars = $(".stars");
        for (var i = 0; i < stars.length; i++) {
            var score = $(stars[i]).data("score");
            var float = parseFloat(score);
            var integer = parseInt(score);
            var halfStar = float - integer > 0;
            for (var s = 1; s <= integer; s++) {
                $(stars[i]).append('<i class="fas fa-star"></i>');
            }
            if (halfStar) {
                $(stars[i]).append('<i class="fas fa-star-half"></i>');
            }
        }
    }
};