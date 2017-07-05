/**
 * repositories.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/**
 * Repositories list loader.
 * 
 * @param {string} apiRoute     Anvireco GET api route.
 * @param {number} page         page number.
 * @param {string} url          base url.
 */
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

/**
 * Handles repository ordering.
 * 
 * @param {string} value    order value. 
 */
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

/**
 * Loads a single repository page.
 * 
 * @param {string} owner        repository owner.
 * @param {string} repository   repository name. 
 */
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

/**
 * Configures the top buttons of a single repository page.
 * 
 * @param {Object} repository   repository object.
 */
function configureRepositoryButtons(repository) {
    $('#repository_pullrequests_button').on('click', function () {
        app.setLocation(`#/pullrequests/filter/${repository.full_name}/page/1`);
    });

    $('#repository_download_button').on('click', function () {
        $(location).attr('href', `/api/repo/${repository.full_name}/csv`);
    });

    $('#repository_viewgithub_button').on('click', function () {
        $(location).attr('href', repository.html_url);
    });
}

/**
 * Loads a single repository charts.
 * 
 * @param {Object} repository  repository object
 */
function loadRepositoryCharts(repository) {
    $.get(`/api/repos/stats/means`)
        .done(function (result) {
            printRepositoryMeanCharts(repository, result);
        });

    if (repository.reviews_count > 0) {
        $.get(`/api/reviews/filter/repo/${repository.full_name}/stats/alltime`)
            .done(function (result) {
                printRepositoryReviewsAllTimeChart(result);
                printRepositoryReviewTypesChart(result);
            });
    } else {
        $('#repository_reviews_none_msg').removeClass("invisible");
        $('#repository_reviewtypes_chart_segment').addClass("invisible");
        $('#repository_reviews_alltime_chart_segment').addClass("invisible");
    }

    if (repository.pull_requests_count > 0) {
        $.get(`/api/pulls/filter/repo/${repository.full_name}/stats/alltime`)
            .done(function (result) {
                printRepositoryPullsStatesChart(result);
                printRepositoryPullsAllTimeChart(result);
            });
    } else {
        $('#repository_pulls_none_msg').removeClass("invisible");
        $('#repository_pullsstates_chart_segment').addClass("invisible");
        $('#repository_pulls_alltime_chart_segment').addClass("invisible");
    }

    if (repository.review_comments_count > 0) {
        $.get(`/api/reviewcomments/filter/repo/${repository.full_name}/stats/alltime`)
            .done(function (result) {
                printRepositoryReviewCommentsAllTimeChart(result);
            });
    } else {
        $('#repository_reviewcomments_none_msg').removeClass("invisible");
        $('#repository_reviewcomments_alltime_chart_segment').addClass("invisible");
    }

}

/**
 * Prints all repository mean charts.
 * 
 * @param {Object} repository  repository object
 * @param {Object} meanData     mean statistics.
 */
function printRepositoryMeanCharts(repository, meanData) {
    var stargazersCountConfig = {
        value: repository.stargazers_count,
        mean: meanData.stargazers_count,
        container: 'repository_stargazers_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de stargazers'
    };
    printMeanChart(stargazersCountConfig);
    var watchersCountConfig = {
        value: repository.watchers_count,
        mean: meanData.watchers_count,
        container: 'repository_watchers_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de watchers'
    };
    printMeanChart(watchersCountConfig);
    var forksCountConfig = {
        value: repository.forks_count,
        mean: meanData.forks_count,
        container: 'repository_forks_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de forks'
    };
    printMeanChart(forksCountConfig);
    var pullrequestsCountConfig = {
        value: repository.pull_requests_count,
        mean: meanData.pull_requests_count,
        container: 'repository_pullrequests_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de pull requests'
    };
    printMeanChart(pullrequestsCountConfig);
    var reviewsCountConfig = {
        value: repository.reviews_count,
        mean: meanData.reviews_count,
        container: 'repository_reviews_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de revisiones'
    };
    printMeanChart(reviewsCountConfig);
    var reviewcommentsCountConfig = {
        value: repository.review_comments_count,
        mean: meanData.review_comments_count,
        container: 'repository_reviewcomments_chart',
        column_legend: `Repositorio: ${repository.name}`,
        y_label: 'Número de comentarios de revisión'
    };
    printMeanChart(reviewcommentsCountConfig);
}

/**
 * Prints a donut chart with review types comparison.
 * 
 * @param {Object} stats    Review types statistics.
 */
function printRepositoryReviewTypesChart(stats) {
    $(`#repository_reviewtypes_chart_segment`).removeClass('loading');
    var reviewsCommented = stats.commented.reduce(function (x, y) { return x + y; });
    var reviewsChangesRequested = stats.changes_requested.reduce(function (x, y) { return x + y; });
    var reviewsApproved = stats.approved.reduce(function (x, y) { return x + y; });
    var reviewsDismissed = stats.dismissed.reduce(function (x, y) { return x + y; });
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#repository_reviewtypes_chart`,
        data: {
            columns: [
                ['Comentadas', reviewsCommented],
                ['Con petición de cambios', reviewsChangesRequested],
                ['Aprobadas', reviewsApproved],
                ['Descartadas', reviewsDismissed]
            ],
            type: 'donut'
        },
        donut: {
            title: 'Revisiones'
        }
    });
}

/**
 * Prints an area chart of all time 
 * reviews statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printRepositoryReviewsAllTimeChart(stats) {
    $(`#repository_reviews_alltime_chart_segment`).removeClass('loading');
    var data = $.extend(true, {}, stats);
    data.all.unshift('all');
    data.approved.unshift('approved');
    data.changes_requested.unshift('changes_requested');
    data.commented.unshift('commented');
    data.dismissed.unshift('dismissed');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#repository_reviews_alltime_chart`,
        data: {
            columns: [
                data.commented,
                data.changes_requested,
                data.approved,
                data.dismissed,
                data.all
            ],
            type: 'area',
            names: {
                all: 'Todas',
                approved: 'Aprobadas',
                changes_requested: 'Con petición de cambios',
                commented: 'Comentadas',
                dismissed: 'Descartadas',
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: data.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de revisiones',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints a donut chart with pull request
 * state comparison (open/closed).
 * 
 * @param {Object} stats open/closed statistics.
 */
function printRepositoryPullsStatesChart(stats) {
    $(`#repository_pullsstates_chart_segment`).removeClass('loading');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#repository_pullsstates_chart`,
        data: {
            columns: [
                ['Abiertas', stats.open],
                ['Cerradas', stats.closed]
            ],
            type: 'donut',
            colors: {
                Abiertas: '#2ca02c',
                Cerradas: '#d62728'
            }
        },
        donut: {
            title: 'Pull Requests'
        }
    });
}

/**
 * Prints an area chart of all time 
 * pull requests statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printRepositoryPullsAllTimeChart(stats) {
    $(`#repository_pulls_alltime_chart_segment`).removeClass('loading');
    var data = $.extend(true, {}, stats);
    data.created.unshift('created');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#repository_pulls_alltime_chart`,
        data: {
            columns: [
                data.created
            ],
            type: 'area',
            names: {
                created: 'Creadas'
            },
            colors: {
                created: '#9467bd'
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: data.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de pull requests',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints an area chart of all time 
 * review comments statistics.
 * 
 * @param {Object} stats all time statistics. 
 */
function printRepositoryReviewCommentsAllTimeChart(stats) {
    $(`#repository_reviewcomments_alltime_chart_segment`).removeClass('loading');
    stats.created.unshift('created');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#repository_reviewcomments_alltime_chart`,
        data: {
            columns: [
                stats.created
            ],
            type: 'area',
            names: {
                created: 'Creados'
            },
            colors: {
                created: '#9467bd'
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: stats.labels,
                tick: {
                    rotate: 75,
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Nº de comentarios de revisión',
                    position: 'outer-middle'
                }
            }
        }
    });
}

/**
 * Prints the list of repositories.
 * 
 * @param {Array} items repositories items.
 */
function printRepositoryItems(items) {
    $('#repository_list').html('');
    items.map(function (item) {
        $('#repository_list').append(repositoryItem(item));
    });
}

/**
 * Creates a repository list item.
 * 
 * @param {Object} repositoryData  repository data object.
 */
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
                        text: repositoryData.description || '<em>Sin descripción.</em>'
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