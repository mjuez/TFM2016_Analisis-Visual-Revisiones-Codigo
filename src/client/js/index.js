$.fn.api.settings.api = {
    'request repository': '/api/remote/{owner}/{repository}/pulls/'
}

$(document).ready(function () {

    let requestRepositoryBtn = $('.request-repository');
    requestRepositoryBtn.api({
        action: 'request repository',
        beforeSend: function (settings) {
            settings.urlData = {
                owner: $('#owner').val(),
                repository: $('#repository').val()
            };
            return settings;
        }
    });

});