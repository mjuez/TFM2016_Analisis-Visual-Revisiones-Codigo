function loadPullrequests(callback) {
    loadPage(`/_pullrequests.html`, getPullrequestsPage, getPullRequestPage);
}

function getPullrequestsPage(page) {
    $('#loader').addClass('active');
    $.get(`/api/pulls/page/${page}`)
        .done(function (result) {
            printPullRequestItems
                (result.data);
            let paginator = $('#pullrequest_paginator');
            printPaginator(paginator, page, result.last_page, getPullrequestsPage);
            history.pushState(null, `Pull Requests - Página ${page}`, `/pullrequests/page/${page}`);
            $('#loader').removeClass('active');

            $('.ui.sticky').sticky();
            $('.ui.dropdown').dropdown();
        })
        .fail(function (error) {
            $('#pullrequest_list').html('No se pueden obtener los repositorios en este momento.');
            $('#loader').removeClass('active');
        });
}

function getPullRequestPage(owner, repository) {
    $('#loader').addClass('active');
    $('#content').load(`/_generic.html`, function () {
        history.pushState(null, `Repositorio - ${owner}/${repository}`, `/repositories/single/${owner}/${repository}`);
        $('#generic_title').html(`Repositorio: ${owner}/${repository}`);
        $.get(`/api/${owner}/${repository}/pulls/stats/created/alltime`)
            .done(function (result) {
                printCreatedAllTimeStatsGraph(result);
                $('#loader').removeClass('active');
            })
            .fail(function (error) {
                $('#generic_content').html('No se pueden obtener los repositorios en este momento.');
                $('#loader').removeClass('active');
            });
    });
}

function printPullRequestItems(items) {
    $('#pullrequest_list').html('');
    items.map(function (item) {
        $('#pullrequest_list').append(pullrequestItem(item));
    });
}

function pullrequestItem(pullrequestData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<a>', {
                    text: pullrequestData.title,
                    class: 'header',
                    click: function () { getPullRequestPage(repositoryData.owner.login, repositoryData.name); }
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: `${pullrequestData.base.repo.owner.login}/${pullrequestData.base.repo.name}`
                    })
                }),
                $('<div>', {
                    class: 'extra',
                    html: [
                        $('<i>', {
                            class: 'user icon'
                        }),
                        pullrequestData.user.login,
                        ' | ',
                        $('<i>', {
                            class: 'unhide icon'
                        }),
                        pullrequestData.reviews,
                        ' | ',
                        $('<i>', {
                            class: 'comments icon'
                        }),
                        pullrequestData.review_comments
                    ]
                })
            ]
        })
    });

    return item;
}