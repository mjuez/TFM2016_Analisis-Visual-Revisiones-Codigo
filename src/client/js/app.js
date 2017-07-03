/**
 * Sammy routes.
 * @author Mario Juez <mario[at]mjuez.com>
 */

var app = Sammy('#content', function (app) {

    app.helper('getRepositoriesPage', function(page) {
      setActiveMenuItem('repositories');
        var container = this.$element();
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/page/${page}`;
            loadRepositoryList(apiUrl, page, '/#/repositories/page');
        });
    });

    app.helper('getPullRequestsPage', function(page) {
      setActiveMenuItem('pullrequests');
        var container = this.$element();
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/page/${page}`;
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/page');
        });
    });

    app.helper('getUsersPage', function(page) {
      setActiveMenuItem('users');
        var container = this.$element();
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/page/${page}`;
            loadUsersList(apiUrl, page, '/#/users/page');
        });
    });

    //////////
    // HOME //
    //////////

    this.get('#/', function () {
        setActiveMenuItem('home');
        var container = this.$element();
        container.load('/_home.html', function () { bindHomeListeners(); });
    });

    this.get('#/home', function () {
        this.redirect('#/');
    });

    //////////////////
    // REPOSITORIES //
    //////////////////

    this.get('#/repository/:owner/:repository', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        container.load('/_repository.html', function () {
            loadRepository(owner, repository);
        });
    });

    this.get('#/repositories', function () {
        this.getRepositoriesPage(1);
    });

    this.get('#/repositories/page/:page', function () {
        var page = this.params['page'];
        this.getRepositoriesPage(page);
    });

    this.get('#/repositories/order/date/asc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/date/asc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'date_asc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/date/asc/page');
        });
    });

    this.get('#/repositories/order/date/desc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/date/desc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'date_desc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/date/desc/page');
        });
    });

    this.get('#/repositories/order/name/asc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/name/asc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'name_asc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/name/asc/page');
        });
    });

    this.get('#/repositories/order/name/desc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/name/desc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'name_desc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/name/desc/page');
        });
    });

    this.get('#/repositories/order/reviews/asc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/reviews/asc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'reviews_asc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/reviews/asc/page');
        });
    });

    this.get('#/repositories/order/reviews/desc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/reviews/desc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'reviews_desc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/reviews/desc/page');
        });
    });

    this.get('#/repositories/order/pullrequests/asc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/pullrequests/asc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'pulls_asc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/pullrequests/asc/page');
        });
    });

    this.get('#/repositories/order/pullrequests/desc/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/order/pullrequests/desc/page/${page}`;
            $('#repositories_order_dropdown').dropdown('set selected', 'pulls_desc');
            loadRepositoryList(apiUrl, page, '/#/repositories/order/pullrequests/desc/page');
        });
    });

    ///////////////////
    // PULL REQUESTS //
    ///////////////////

    this.get('#/pullrequest/:owner/:repository/:number', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var number = this.params['number'];
        container.load('/_pullrequest.html', function () {
            loadPullRequest(owner, repository, number);
        });
    });

    this.get('#/pullrequests', function () {
        this.getPullRequestsPage(1);
    });

    this.get('#/pullrequests/page/:page', function () {
        var page = this.params['page'];
        this.getPullRequestsPage(page);
    });

    this.get('#/pullrequests/order/date/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/date/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'date_asc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/date/asc/page');
        });
    });

    this.get('#/pullrequests/order/date/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/date/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'date_desc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/date/desc/page');
        });
    });

    this.get('#/pullrequests/order/name/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/name/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'name_asc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/name/asc/page');
        });
    });

    this.get('#/pullrequests/order/name/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/name/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'name_desc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/name/desc/page');
        });
    });

    this.get('#/pullrequests/order/reviews/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/reviews/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'reviews_asc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/reviews/asc/page');
        });
    });

    this.get('#/pullrequests/order/reviews/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/order/reviews/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'reviews_desc');
            loadPullrequestsList(apiUrl, page, '/#/pullrequests/order/reviews/desc/page');
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/date/asc/page/${page}`;
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/date/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/date/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'date_asc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/date/asc/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/date/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/date/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'date_desc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/date/desc/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/name/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/name/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'name_asc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/name/asc/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/name/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/name/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'name_desc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/name/desc/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/reviews/asc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/reviews/asc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'reviews_asc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/reviews/asc/page`, { owner, name: repository });
        });
    });

    this.get('#/pullrequests/filter/:owner/:repository/order/reviews/desc/page/:page', function () {
        setActiveMenuItem('pullrequests');
        var container = this.$element();
        var owner = this.params['owner'];
        var repository = this.params['repository'];
        var page = this.params['page'];
        container.load('/_pullrequests.html', function () {
            var apiUrl = `/api/pulls/filter/repo/${owner}/${repository}/order/reviews/desc/page/${page}`;
            $('#pullrequests_order_dropdown').dropdown('set selected', 'reviews_desc');
            loadPullrequestsList(apiUrl, page, `/#/pullrequests/filter/${owner}/${repository}/order/reviews/desc/page`, { owner, name: repository });
        });
    });

    ///////////
    // USERS //
    ///////////

    this.get('#/user/:login', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var login = this.params['login'];
        container.load('/_user.html', function () {
            loadUser(login);
        });
    });

    this.get('#/users', function () {
        this.getUsersPage(1);
    });

    this.get('#/users/page/:page', function () {
        var page = this.params['page'];
        this.getUsersPage(page);
    });

    this.get('#/users/order/date/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/date/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'date_asc');
            loadUsersList(apiUrl, page, '/#/users/order/date/asc/page');
        });
    });

    this.get('#/users/order/date/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/date/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'date_desc');
            loadUsersList(apiUrl, page, '/#/users/order/date/desc/page');
        });
    });

    this.get('#/users/order/name/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/name/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'name_asc');
            loadUsersList(apiUrl, page, '/#/users/order/name/asc/page');
        });
    });

    this.get('#/users/order/name/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/name/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'name_desc');
            loadUsersList(apiUrl, page, '/#/users/order/name/desc/page');
        });
    });

    this.get('#/users/order/pullrequests/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/pullrequests/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'pulls_asc');
            loadUsersList(apiUrl, page, '/#/users/order/pullrequests/asc/page');
        });
    });

    this.get('#/users/order/pullrequests/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/pullrequests/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'pulls_desc');
            loadUsersList(apiUrl, page, '/#/users/order/pullrequests/desc/page');
        });
    });

    this.get('#/users/order/reviews/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'reviews_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/asc/page');
        });
    });

    this.get('#/users/order/reviews/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'reviews_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/desc/page');
        });
    });

    this.get('#/users/order/reviews/approved/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/approved/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'approved_reviews_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/approved/asc/page');
        });
    });

    this.get('#/users/order/reviews/approved/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/approved/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'approved_reviews_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/approved/desc/page');
        });
    });

    this.get('#/users/order/reviews/changes_requested/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/changes_requested/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'changes_requested_reviews_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/changes_requested/asc/page');
        });
    });

    this.get('#/users/order/reviews/changes_requested/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/changes_requested/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'changes_requested_reviews_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/changes_requested/desc/page');
        });
    });

    this.get('#/users/order/reviews/commented/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/commented/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'commented_reviews_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/commented/asc/page');
        });
    });

    this.get('#/users/order/reviews/commented/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/commented/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'commented_reviews_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/commented/desc/page');
        });
    });

    this.get('#/users/order/reviews/dismissed/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/dismissed/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'dismissed_reviews_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/dismissed/asc/page');
        });
    });

    this.get('#/users/order/reviews/dismissed/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviews/dismissed/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'dismissed_reviews_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviews/dismissed/desc/page');
        });
    });

    this.get('#/users/order/reviewcomments/asc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviewcomments/asc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'review_comments_asc');
            loadUsersList(apiUrl, page, '/#/users/order/reviewcomments/asc/page');
        });
    });

    this.get('#/users/order/reviewcomments/desc/page/:page', function () {
        setActiveMenuItem('users');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_users.html', function () {
            var apiUrl = `/api/users/order/reviewcomments/desc/page/${page}`;
            $('#users_order_dropdown').dropdown('set selected', 'review_comments_desc');
            loadUsersList(apiUrl, page, '/#/users/order/reviewcomments/desc/page');
        });
    });

    ///////////////
    // NOT FOUND //
    ///////////////

    this.notFound = function () {
        var container = this.$element();
        container.load('/_error.html');
    }

});