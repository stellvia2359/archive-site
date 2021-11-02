$(async function () {
    await site.initialize();
});
var versionNumber = "202110261442"
var timer;
var disableAlert;
var site = {
    initialize: async function () {
        await site.loadPage();
        utility.initialSidBarMenu();
        utility.initialToast();
        utility.initialHistory();
    },
    loadPage: async function () {
        var urlParams = new URLSearchParams(window.location.search);
        var isPage = urlParams.has('page');
        disableAlert = false;
        if (isPage) {
            var url = urlParams.get('page');
            if (url == "others/thanks") {
                disableAlert = true;
            }
            var loadeqjson = urlParams.get('loadeqjson');
            await site.loadPageHtml(url, loadeqjson);
        } else {
            site.loadHomeHtml();
        }
    },
    loadPageHtml: async function (url, loadeqjson = null) {
        utility.backToTop();
        utility.showLoadingMask();
        utility.closeSideBarMenu();
        $.ajax({
            url: url + ".html",
            dataType: "html",
            async: true,
            success: async function (data) {
                $("#main-content").html(data);
                $(".nav-link").removeClass("active");
                var navId = $(".nav-id").val();
                $("#" + navId).addClass("active");
                var loadeqjsonQS = "";
                if (loadeqjson != null) {
                    var json = await site.loadEquipmentDataOfAllCategories(url);
                    await site.loadTemplate(json, loadeqjson);
                    loadeqjsonQS = `&loadeqjson=${loadeqjson}`;
                }
                else {
                    $("#blk-nav-chapter").html("");
                }
                window.history.pushState({ html: data }, "", `/index.html?page=${url}${loadeqjsonQS}`);
                $(".sb-nav-fixed #layoutSidenav #layoutSidenav_content").removeClass("home");
                $("#footer").removeClass("home-footer");

                utility.loadPopover();
                utility.generateStars();
                utility.initialEquipmentNav();
                utility.initialBackToTop();
                utility.loadTooltip();
                utility.hideLoadingMask();
            }
        });
    },
    loadHomeHtml: async function () {
        utility.backToTop();
        utility.showLoadingMask();
        utility.closeSideBarMenu();
        var url = "home.html?v=" + versionNumber;
        await $.ajax({
            url: url,
            async: true,
            dataType: "html",
            success: function (data) {
                $(".nav-link").removeClass("active");
                $("#main-content").html(data);
                $("#blk-nav-chapter").html("");
                $(".sb-nav-fixed #layoutSidenav #layoutSidenav_content").addClass("home");
                $("#footer").addClass("home-footer");
                utility.initialBackToTop();
                window.history.pushState({ html: data }, "", `/index.html`);

                utility.hideLoadingMask();
            }
        });
    },
    loadCommentDB: async function (url) {
        var comments;
        await $.ajax({
            url: url + ".json",
            dataType: "json",
            async: true,
            success: function (data) {
                comments = data;
            }
        });
        return comments;
    },
    loadEquipmentDB: async function () {
        var result;
        await $.ajax({
            url: "database/equipments.json",
            dataType: "json",
            async: false,
            success: function (data) {
                result = data;
            }
        });
        return result;
    },
    loadEquipmentDataOfAllCategories: async function (url) {
        var commentDB = await site.loadCommentDB(url);
        var equipmentDB = await site.loadEquipmentDB();
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
    loadTemplate: async function (json, loadeqjson) {
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
        var template = $.ajax({
            url: "template/" + templateName + ".html",
            async: true,
            success: function (data) {
                template = $.templates(data);
                var htmlOutput = template.render(json);
                $("#equipments-block").html(htmlOutput);

            }
        });
        var templateNav = $.ajax({
            url: "template/equipment-nav.html",
            async: true,
            success: function (data) {
                template = $.templates(data);
                var htmlOutput = template.render(json);
                $("#blk-nav-chapter").html(htmlOutput);
            }
        });

        await template;
        await templateNav;
    },
    confirmDonate: function (e) {
        alert("真的假的?你人也太好了吧!");
    }
}

var utility = {
    initialSidBarMenu: function () {
        $("#layoutSidenav_content").click(utility.closeSideBarMenu);
    },
    initialHistory: function () {
        window.onpopstate = function (e) {
            if (e.state) {
                $("#main-content").html(e.state.html);
            }
        };
    },
    closeSideBarMenu: function () {
        if ($(window).width() < 992) {
            document.body.classList.remove('sb-sidenav-toggled');
        }
    },
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
            $(equipmentInfo[i]).attr("data-bs-content", content);
        }

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl)
        })
    },
    loadTooltip: function () {
        $('[data-toggle="tooltip"]').tooltip();
    },
    initialBackToTop: function () {
        if ($("#eq-nav").length == 0) {
            $('#back-to-top').removeClass("back-to-top").addClass("back-to-top2");
        }
        else {
            $('#back-to-top').removeClass("back-to-top2").addClass("back-to-top");
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
    },
    backToTop: function () {
        $('body,html').animate({
            scrollTop: 0
        }, 10);
    },
    initialEquipmentNav: function () {
        $(".link-to-chapter").click(function (e) {
            e.preventDefault();
            var id = $(this).attr("href");
            utility.scrollTo(id);
        });
    },
    initialToast: function () {
        $('.toast').on('shown.bs.toast', function () {
            clearInterval(timer);
            var i = 5;
            $("#toast-countdown").text(i--);
            timer = setInterval(function () {
                $("#toast-countdown").text(i--);
                if (i < 0) {
                    clearInterval(timer);
                    $('.toast').toast('hide');
                }
            }, 1000);
        });
        if (!disableAlert) {
            $('.toast').toast('show');
        }
        $("#btn-notification").click(function () {
            $('.toast').toast('show');
        });
    },
    scrollTo: function (id) {
        var y = $(id).offset().top;
        $('body,html').animate({
            scrollTop: y - 60
        }, 10);
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
    },
    copyTextToClipboard: function (text) {
        var textArea = document.createElement("textarea");

        //
        // *** This styling is an extra step which is likely not required. ***
        //
        // Why is it here? To ensure:
        // 1. the element is able to have focus and selection.
        // 2. if the element was to flash render it has minimal visual impact.
        // 3. less flakyness with selection and copying which **might** occur if
        //    the textarea element is not visible.
        //
        // The likelihood is the element won't even render, not even a
        // flash, so some of these are just precautions. However in
        // Internet Explorer the element is visible whilst the popup
        // box asking the user for permission for the web page to
        // copy to the clipboard.
        //

        // Place in the top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of the white box if rendered for any reason.
        textArea.style.background = 'transparent';


        textArea.value = text;

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        var success = true;
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);

        } catch (err) {
            console.log('Oops, unable to copy');
            success = false;
        }
        document.activeElement.blur();
        textArea.blur();
        document.body.removeChild(textArea);
        if (success) {
            alert("已複製到剪貼簿");
        }
    },
    iOS: function () {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    },
    iOSversion: function () {
        /* /iP(hone|od|ad)/.test(navigator.platform) */
        if (utility.iOS()) {
            // supports iOS 2.0 and later: <https://bit.ly/TJjs1V>
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        }
        else {
            return [0, 0, 0];
        }
    }
};