$(function () {
    site.initialize();

});
var versionNumber = "20210122"
var site = {
    initialize: function () {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('page')) {
            var url = urlParams.get('page');
            var loadeqjson = urlParams.get('loadeqjson');
            site.loadPage(url,loadeqjson);
        } else {
            site.loadHome();
        }
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

        $("body").attr({
            "data-spy": "scroll",
            "data-target": "#navbar-chapter"
        }).scrollspy({
            offset: 150
        });
        utility.loadTooltip();
    },
    loadPage: function (url,loadeqjson) {
        $.ajax({
            url: url + ".html",
            dataType: "html",
            success: function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                var navId = $(".nav-id").val();
                $("#" + navId).addClass("active");
                if(loadeqjson){
                    site.loadJson(url);
                }
                else{
                    utility.loadPopover();
                    utility.generateStars();
                    utility.hideLoadingMask();
                }
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
                utility.hideLoadingMask();
            }
        });
    },
    loadJson: function (url) {
        $.ajax({
            url: url + ".json",
            dataType: "json",
            success: function (data) {
                $.each(data.allEquipments, function (index, item) {
                    item.equipments.sort(utility.GetSortOrder("star"));
                    item.cards.sort(utility.GetSortOrder("star"));
                });
                var template;
                $.get("guide/common/template_equipment.txt", function (value) {
                    template = $.templates(value);
                    var htmlOutput = template.render(data);
                    $("#equipments-block").html(htmlOutput);
                    utility.loadPopover();
                    utility.generateStars();
                    utility.hideLoadingMask();
                });
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
            var title = $(equipmentInfo[i]).closest(".secondary-title-line").siblings(".equipment-name").text();
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
    },
    GetSortOrder: function (prop) {
        return function (a, b) {
            if (a[prop] < b[prop]) {
                return 1;
            } else if (a[prop] > b[prop]) {
                return -1;
            }
            return 0;
        }
    }

};