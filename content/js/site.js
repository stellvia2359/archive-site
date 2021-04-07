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
            site.loadPage(url, loadeqjson);
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
    loadPage: function (url, loadeqjson) {
        $.ajax({
            url: url + ".html",
            dataType: "html",
            success: function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                var navId = $(".nav-id").val();
                $("#" + navId).addClass("active");
                if (loadeqjson) {
                    var json = site.loadEquipmentDataOfAllCategories(url);
                    site.loadTemplate(json);


                }
                utility.loadPopover();
                utility.generateStars();
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
                utility.hideLoadingMask();
            }
        });
    },
    loadCommentDB: function (url) {
        var comments;
        $.ajax({
            url: url + ".json",
            dataType: "json",
            async: false,
            success: function (data) {
                comments = data;
            }
        });
        return comments;
    },
    loadEquipmentDB: function () {
        var result;
        $.ajax({
            url: "guide/common/equipments.json",
            dataType: "json",
            async: false,
            success: function (data) {
                result = data;
            }
        });
        return result;
    },
    loadEquipmentDataOfAllCategories: function (url) {
        var commentDB = site.loadCommentDB(url);
        site.printJson(commentDB);
        
        var equipmentDB = site.loadEquipmentDB();
        site.printJson2(equipmentDB);

        var finalCategories = [];
        $.each(commentDB.equipments, function (i, category) {

            var targetCategory = equipmentDB.equipments.filter(function (c) {
                return c.categoryCode == category.categoryCode
            })[0];
            var finalCategory = JSON.parse(JSON.stringify(targetCategory));
            finalCategory.items = [];
            finalCategory.cards = [];
            $.each(category.items, function (j, item) {
                var targetItem = targetCategory.items.filter(function (e) {
                    return e.name == item.name
                })[0];
                targetItem.star = item.star;
                targetItem.comments = item.comments;
                finalCategory.items.push(targetItem);
            });
            $.each(category.cards, function (j, card) {
                var targetCard = targetCategory.cards.filter(function (c) {
                    return c.name == card.name
                })[0];
                targetCard.star = card.star;
                targetCard.comments = card.comments;
                finalCategory.cards.push(targetCard);
            });
            finalCategories.push(finalCategory);
        });

        result = {
            equipments: finalCategories
        }
        return result;
    },
    loadTemplate: function (json) {
        var template;
        $.ajax({
            url: "guide/common/template_equipment.txt",
            async: false,
            success: function (data) {
                template = $.templates(data);
                var htmlOutput = template.render(json);
                $("#equipments-block").html(htmlOutput);

            }
        });
    },
    printJson: function (data) {
        var x = {
            equipments: data.equipments.map(e => ({ categoryCode: e.categoryCode, items: e.items.map(i => ({ name: i.name, star: i.star, comments: i.comments })), cards: e.cards.map(c => ({ name: c.name, star: c.star, comments: c.comments })) }))
        };
        console.log(x);
    },
    printJson2: function (data) {
        var x = {
            equipments: data.equipments.map(e => ({ category:e.category,categoryCode: e.categoryCode, overrideCategoryName: e.overrideCategoryName, hasCard: e.hasCard, items: e.items.map(i => ({ imgNames: i.imgNames, name: i.name, slots: i.slots, available: i.available, loot: i.loot, externalUrls: i.externalUrls, infos: i.infos })), cards: e.cards.map(c => ({ imgNames: c.imgNames, name: c.name, available: c.available, infos: c.infos })) }))
        };
        console.log(x);
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