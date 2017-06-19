/**
 * home.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/**
 * Binds listeners to close message buttons
 * and create task buton (go).
 */
function bindHomeListeners() {
    $('.message .close')
        .on('click', function () {
            $(this)
                .closest('.message')
                .transition('fade');
        });
    $('#home_go_button').on('click', createTask);
}

/**
 * Task creation.
 * Sends a POST to Anvireco API and
 * shows loading and then task creation
 * information message.
 */
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