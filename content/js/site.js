$(function () {
    site.initialize();
});

var site = {
    initialize: function () {
        $("#sidebarMenu .nav-link").click(site.navLinkClick);
    },
    navLinkClick:function(e){
        event.preventDefault();
        var url = $(e.target).attr("href");
        /*
        $.getJSON( "guide/warlock/warlock_wind_ghost.json", function( data ) {
            var items = [];
            $.each( data, function( key, val ) {
              items.push( "<li id='" + key + "'>" + val + "</li>" );
            });
           
            $( "<ul/>", {
              "class": "my-new-list",
              html: items.join( "" )
            }).appendTo( "body" );
          });
          */
        $("#main-content").load("/guide/warlock/guide_wwg.html");       
    }
}