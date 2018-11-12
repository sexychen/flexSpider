var fs = require('fs');
var readline = require('readline');

function analysis() {
    fs.readFile('/Users/sexychen/myFile/work/code/project/my/flexSpider/star/data.json', "utf8", function (err, data) {
        if (!data) {
            console.error('data is null');
            return;
        }
        var jsonData = JSON.parse(data);
        if (!jsonData || jsonData.length <= 0) {
            console.error('parse json error');
            return;
        }

        findLost(jsonData)
    });
}

function findLost(jsonData) {
    var data = [];
    for (let index = 0; index < jsonData.length; index++) {
        var star = jsonData[index];
        data.push(star)
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/code/project/my/flexSpider/star/lost', JSON.stringify(data))
}

analysis();