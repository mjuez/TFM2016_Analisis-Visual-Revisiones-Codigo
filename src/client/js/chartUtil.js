function printMeanChart(config) {
    $(`#${config.container}_segment`).removeClass('loading');
    var data = ['data1', config.value];
    var meanData = ['data2', config.mean];
    c3.generate({
        padding: {
            right: 10
        },
        bindto: `#${config.container}`,
        data: {
            columns: [
                data,
                meanData
            ],
            type: 'bar',
            names: {
                data1: `${config.column_legend}`,
                data2: `Media`
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: ['Suma']
            },
            y: {
                label: config.y_label
            }
        }
    });
}