setTimeout(function() {
    try {
        var hideUntilLoad = $(".galleryView, .imageandvideocarousel").filter(function() { return ($(this).css("visibility") === "visible"); } );
        hideUntilLoad.css("visibility", "hidden");
        $(document).ready(function() { hideUntilLoad.css("visibility", "visible"); });
    } catch( e ) {
        console.error("hideUntilLoad(): exception: $('.galleryView, .imageandvideocarousel')" );
        console.dir(e);
    }
},0);
