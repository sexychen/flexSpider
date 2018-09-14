var fs = require('fs');

function analysis() {

    fs.readFile('/Users/sexychen/myFile/work/shell/car/data.json', "utf8", function (err, data) {
        if (!data) {
            console.error('data is null');
            return;
        }
        var jsonData = JSON.parse(data);
        if (!jsonData || jsonData.length <= 0) {
            console.error('parse json error');
            return;
        }

        for (let index = 0; index < jsonData.length; index++) {
            var car = jsonData[index];
            // if (car.bMaxP && car.bMaxP >= 100 && car.bMinP && car.bMinP >= 30) {
            if (!car.bMaxP && !car.bMinP && car.bName.match(/^[a-zA-Z]+/)) {
                console.error(car.bName + ': ' + car.series[0].page);
            }
        }
    });
}

analysis();