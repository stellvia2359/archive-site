$(function () {
    site.initialize();

});
var versionNumber = "202104091252"
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
        $(".external-link,.my-site-link").click(utility.closeMenu);
        if ($("#eq-nav").length == 0) {
            $('#back-to-top').removeClass("back-to-top").addClass("back-to-top2")
        }
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

        $(".link-to-chapter").click(function (e) {
            e.preventDefault();
            var id = $(this).attr("href");
            utility.scrollTo(id);
        });
        utility.loadTooltip();
    },
    loadPage: function (url, loadeqjson) {
        $.ajax({
            url: url + ".html",
            dataType: "html",
            async: false,
            success: function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                var navId = $(".nav-id").val();
                $("#" + navId).addClass("active");
                if (loadeqjson) {
                    var json = site.loadEquipmentDataOfAllCategories(url);
                    site.loadTemplate(json, loadeqjson);


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
            url: "database/equipments.json",
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
        var equipmentDB = site.loadEquipmentDB();
        var finalEquipments = [];

        $.each(commentDB.equipments, function (i, category) {
            //
            var targetCategory = equipmentDB.equipments.filter(function (c) {
                return c.categoryCode == category.categoryCode
            })[0];

            //Base: Clone the DB object.(Deep clone)
            var finalCategory = JSON.parse(JSON.stringify(targetCategory));
            //Clear items and cards
            finalCategory.items = [];
            finalCategory.cards = [];

            //Get each item comment and rank
            $.each(category.items, function (j, item) {
                //Get item information from DB
                var targetItem = targetCategory.items.filter(function (e) {
                    return e.id == item.id
                })[0];

                //Add comment and rank
                targetItem.star = item.star;
                targetItem.comments = item.comments;

                //Add to final ouput category
                finalCategory.items.push(targetItem);
            });

            //Get each card comment and rank
            $.each(category.cards, function (j, card) {
                //Get card information from DB
                var targetCard = targetCategory.cards.filter(function (c) {
                    return c.id == card.id
                })[0];

                //Add comment and rank
                targetCard.star = card.star;
                targetCard.comments = card.comments;

                //Add to final ouput category
                finalCategory.cards.push(targetCard);
            });

            //Add to final equipments
            finalEquipments.push(finalCategory);
        });

        result = {
            equipments: finalEquipments
        }
        return result;
    },
    loadTemplate: function (json, loadeqjson) {
        var template;
        var templateName;
        switch (loadeqjson) {
            case "full":
                templateName = "equipment";
                break;
            case "selected":
                templateName = "equipment-selected";
                break;
            default:
                templateName = "equipment";
                break;
        }
        $.ajax({
            url: "template/" + templateName + ".html",
            async: false,
            success: function (data) {
                template = $.templates(data);
                var htmlOutput = template.render(json);
                $("#equipments-block").html(htmlOutput);

            }
        });
        $.ajax({
            url: "template/equipment-nav.html",
            async: false,
            success: function (data) {
                template = $.templates(data);
                var htmlOutput = template.render(json);
                $("#blk-nav-chapter").html(htmlOutput);
            }
        });
    },
    printJson: function (data, source) {
        var x = {
            equipments: data.equipments.map(e => ({ categoryCode: e.categoryCode, items: e.items.map(i => ({ id: source.equipments.filter(function (category) { return category.categoryCode == e.categoryCode })[0].items.filter(function (item) { return item.name == i.name })[0].id, name: i.name, star: i.star, comments: i.comments })), cards: e.cards.map(c => ({ id: source.equipments.filter(function (category) { return category.categoryCode == e.categoryCode })[0].cards.filter(function (card) { return card.name == c.name })[0].id, name: c.name, star: c.star, comments: c.comments })) }))
        };
        console.log(x);
    },
    printJson2: function (data) {
        var x = {
            equipments: data.equipments.map(e => ({ category: e.category, categoryCode: e.categoryCode, overrideCategoryName: e.overrideCategoryName, hasCard: e.hasCard, items: e.items.map(i => ({ id: utility.uuidv4(), imgNames: i.imgNames, name: i.name, slots: i.slots, available: i.available, loot: i.loot, externalUrls: i.externalUrls, infos: i.infos })), cards: e.cards.map(c => ({ id: utility.uuidv4(), imgNames: c.imgNames, name: c.name, available: c.available, infos: c.infos })) }))
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
    scrollTo: function (id) {
        var y = $(id).offset().top;
        $('body,html').animate({
            scrollTop: y - 60
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
    },
    uuidv4: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};