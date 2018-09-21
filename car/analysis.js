var fs = require('fs');
var readline = require('readline');

const CONST_VALUE = '1';
function analysis() {
    fs.readFile('/Users/sexychen/myFile/work/console/car/data.json', "utf8", function (err, data) {
        if (!data) {
            console.error('data is null');
            return;
        }
        var jsonData = JSON.parse(data);
        if (!jsonData || jsonData.length <= 0) {
            console.error('parse json error');
            return;
        }

        replaceImgPath(jsonData)

        // extractBrand(jsonData);

        // filterPrice(jsonData);
    });
}

// 替换logo和车身外观的图片地址为线上的地址
function replaceImgPath(jsonData) {
    // logo文件: /Users/sexychen/myFile/work/console/car/logo_name
    var logoNameMap = {};
    var fRead = fs.createReadStream('/Users/sexychen/myFile/work/console/car/logo_name');
    var objReadline = readline.createInterface({
        input: fRead
    });
    objReadline.on('line',function (line) {
        logoNameMap[line] = CONST_VALUE;
    });
    objReadline.on('close',function () {
        readAppearanceName(logoNameMap, jsonData);
    });
}

function readAppearanceName(logoNameMap, jsonData) {
    // 外观文件: /Users/sexychen/myFile/work/console/car/appearance_name
    var appearanceNameMap = {};
    var fRead2 = fs.createReadStream('/Users/sexychen/myFile/work/console/car/appearance_name');
    var objReadline2 = readline.createInterface({
        input: fRead2
    });
    objReadline2.on('line',function (line) {
        appearanceNameMap[line] = CONST_VALUE
    });
    objReadline2.on('close',function () {
        doReplace(logoNameMap, appearanceNameMap, jsonData);
    });
}

function doReplace(logoNameMap, appearanceNameMap, jsonData){
    // 判断源数据的是否存在logo和车身外观的真实文件
    for (let index = 0; index < jsonData.length; index++) {
        var car = jsonData[index];
        var logoSmallName = car.bCode + '_1';
        var logoLargeName = car.bCode + '_2';
        // 存在logo大图
        if (logoNameMap[logoLargeName] === CONST_VALUE) {
            car.logo = 'https://img.117sport.com/miniprogram/car/garage/logo/' + logoLargeName + '.jpg';
        }
        // 只有小图,同时打个标
        else if (logoNameMap[logoSmallName] === CONST_VALUE){
            car.logo = 'https://img.117sport.com/miniprogram/car/garage/logo/' + logoSmallName + '.jpg';
            car.sLogo = true;
        }

        // 每个车系车身外观的处理
        var series = car.series;
        for (let index = 0; index < series.length; index++) {
            const carSeries = series[index];
            carSeries.imgs = [];

            // 三张图
            var first = carSeries.sCode + '_1';
            if (appearanceNameMap[first] === CONST_VALUE) {
                carSeries.imgs.push({
                    path: 'https://img.117sport.com/miniprogram/car/garage/appearance/' + first + '.jpg'
                })
            }

            var second = carSeries.sCode + '_2';
            if (appearanceNameMap[second] === CONST_VALUE) {
                carSeries.imgs.push({
                    path: 'https://img.117sport.com/miniprogram/car/garage/appearance/' + second + '.jpg'
                })
            }

            var third = carSeries.sCode + '_3';
            if (appearanceNameMap[third] === CONST_VALUE) {
                carSeries.imgs.push({
                    path: 'https://img.117sport.com/miniprogram/car/garage/appearance/' + third + '.jpg'
                })
            }

            // 清除不需要的数据
            carSeries.img1 = undefined;
            carSeries.img2 = undefined;
            carSeries.img3 = undefined;
            carSeries.page = undefined;
        }
    }

    // 重新排个序
    var newJsonData = []
    jsonData.forEach(element => {
        newJsonData.push({
            char: element.char,
            bCode: element.bCode,
            bName: element.bName,
            sLogo: element.sLogo,
            logo: element.logo,
            bMinP: element.bMinP,
            bMaxP: element.bMaxP,
            series: element.series
        });
    });

    // 保存替换之后的json
    fs.writeFileSync('/Users/sexychen/myFile/work/console/car/data_replace_img.json', JSON.stringify(newJsonData));

}

// 转换成特定的格式
function extractBrand(jsonData) {

    var data = [];
    for (let index = 0; index < jsonData.length; index++) {
        var car = jsonData[index];
        data.push({
            bName: car.bName,
            bCode: car.bCode
        })
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/console/car/convert.json', JSON.stringify(data))
}

// 过滤价格
function filterPrice(jsonData) {
    for (let index = 0; index < jsonData.length; index++) {
        var car = jsonData[index];
        // if (car.bMaxP && car.bMaxP >= 100 && car.bMinP && car.bMinP >= 30) {
        if (!car.bMaxP && !car.bMinP && car.bName.match(/^[a-zA-Z]+/)) {
            console.error(car.bName + ': ' + car.series[0].page);
        }
    }
}

analysis();