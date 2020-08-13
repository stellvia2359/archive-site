$(function () {
    site.initialize();
    utility.hideLoadingMask();
});
var versionNumber = "20200814"
var site = {
    initialize: function () {
        $(".my-site-link").click(site.navLinkClick);
        site.loadHome();
    },
    navLinkClick: function (e) {
        utility.showLoadingMask();
        event.preventDefault();
        var target = $(e.target);
        var url = $(target).data("url")+"?v=" + versionNumber;
        $.ajax({
            url: url,
            dataType: "html",
            success: function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                $(target).addClass("active");
                utility.hideLoadingMask();
            }
        });
    },
    loadHome:function(){
        $.ajax({
            url: "home.html",
            async: false,
            dataType: "html",
            success: function (data) {
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
    }
};