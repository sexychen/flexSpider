var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var imgDir = './imgs/'

function fetchBrand() {
    var pageUrls = []
    var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
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
                        series: [],
                    }

                    var curSeriesBase = curBrands.eq(i).find('h4')
                    for (var j = 0; j < curSeriesBase.length; j++) {
                        var curSeries = curSeriesBase.eq(j).find('a')

                        // 获取图库的baseDiv: 默认下一个元素,如果是指导价,则是再下一个;
                        var targetImgBaseDiv = curSeriesBase.eq(j).next()
                        var tmpTargetDivA = targetImgBaseDiv.find('a')
                        if (tmpTargetDivA && tmpTargetDivA.length <= 1) {
                            targetImgBaseDiv = targetImgBaseDiv.next()
                        }

                        // 除了图片的数据先丢进去
                        obj.series.push({
                            sCode: curSeriesBase.eq(j).parent().attr('id'),
                            sName: curSeries.eq(0).text(),
                            page: 'http:' + targetImgBaseDiv.children().first().next().attr('href')
                        })
                    }
                    fetchData.push(obj)
                }
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
 * 爬取图片地址
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
            var selectedImdDiv;
            for (var k = 0; k < listDivs.length; k++) {
                if (listDivs.eq(k).prev().children().first().text() === '车身外观') {
                    selectedImdDiv = listDivs.eq(k);
                }
            }
            var sourcePath = selectedImdDiv && selectedImdDiv != null ? selectedImdDiv.children().first().children().first().children().first().children().first().attr('src') : undefined;
            series.img = sourcePath && sourcePath != null ? 'http:' + sourcePath.replace('/t_', '/') : 'null'
            html = undefined
            $ = undefined
            listDivs = undefined
            selectedImdDiv = undefined
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
            console.log('图片地址抓取成功')
            console.log('----------------------------')
            fetchImg()
        }
    );
}

/**
 * 爬取图片
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
        if (series.img != 'null') {
            request({ uri: series.img, encoding: 'binary' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    fs.writeFile(imgDir + series.sCode + '_1.jpg', body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',sCode=' + series.sCode + ',img=' + series.img); }
                    });
                }
                else {
                    series.error = '1'
                }
            });
        }
        callback(null, series.img + 'Call back content');
    };

    async.mapLimit(
        seriesArr, 1,
        function (series, callback) {
            reptileMove(series, callback);
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('图片下载成功')
            console.log('----------------------------')
            fs.writeFileSync('data.json', JSON.stringify(fetchData))
        }
    );
}

fetchBrand()

