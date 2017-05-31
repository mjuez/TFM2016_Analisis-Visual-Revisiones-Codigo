function loadPullrequests(callback) {
    loadPage(`/_pullrequests.html`, getPullrequestsPage, getPullRequestPage);
}

function getPullrequestsPage(page) {
    $('#loader').addClass('active');
    $.get(`/api/repos/page/${page}`)
        .done(function (result) {
            printRepositoryItems(result.data);
            let paginator = $('#repository_paginator');
            printPaginator(paginator, page, result.last_page, getPullrequestsPage);
            history.pushState(null, `Repositorios - Página ${page}`, `/repositories/page/${page}`);
            $('#loader').removeClass('active');
        })
        .fail(function (error) {
            $('#repository_list').html('No se pueden obtener los repositorios en este momento.');
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

function printCreatedAllTimeStatsGraph(data) {
    const divGraph = $('<div>', {
        id: "graph_createdalltime"
    });
    $('#generic_content').html(divGraph);
    var chart = c3.generate({
        bindto: '#graph_createdalltime',
        data: {
            columns: [
                data
            ]
        }
    });
}

function printRepositoryItems(items) {
    $('#repository_list').html('');
    items.map(function (item) {
        $('#repository_list').append(repositoryItem(item));
    });
}

function repositoryItem(repositoryData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<div>', {
                    class: 'header',
                    html: $('<a>', {
                        text: repositoryData.full_name,
                        class: 'ui violet large label',
                        click: function () { getPullRequestPage(repositoryData.owner.login, repositoryData.name); }
                    })
                }),
                $('<div>', {
                    class: 'ui hidden divider'
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: repositoryData.description || '<em>Sin descripción.</em>'
                    })
                })
            ]
        })
    });

    return item;
}