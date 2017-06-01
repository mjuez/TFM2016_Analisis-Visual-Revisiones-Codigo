function loadRepositoryList(apiRoute, page, url) {
    showLoader();
    $('#repositories_order_dropdown').dropdown({
        onChange: function (value, text) { handleRepositoriesOrder(value, page); }
    });
    $.get(apiRoute)
        .done(function (result) {
            printRepositoryItems(result.data);
            let paginator = $('#repository_paginator');
            printPaginator(paginator, page, result.last_page, url);
            hideLoader();
        })
        .fail(function (error) {
            $('#repository_list').html('No se pueden obtener los repositorios en este momento.');
            hideLoader();
        });
}

function handleRepositoriesOrder(value, page) {
    switch (value) {
        case 'date_asc': app.setLocation(`#/repositories/order/date/asc/page/${page}`);
            break;
        case 'date_desc': app.setLocation(`#/repositories/order/date/desc/page/${page}`);
            break;
        case 'name_asc': app.setLocation(`#/repositories/order/name/asc/page/${page}`);
            break;
        case 'name_desc': app.setLocation(`#/repositories/order/name/desc/page/${page}`);
            break;
        case 'reviews_asc': app.setLocation(`#/repositories/order/reviews/asc/page/${page}`);
            break;
        case 'reviews_desc': app.setLocation(`#/repositories/order/reviews/desc/page/${page}`);
            break;
        case 'pulls_asc': app.setLocation(`#/repositories/order/pullrequests/asc/page/${page}`);
            break;
        case 'pulls_desc': app.setLocation(`#/repositories/order/pullrequests/desc/page/${page}`);
            break;
    }
}

function loadRepository(owner, repository) {
    $('#loader').addClass('active');
    $('#content').load(`/_generic.html`, function () {
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
                $('<a>', {
                    text: repositoryData.full_name,
                    class: 'header',
                    href: `/#/repository/${repositoryData.owner.login}/${repositoryData.name}`
                }),
                $('<div>', {
                    class: 'description',
                    html: $('<p>', {
                        html: repositoryData.description || '<em>Sin descripción.</em>'
                    })
                }),
                ,
                $('<div>', {
                    class: 'extra',
                    html: [
                        $('<i>', {
                            class: 'unhide icon'
                        }),
                        repositoryData.reviews_count,
                        ' | ',
                        $('<i>', {
                            class: 'comments icon'
                        }),
                        repositoryData.review_comments_count,
                        ' | ',
                        $('<i>', {
                            class: 'fork icon'
                        }),
                        repositoryData.pull_requests_count
                    ]
                })
            ]
        })
    });

    return item;
}