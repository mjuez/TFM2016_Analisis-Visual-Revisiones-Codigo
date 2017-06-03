function bindHomeListeners() {
    $('.message .close')
        .on('click', function () {
            $(this)
                .closest('.message')
                .transition('fade');
        });
    $('#home_go_button').on('click', createTask);
}

function createTask() {
    var owner = $('#home_owner_input').val();
    var repository = $('#home_repository_input').val();
    var btn = $(this);
    btn.addClass('loading');
    $.post(`/api/task/${owner}/${repository}`)
        .done(function (result) {
            show($('#home_success'));
            btn.removeClass('loading');
            $('#home_owner_input').val('');
            $('#home_repository_input').val('');
        })
        .fail(function (error) {
            show($('#home_fail'));
            btn.removeClass('loading');
        });

    function show(element) {
        if (element.hasClass('hidden')) {
            element.transition('fade');
            setTimeout(function () {
                if (element.hasClass('visible')) {
                    element.transition('fade');
                }
            }, 3000);
        }
    }
}