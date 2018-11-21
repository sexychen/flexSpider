var fs = require('fs')

function init() {
    fs.readFile('/Users/sexychen/myFile/work/console/animal/animal_result', 'utf8', function(err, data) {
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
        var animal = jsonData[index];
        var medias = undefined;
        if (animal.path && animal.path !== '') {
            var newPath = '';
            medias = `[{"path":"${newPath}","mediaType":0}]`
        }
        var newBrandSQL = '';
        brandSQL = brandSQL + newBrandSQL;
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/console/animal/sql.json', brandSQL)
}

init()
