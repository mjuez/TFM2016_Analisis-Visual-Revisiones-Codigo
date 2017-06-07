function loadRepositoryList(apiRoute, page, url) {
    showLoader();
    $('#repositories_order_dropdown').dropdown({
        onChange: function (value, text) { handleRepositoriesOrder(value); }
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

function handleRepositoriesOrder(value) {
    switch (value) {
        case 'date_asc': app.setLocation(`#/repositories/order/date/asc/page/1`);
            break;
        case 'date_desc': app.setLocation(`#/repositories/order/date/desc/page/1`);
            break;
        case 'name_asc': app.setLocation(`#/repositories/order/name/asc/page/1`);
            break;
        case 'name_desc': app.setLocation(`#/repositories/order/name/desc/page/1`);
            break;
        case 'reviews_asc': app.setLocation(`#/repositories/order/reviews/asc/page/1`);
            break;
        case 'reviews_desc': app.setLocation(`#/repositories/order/reviews/desc/page/1`);
            break;
        case 'pulls_asc': app.setLocation(`#/repositories/order/pullrequests/asc/page/1`);
            break;
        case 'pulls_desc': app.setLocation(`#/repositories/order/pullrequests/desc/page/1`);
            break;
    }
}

function loadRepository(owner, repository) {
    showLoader();
    $.get(`/api/repo/${owner}/${repository}`)
        .done(function (result) {
            $('#repository_title').html(`Repositorio: ${result.full_name}`);
            configureRepositoryButtons(result);
            loadRepositoryCharts(result);
            hideLoader();
        })
        .fail(function (error) {
            app.setLocation(`#/notfound`);
            hideLoader();
        });
}

function configureRepositoryButtons(repository) {
    $('#repository_pullrequests_button').on('click', function(){
        app.setLocation(`#/pullrequests/filter/${repository.full_name}/page/1`);
    });

    $('#repository_viewgithub_button').on('click', function(){
        $(location).attr('href', repository.html_url);
    });
}

function loadRepositoryCharts(repository) {
    $.get(`/api/repos/stats/averages`)
        .done(function (result) {
            printRepositoryAverageCharts(repository, result);
        })
        .fail(function (error) {

        });

    $.get(`/api/pulls/filter/${repository.full_name}/stats/created/alltime`)
        .done(function (result) {
            printRepositoryCreatedAllTimeStatsChart(result);
        })
        .fail(function (error) {

        });
}

function printRepositoryAverageCharts(repository, avgData) {
    printAverageChart('stargazers', repository.stargazers_count, avgData.stargazers, 'repository_stargazers_chart');
    printAverageChart('watchers', repository.watchers_count, avgData.watchers, 'repository_watchers_chart');
    printAverageChart('forks', repository.forks_count, avgData.forks, 'repository_forks_chart');
    printAverageChart('pull_requests', repository.pull_requests_count, avgData.pull_requests, 'repository_pullrequests_chart');
    printAverageChart('reviews', repository.reviews_count, avgData.reviews, 'repository_reviews_chart');
    printAverageChart('review_comments', repository.review_comments_count, avgData.review_comments, 'repository_reviewcomments_chart');
}

function printAverageChart(name, value, avg, container) {
    $(`#${container}_segment`).removeClass('loading');
    var data = ['data1', value];
    var avgData = ['data2', avg];
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#${container}`,
        data: {
            columns: [
                data,
                avgData
            ],
            type: 'bar',
            names: {
                data1: name,
                data2: `Media de ${name}`
            }
        }
    });
}

function printRepositoryCreatedAllTimeStatsChart(data) {
    $(`#repository_createdalltime_chart_segment`).removeClass('loading');
    data.unshift('data1');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: '#repository_createdalltime_chart',
        data: {
            x: 'x',
            columns: [
                ['x', 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
                data
            ],
            type: 'area',
            names: {
                data1: 'Nro de pull requests creadas',
            }
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