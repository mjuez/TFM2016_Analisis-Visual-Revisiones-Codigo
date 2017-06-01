var app = Sammy('#content', function() {
    this.get('#/test', function() {
        var container = this.$element();
        container.html('test');
    });
});