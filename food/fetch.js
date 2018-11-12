var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var IMG_DIR = './imgs/'

function fetchBrand() {
    var pageUrls = [
        {
            url: 'https://home.meishichina.com/recipe-menu.html',
        }
    ];

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
                var html = iconv.decode(body, 'utf-8')
                var $ = cheerio.load(html)
                var h3s = $('h3')

                // 建个序号
                var tempCountMap = {};
                for (var i = 0; i < h3s.length; i++) {
                    var foodList = h3s.eq(i).next().children();
                    tempCountMap[i] = foodList.length;
                }

                for (var i = 0; i < h3s.length; i++) {

                    // 比它小的区块
                    var count = 0;
                    for (let index = 0; index < i; index++) {
                        count = count + tempCountMap[index];
                    }

                    // 跳转的链接
                    var foodList = h3s.eq(i).next().children();

                    // 每个专辑的菜谱
                    if (foodList && foodList.length > 0) {
                        for (var j = 0; j < foodList.length; j++) {
                            let a = foodList.eq(j).children().first();
                            let iii = ++count;
                            // console.error(iii);
                            fetchData.push({
                                id: iii,
                                name: a.attr('title'),
                                href: a.attr('href'),
                                medias: []
                            });
                        }
                    }
                }
                html= undefined;
                $ = undefined;
                h3s = undefined;
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
            console.log('菜谱抓取完毕！')
            console.log('----------------------------')
            fetchImgUrl()
        }
    );
}

/**
 * 轮询所有的foods
 */
function fetchImgUrl() {

    var reptileMove = function (food, callback) {
        request({
            url: food.href,
            encoding: null
        }, function (err, res, body) {

            if (err || res.statusCode != 200) {
                console.error(err)
                return false
            }

            var html = iconv.decode(body, 'utf-8')
            var $ = cheerio.load(html);
            
            var listDivs = $('.msb_list');
            var liList = listDivs.eq(0).children().first().children();

            for (var k = 0; k < liList.length && k < 10; k++) {
                var imgPath = liList.eq(k).children().first().children().first().children().first().attr('data-src');
                if (imgPath && imgPath != null) {
                    imgPath = imgPath.replace('?x-oss-process=style/c320', '');
                }
                food.medias.push({
                    path: imgPath
                });
            }
            
            html = undefined
            $ = undefined
            listDivs = undefined
            firstImgDiv = undefined
            callback(null, food.href + 'Call back content');
        });
    };

    async.mapLimit(
        fetchData, 1,
        function (food, callback) {
            reptileMove(food, callback)
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('美食图片地址抓取成功')
            console.log('----------------------------')
            fs.writeFileSync('data.json', JSON.stringify(fetchData))
            fetchImg()
        }
    );
}

/**
 * 下载图片
 */
function fetchImg() {
    var reptileMove = function (food, callback) {
        for (let index = 0; index < food.medias.length; index++) {
            const cIndex = index;
            const onePath = food.medias[cIndex].path;
            if (onePath && onePath != '' && onePath != 'null') {
                request({ uri: onePath, encoding: 'binary' }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        fs.writeFile(`${IMG_DIR}${food.id}_${cIndex+1}.jpg`, body, 'binary', function (err) {
                            if (err) { console.error('error:' + err + ',sCode=' + food.id + ',img=' + onePath); }
                        });
                    }
                });
            }
        }
        callback(null, 'Call back content');
    };

    async.mapLimit(
        fetchData, 1,
        function (food, callback) {
            reptileMove(food, callback);
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('美食图片下载成功')
            console.log('----------------------------')
        }
    );
}

/**
 * node --max-old-space-size=3072 fetch
 */
fetchBrand()