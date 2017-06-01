var app = Sammy('#content', function () {

    this.get('#/', function () {
        setActiveMenuItem('home');
        var container = this.$element();
        container.load('/_home.html', function () { bindHomeListeners(); });
    });

    this.get('#/home', function () {
        this.redirect('#/');
    });

    this.get('#/repositories', function () {
        this.redirect('#/repositories/page/1');
    });

    this.get('#/repositories/page/:page', function () {
        setActiveMenuItem('repositories');
        var container = this.$element();
        var page = this.params['page'];
        container.load('/_repositories.html', function () {
            var apiUrl = `/api/repos/page/${page}`;
            loadRepositoryList(apiUrl, page, '/#/repositories/page');
        });
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

    this.notFound = function () {
        var container = this.$element();
        container.load('/_error.html');
    }

});