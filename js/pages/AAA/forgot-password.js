var publisher_url = "http://127.0.0.1:3005/api/clients/reset";
var announcer_url = "http://127.0.0.1:3000/api/clients/reset";

$(document).ready(function () {
    $("#reset_btn").click(function () {
        if ($('#announcerRadio').attr('checked') == undefined)
            var serviceToRequest = publisher_url ;
        else 
            var serviceToRequest = announcer_url;
        var data = {
            email: $('#email').val(),
        }
        $.ajax({
            url: serviceToRequest,
            data: data,
            type: "POST",
            success: function (result) {
                $("#div1").html(result);
            },
            error: function(result) {
                $("#div1").html(result);
            }
        });
    });
});