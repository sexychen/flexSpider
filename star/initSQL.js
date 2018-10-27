var fs = require('fs')

function init() {
    fs.readFile('/Users/sexychen/myFile/work/code/project/my/flexSpider/star/data.json', 'utf8', function(err, data) {
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

    var brandSQL = '';
    for (let index = 0; index < jsonData.length; index++) {
        var star = jsonData[index];
        var path = '';
        var newBrandSQL = '';
        brandSQL = brandSQL + newBrandSQL;
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/code/project/my/flexSpider/star/sql.json', brandSQL)
}

init()
