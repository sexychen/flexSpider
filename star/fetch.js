var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var IMG_DIR = './imgs/'
const IMG_PREFIX = 'http://moviepic.manmankan.com/yybpic/yanyuan';

function fetchBrand() {
    var pageUrls = [
        // 内地男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/neidi/nanmingxing.shtml',
            area: 'neidi',
            gender: 1
        },
        // 内地女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/neidi/nvmingxing.shtml',
            area: 'neidi',
            gender: 2
        },
        // 香港男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/xianggang/nanmingxing.shtml',
            area: 'xianggang',
            gender: 1
        },
        // 香港女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/xianggang/nvmingxing.shtml',
            area: 'xianggang',
            gender: 2
        },
        // 台湾男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/taiwan/nanmingxing.shtml',
            area: 'taiwan',
            gender: 1
        },
        // 台湾女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/taiwan/nvmingxing.shtml',
            area: 'taiwan',
            gender: 2
        },
        // 日本男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/riben/nanmingxing.shtml',
            area: 'riben',
            gender: 1
        },
        // 日本女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/riben/nvmingxing.shtml',
            area: 'riben',
            gender: 2
        },
        // 韩国男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/hanguo/nanmingxing.shtml',
            area: 'hanguo',
            gender: 1
        },
        // 韩国女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/hanguo/nvmingxing.shtml',
            area: 'hanguo',
            gender: 2
        },
        // 欧美男
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/oumei/nanmingxing.shtml',
            area: 'oumei',
            gender: 1
        },
        // 欧美女
        {
            url: 'http://www.manmankan.com/dy2013/mingxing/oumei/nvmingxing.shtml',
            area: 'oumei',
            gender: 2
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
                var html = iconv.decode(body, 'gb2312')
                var $ = cheerio.load(html)
                var stars = $('a', '#mx_1')
                for (var i = 0; i < stars.length; i++) {

                    // 跳转的链接
                    var path = stars.eq(i).attr('href')
                    if (!path || path === null) {
                        continue;
                    }

                    var id = path.substring(path.lastIndexOf('/') + 1, path.indexOf('shtml') - 1)

                    fetchData.push({
                        id,
                        name: stars.eq(i).attr('title'),
                        gender: urlItem.gender,
                        area: urlItem.area,
                        avatar: `${IMG_PREFIX}/${id}.jpg`
                    });
                }
                html= undefined;
                $ = undefined;
                stars = undefined;
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
            console.log('明星姓名抓取完毕！')
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

    var reptileMove = function (star, callback) {
        if (star.avatar && star.avatar !== null) {
            request({ uri: star.avatar, encoding: 'binary' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    fs.writeFile(IMG_DIR + star.id + '_1.jpg', body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',name=' + star.name + ',avatar=' + star.avatar); }
                    });
                }
            });
        }
        callback(null, 'Call back content');
    };

    async.mapLimit(
        fetchData, 1,
        function (star, callback) {
            reptileMove(star, callback);
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('明星图片下载成功')
            console.log('----------------------------')
            // fs.writeFileSync('data.json', JSON.stringify(fetchData))
        }
    );
}

/**
 * node --max-old-space-size=3072 fetch
 */
fetchBrand()