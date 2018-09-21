var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var brandMap = {}
var LOGO_IMG_DIR = './logo_large/'

function fetchBrand() {
    var pageUrls = []
    for (let index = 1; index <= 287; index++) {
    // for (let index = 87; index <= 87; index++) {
        pageUrls.push('https://chebiao.911cha.com/'+ index +'.html')
    }

    // 读取本地的json文件
    var data = fs.readFileSync('/Users/sexychen/myFile/work/code/project/my/flexSpider/car/convert.json');
    var brandJsonData = JSON.parse(data);
    if (brandJsonData && brandJsonData.length > 0) {
        brandJsonData.forEach(car => {
            brandMap[car.bName] = car.bCode;
        });
    }

    var reptileMove = function (url, callback) {
        request(
            {
                url,
                encoding: null,
            },
            function (err, res, body) {
                if (err || res.statusCode != 200) {
                    console.error(err)
                    return false
                }

                var html = iconv.decode(body, 'utf-8')
                var $ = cheerio.load(html)
                var brandNode = $('h2')
                if (brandNode && brandNode != null && brandNode.next() && brandNode.next() != null) {
                    var imgNode = brandNode.next();
                    var bName = imgNode.attr('alt');
                    var logo = imgNode.attr('src');

                    // 关联品牌
                    var bCode = brandMap[bName];

                    if (bName && logo && bName != null && logo!= null) {
                        fetchData.push({
                            bName,
                            logo: logo.replace('/s/', '/'),
                            bCode
                        })
                    }
                }

                html= undefined;
                $ = undefined;
                brandNode = undefined;
                callback(null, url + ' Call back content')
            }
        );
    };

    async.mapLimit(
        pageUrls, 1,
        function (url, callback) {
            reptileMove(url, callback)
        },
        function (err, result) {
            console.log('-----------数据抓取ok-----------')
            // fs.writeFileSync('logo.json', JSON.stringify(fetchData))
            fetchLogo()
        }
    );
}

/**
 * 下载车logo图片
 */
function fetchLogo() {
    var brandCarArr = []
    // 轮询所有车系
    for (var brandCar of fetchData) {
        brandCarArr.push(brandCar)
    }

    var reptileMove = function (brandCar, callback) {
        if (brandCar.logo && brandCar.logo != null && brandCar.logo != 'null') {
            request({ uri: brandCar.logo, encoding: 'binary' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var name = brandCar.bCode ? brandCar.bCode + '_2.jpg' : brandCar.bName + '.jpg';
                    fs.writeFile(LOGO_IMG_DIR + name, body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',bName=' + brandCar.bName + ',img=' + brandCar.logo); }
                    });
                }
            });
        }
        callback(null, brandCar.logo + 'Call back content');
    };

    async.mapLimit(
        brandCarArr, 1,
        function (brandCar, callback) {
            reptileMove(brandCar, callback);
        },
        function (err, result) {
            console.log('-----------logo图片下载成功-----------')
        }
    );
}

/**
 * node --max-old-space-size=3072 fetch
 */
fetchBrand()