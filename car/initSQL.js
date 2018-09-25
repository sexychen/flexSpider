var fs = require('fs')

function init() {
    fs.readFile('/Users/sexychen/myFile/work/console/car/data_replace_img.json', 'utf8', function(err, data) {
        if (!data) {
            console.error('data is null')
            return
        }
        var jsonData = JSON.parse(data)
        if (!jsonData || jsonData.length <= 0) {
            console.error('parse json error')
            return
        }

        initSQL(jsonData)
    })
}

function initSQL(jsonData) {
    var brandSQL = '',
        seriesSQL = ''
    for (let index = 0; index < jsonData.length; index++) {
        var car = jsonData[index];
        var newBrandSQL = '';
        brandSQL = brandSQL + newBrandSQL;

        if (car.series && car.series.length > 0) {
            car.series.forEach(series => {
                var medias = '';
                if (series.imgs && series.imgs.length > 0) {
                    series.imgs.forEach(img => {
                        var path = '{\"path\":\"' + img.path+ '\",\"mediaType\":0}';
                        medias = medias + '{\"path\":\"' + img.path+ '\",\"mediaType\":0}' + ','
                    });
                }
                if (medias != '') {
                    medias = '[' + medias + ']';
                }

                // 生成每个系列的sql
                var newSeriesSQL = '';
                seriesSQL = seriesSQL + newSeriesSQL;
            });
        }
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/console/car/brand_sql.json', brandSQL)
    fs.writeFileSync('/Users/sexychen/myFile/work/console/car/series_sql.json', seriesSQL)
}

init()
