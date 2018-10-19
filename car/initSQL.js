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
                    for (let j = 0; j < series.imgs.length; j++) {
                        var img = series.imgs[j];
                        medias = medias + '{\"path\":\"' + img.path+ '\",\"mediaType\":0}';
                        if (j != series.imgs.length - 1) {
                            medias = medias + ',';
                        }
                    }
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
