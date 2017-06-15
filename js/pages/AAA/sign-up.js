var publisher_url = "http://localhost:3005/api/clients";
var announcer_url = "http://127.0.0.1:3000/api/clients";

$(document).ready(function () {
    $("#signup_btn").click(function () {
        if ($('#announcerRadio').attr('checked') == undefined)
            var serviceToRequest = publisher_url ;
        else 
            var serviceToRequest = announcer_url;
        var data = {
            companyName : $('#companyName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            username: $('#username').val(),
            time: 1232223330,
            registrationCountry: 'US',
            registrationIPAddress: '192.168.1.1'
        }
        $.ajax({
            url: announcer_url,
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