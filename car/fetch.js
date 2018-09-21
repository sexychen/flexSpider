var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var LOGO_IMG_DIR = './logo/'
var CAR_IMG_DIR = './imgs/'
var MIN_PRICE = 10000000

function fetchBrand() {
    var pageUrls = []
    // var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    var chars = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (var char of chars) {
        pageUrls.push(
            {
                char,
                url: 'http://www.autohome.com.cn/grade/carhtml/' + char + '.html'
            }
        );
    }

    var reptileMove = function (urlItem, callback) {
        request(
            {
                url: urlItem.url,
                encoding: null,
            },
            function (err, res, body) {
                if (err || res.statusCode != 200) {
                    console.error(err)
                    return false
                }

                var html = iconv.decode(body, 'gb2312')
                var $ = cheerio.load(html)
                var curBrands = $('dl')
                for (var i = 0; i < curBrands.length; i++) {
                    var obj = {
                        char: urlItem.char,
                        bCode: curBrands.eq(i).attr('id'),
                        bName: curBrands.eq(i).find('dt div a').text(),
                        logo: 'http:' + curBrands.eq(i).find('dt a img').attr('src')
                    }
                    // 单位: 万
                    var brandMinPirce = MIN_PRICE, brandMaxPirce = 0;
                    var series = [];

                    var curSeriesBase = curBrands.eq(i).find('h4')
                    for (var j = 0; j < curSeriesBase.length; j++) {
                        var curSeries = curSeriesBase.eq(j).find('a')

                        var priceBaseDiv = undefined, imgBaseDiv = undefined;
                        var nextBaseDiv = curSeriesBase.eq(j).next()
                        var nextBaseDivA = nextBaseDiv.find('a')

                        // 如果只有一个A,则是指导价的div,再下一个才是图库的div
                        if (nextBaseDivA && nextBaseDivA.length <= 1) {
                            priceBaseDiv = nextBaseDiv;
                            imgBaseDiv = nextBaseDiv.next();
                        }
                        // 如果是多于一个A,则是缺少指导价,直接就是图库的div
                        else {
                            imgBaseDiv = nextBaseDiv;
                        }

                        // 计算指导价的最低价和最高价
                        var priceData = {};
                        if (priceBaseDiv) {
                            // 22.98-35.48万
                            var priceText = priceBaseDiv.find('a').eq(0).text();
                            if (priceText && priceText.length > 3 && priceText.indexOf('-') > 0) {
                                var index = priceText.indexOf('-');
                                var minP = priceText.substring(0, index);
                                var maxP = priceText.substring(index + 1, priceText.length - 1)
                                priceData = {
                                    sMinP: Number(minP),
                                    sMaxP: Number(maxP)
                                }

                                // 同时计算品牌的最低价和最高价
                                if (Number(minP) < brandMinPirce) {
                                    brandMinPirce = Number(minP);
                                }
                                if (Number(maxP) > brandMaxPirce) {
                                    brandMaxPirce = Number(maxP);
                                }
                            }
                        }

                        // 除了图片的数据先丢进去
                        series.push({
                            sCode: curSeriesBase.eq(j).parent().attr('id'),
                            sName: curSeries.eq(0).text(),
                            ...priceData,
                            page: 'http:' + imgBaseDiv.children().first().next().attr('href')
                        })
                    }

                    // 品牌的最低价和最高价
                    if (brandMinPirce != MIN_PRICE) {
                        obj.bMinP = brandMinPirce;
                    }
                    if (brandMaxPirce != 0) {
                        obj.bMaxP = brandMaxPirce;
                    }
                    obj.series = series;

                    // 当前车的品牌
                    fetchData.push(obj)

                }
                html= undefined;
                $ = undefined;
                curBrands = undefined;
                callback(null, urlItem.url + 'Call back content')
            }
        );
    };

    async.mapLimit(
        pageUrls, 1,
        function (urlItem, callback) {
            reptileMove(urlItem, callback)
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('品牌车系抓取完毕！')
            console.log('----------------------------')
            fetchImgUrl()
        }
    );
}

/**
 * 爬取车身外观的图片地址
 */
function fetchImgUrl() {
    var seriesArr = []
    // 轮询所有车系
    for (var brand of fetchData) {
        for (var series of brand.series) {
            seriesArr.push(series)
        }
    }

    var reptileMove = function (series, callback) {
        request({
            url: series.page,
            encoding: null
        }, function (err, res, body) {

            if (err || res.statusCode != 200) {
                console.error(err)
                return false
            }

            var html = iconv.decode(body, 'gb2312')
            var $ = cheerio.load(html);
            var listDivs = $('.carpic-list03');
            var firstImgDiv = undefined, secondImgDiv = undefined;
            for (var k = 0; k < listDivs.length; k++) {
                if (listDivs.eq(k).prev().children().first().text() === '车身外观') {
                    firstImgDiv = listDivs.eq(k);
                }
                else if(listDivs.eq(k).prev().children().first().text() === '中控方向盘'){
                    secondImgDiv = listDivs.eq(k);
                }
            }
            // 车身外观的ui
            var firstUl = firstImgDiv && firstImgDiv != null ? firstImgDiv.children().first() : undefined;
            var secondUl = secondImgDiv && secondImgDiv != null ? secondImgDiv.children().first() : undefined;
            var sourcePath1 = firstUl && firstUl != null ? firstUl.children().first().children().first().children().first().attr('src') : undefined;
            var sourcePath2 = firstUl && firstUl != null ? firstUl.children().first().next().children().first().children().first().attr('src') : undefined;
            var sourcePath3 = secondUl && secondUl != null ? secondUl.children().first().children().first().children().first().attr('src') : undefined;
            series.img1 = sourcePath1 && sourcePath1 != null ? 'http:' + sourcePath1.replace('/t_', '/') : 'null'
            series.img2 = sourcePath2 && sourcePath2 != null ? 'http:' + sourcePath2.replace('/t_', '/') : 'null'
            series.img3 = sourcePath3 && sourcePath3 != null ? 'http:' + sourcePath3.replace('/t_', '/') : 'null'
            html = undefined
            $ = undefined
            listDivs = undefined
            firstImgDiv = undefined
            callback(null, series.page + 'Call back content');
        });
    };

    async.mapLimit(
        seriesArr, 1,
        function (series, callback) {
            reptileMove(series, callback)
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('车身图片地址抓取成功')
            console.log('----------------------------')
            // fs.writeFileSync('data.json', JSON.stringify(fetchData))
            fetchImg()
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
                    fs.writeFile(LOGO_IMG_DIR + brandCar.bCode + '_1.jpg', body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',bCode=' + brandCar.bCode + ',img=' + brandCar.logo); }
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
            console.log('----------------------------')
            console.log('logo图片下载成功')
            console.log('----------------------------')
            // fs.writeFileSync('data.json', JSON.stringify(fetchData))
            // fetchImg()
        }
    );
}

/**
 * 下载车身外观的图片
 */
function fetchImg() {
    var seriesArr = []
    // 轮询所有车系
    for (var brand of fetchData) {
        for (var series of brand.series) {
            seriesArr.push(series)
        }
    }

    var reptileMove = function (series, callback) {
        // if (series.img1 != 'null') {
        //     request({ uri: series.img1, encoding: 'binary' }, function (error, response, body) {
        //         if (!error && response.statusCode == 200) {
        //             fs.writeFile(CAR_IMG_DIR + series.sCode + '_1.jpg', body, 'binary', function (err) {
        //                 if (err) { console.error('error:' + err + ',sCode=' + series.sCode + ',img=' + series.img1); }
        //             });
        //         }
        //     });
        // }
        // if (series.img2 != 'null') {
        //     request({ uri: series.img2, encoding: 'binary' }, function (error, response, body) {
        //         if (!error && response.statusCode == 200) {
        //             fs.writeFile(CAR_IMG_DIR + series.sCode + '_2.jpg', body, 'binary', function (err) {
        //                 if (err) { console.error('error:' + err + ',sCode=' + series.sCode + ',img=' + series.img2); }
        //             });
        //         }
        //     });
        // }
        if (series.img3 != 'null') {
            request({ uri: series.img3, encoding: 'binary' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    fs.writeFile(CAR_IMG_DIR + series.sCode + '_3.jpg', body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',sCode=' + series.sCode + ',img=' + series.img3); }
                    });
                }
            });
        }
        callback(null, 'Call back content');
    };

    async.mapLimit(
        seriesArr, 1,
        function (series, callback) {
            reptileMove(series, callback);
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('车身图片下载成功')
            console.log('----------------------------')
            // fs.writeFileSync('data.json', JSON.stringify(fetchData))
        }
    );
}

/**
 * node --max-old-space-size=3072 fetch
 */
fetchBrand()