/**
 * pullrequests.js
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

/**
 * Pull Request list loader.
 * 
 * @param {string} apiRoute     Anvireco GET api route.
 * @param {number} page         page number.
 * @param {string} url          base url.
 * @param {Object} repository   repository object.
 */
function loadPullrequestsList(apiRoute, page, url, repository = undefined) {
    showLoader();
    $('#pullrequests_order_dropdown').dropdown({
        onChange: function (value, text) { handlePullrequestsOrder(value, repository); }
    });
    configurePullrequestsFilter(page, repository);
    $.get(apiRoute)
        .done(function (result) {
            printPullRequestItems(result.data);
            let paginator = $('#pullrequest_paginator');
            printPaginator(paginator, page, result.last_page, url);
            hideLoader();
        })
        .fail(function (error) {
            $('#pullrequest_list').html('No se pueden obtener los repositorios en este momento.');
            hideLoader();
        });
}

/**
 * Handles pull request ordering.
 * 
 * @param {string} value        order value. 
 * @param {Object} repository   repository object.
 */
function handlePullrequestsOrder(value, repository) {
    var repositoryFilter = '';
    if (repository != undefined) {
        repositoryFilter = `filter/${repository.owner}/${repository.name}/`;
    }
    switch (value) {
        case 'date_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/date/asc/page/1`);
            break;
        case 'date_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/date/desc/page/1`);
            break;
        case 'name_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/name/asc/page/1`);
            break;
        case 'name_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/name/desc/page/1`);
            break;
        case 'reviews_asc': app.setLocation(`#/pullrequests/${repositoryFilter}order/reviews/asc/page/1`);
            break;
        case 'reviews_desc': app.setLocation(`#/pullrequests/${repositoryFilter}order/reviews/desc/page/1`);
            break;
    }
}

/**
 * Loads a single pull request page.
 * 
 * @param {string} owner        repository owner.
 * @param {string} repository   repository name. 
 * @param {number} number       pull request number.
 */
function loadPullRequest(owner, repository, number) {
    showLoader();
    $.get(`/api/pull/${owner}/${repository}/${number}`)
        .done(function (result) {
            $('#pullrequest_title').html(`Pull Request: #${result.number} ${result.title}`);
            configurePullRequestButtons(result);
            loadPullRequestCharts(result);
            hideLoader();
        })
        .fail(function (error) {
            app.setLocation(`#/notfound`);
            hideLoader();
        });
}

/**
 * Configures the top buttons of a single pull request page.
 * 
 * @param {Object} pullrequest  pull request object.
 */
function configurePullRequestButtons(pullrequest) {
    $('#pullrequest_viewgithub_button').on('click', function () {
        $(location).attr('href', pullrequest.html_url);
    });
}

/**
 * Loads a single pull request charts.
 * 
 * @param {Object} pullrequest  pull request object
 */
function loadPullRequestCharts(pullrequest) {
    $.get(`/api/pulls/stats/means`)
        .done(function (result) {
            printPullRequestMeanCharts(pullrequest, result);
            printPullRequestAdditionsDeletionsChart(pullrequest)
        });
}

/**
 * Prints all pull request mean charts.
 * 
 * @param {Object} pullrequest  pull request object
 * @param {Object} meanData     mean statistics.
 */
function printPullRequestMeanCharts(pullrequest, meanData) {
    var changedFilesConfig = {
        value: pullrequest.changed_files,
        mean: meanData.changed_files,
        container: 'pullrequest_changedfiles_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de ficheros modificados'
    };
    printMeanChart(changedFilesConfig);
    var additionsConfig = {
        value: pullrequest.additions,
        mean: meanData.additions,
        container: 'pullrequest_additions_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de líneas añadidas'
    };
    printMeanChart(additionsConfig);
    var deletionsConfig = {
        value: pullrequest.deletions,
        mean: meanData.deletions,
        container: 'pullrequest_deletions_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de líneas eliminadas'
    };
    printMeanChart(deletionsConfig);
    var commitsConfig = {
        value: pullrequest.commits,
        mean: meanData.commits,
        container: 'pullrequest_commits_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de commits'
    };
    printMeanChart(commitsConfig);
    var commentsConfig = {
        value: pullrequest.comments,
        mean: meanData.comments,
        container: 'pullrequest_comments_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de comentarios'
    };
    printMeanChart(commentsConfig);
    var reviewsConfig = {
        value: pullrequest.reviews,
        mean: meanData.reviews,
        container: 'pullrequest_reviews_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de Revisiones'
    };
    printMeanChart(reviewsConfig);
    var reviewCommentsConfig = {
        value: pullrequest.review_comments,
        mean: meanData.review_comments,
        container: 'pullrequest_reviewcomments_chart',
        column_legend: `Pull Request: #${pullrequest.number}`,
        y_label: 'Número de comentarios de revisión'
    };
    printMeanChart(reviewCommentsConfig);
}

/**
 * Prints additions vs deletions donut chart.
 * 
 * @param {Object} pullrequest  pull request object
 */
function printPullRequestAdditionsDeletionsChart(pullrequest) {
    $(`#pullrequest_adddel_chart_segment`).removeClass('loading');
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#pullrequest_adddel_chart`,
        data: {
            columns: [
                ['Añadidas', pullrequest.additions],
                ['Eliminadas', pullrequest.deletions]
            ],
            type: 'donut',
            colors: {
                Añadidas: '#2ca02c',
                Eliminadas: '#d62728'
            }
        },
        donut: {
            title: 'Líneas de código'
        }
    });
}

/**
 * Configures the pull request repository filter.
 * 
 * @param {number} page         page number.
 * @param {Object} repository   repository object.
 */
function configurePullrequestsFilter(page, repository) {
    $('#pullrequests_filter_repositories').html('');
    $.get(`/api/repos/all`)
        .done(function (result) {
            result.map(function (repo) {
                var item = $('<div>', {
                    class: 'item',
                    "data-value": repo,
                    html: repo
                });
                $('#pullrequests_filter_repositories').append(item);
            });

            if (repository != undefined) {
                $('#pullrequests_title').html(`Pull Requests (${repository.owner}/${repository.name})`);
                $('#pullrequests_filter_dropdown').dropdown('set selected', `${repository.owner}/${repository.name}`);
            }

            $('#pullrequests_filter_dropdown').dropdown({
                onChange: function (value, text) { handlePullrequestsFilter(value); }
            });
        });
}

/**
 * Handles pull request list filtering.
 * 
 * @param {string} value    filter selected value.
 */
function handlePullrequestsFilter(value) {
    var order = $('#pullrequests_order_dropdown').dropdown('get value');
    if (order === '') {
        app.setLocation(`#/pullrequests/filter/${value}/page/1`);
    } else {
        var repository = repositoryStringToObject(value);
        handlePullrequestsOrder(order, repository);
    }
}

/**
 * Prints the list of pull requests.
 * 
 * @param {Array} items Pull request items.
 */
function printPullRequestItems(items) {
    $('#pullrequest_list').html('');
    items.map(function (item) {
        $('#pullrequest_list').append(pullrequestItem(item));
    });
}

/**
 * Creates a pull request list item.
 * 
 * @param {Object} pullrequestData  Pull request data object.
 */
function pullrequestItem(pullrequestData) {
    const item = $('<div>', {
        class: 'item',
        html: $('<div>', {
            class: 'content',
            html: [
                $('<a>', {
                    text: pullrequestData.title,
                    class: 'header',
                    href: `/#/pullrequest/${pullrequestData.base.repo.owner.login}/${pullrequestData.base.repo.name}/${pullrequestData.number}`
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
                            class: 'hashtag icon'
                        }),
                        pullrequestData.number,
                        ' | ',
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