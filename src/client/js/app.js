var app = Sammy('#content', function () {

    this.get('#/', function () {
        setActiveMenuItem('home');
        var container = this.$element();
        container.load('/_home.html', function () { bindHomeListeners(); });
    });

    this.get('#/home', function () {
        this.redirect('#/');
    });

    this.notFound = function () {
        var container = this.$element();
        container.load('/_error.html');
    }

});