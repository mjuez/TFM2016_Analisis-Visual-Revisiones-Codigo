function loadHome(callback) {
    $('#content').load(`/_home.html`, function () {
        $('.message .close')
            .on('click', function () {
                $(this)
                    .closest('.message')
                    .transition('fade');
            });
        $('#home_go_button').on('click', createTask);
        callback();
    });
}

function createTask() {
    const owner = $('#home_owner_input').val();
    const repository = $('#home_repository_input').val();
    $(this).addClass('loading');
    $.get(`/api/remote/${owner}/${repository}/pulls`)
        .done((result) => {
            show($('#home_success'));
            $(this).removeClass('loading');
        })
        .fail((error) => {
            show($('#home_fail'));
            $(this).removeClass('loading');
        });

    function show(element) {
        if (element.hasClass('hidden')) {
            element.transition('fade');
            setTimeout(() => {
                if (element.hasClass('visible')) {
                    element.transition('fade');
                }
            }, 3000);
        }
    }
}