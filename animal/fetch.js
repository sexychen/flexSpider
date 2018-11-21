var request = require('request'),
    async = require('async'),
    fs = require('fs');

var fetchData = []
var IMG_DIR = '/Users/sexychen/myFile/work/console/animal/imgs/'

function fetchBrand() {
    // var pageUrls = [
    //     // 哺乳类
    //     {
    //         url: 'http://www.aidongwu.net/mammals',
    //         type: 1
    //     },
    //     // 鸟类
    //     {
    //         url: 'http://www.aidongwu.net/bird',
    //         type: 2
    //     },
    //     // 鱼类
    //     {
    //         url: 'http://www.aidongwu.net/fish',
    //         type: 3
    //     },
    //     // 爬行类
    //     {
    //         url: 'http://www.aidongwu.net/reptilia',
    //         type: 4
    //     },
    //     // 两栖类
    //     {
    //         url: 'http://www.aidongwu.net/amphibian',
    //         type: 5
    //     },
    //     // 无脊椎类(含昆虫)
    //     {
    //         url: 'http://www.aidongwu.net/invertebrate',
    //         type: 6
    //     }
    // ];

    // 直接从页面拷贝, 然后存到文件, 然后使用awk:
    // cat 6 | grep img | awk -F"\"" '{print $6"\t"$2}' > type_6
    // 然后运行fetch解析成json, 下载文件;

    var index = 1;
    for (let i = 1; i < 7; i++) {

        var text = fs.readFileSync(`/Users/sexychen/myFile/work/console/animal/type_${i}`, 'utf8');

        // 将文件按行拆成数组
        text.split(/\r?\n/).forEach(function (line) {
            if (!line || line === '') {
                return;
            }

            var data = line.split('\t');
            fetchData.push({
                index: index++,
                name: data[0],
                path: data.length > 1 ? data[1] : '',
                type: i
            });
    
        });
    }

    fs.writeFileSync('/Users/sexychen/myFile/work/console/animal/animal_result', JSON.stringify(fetchData))

    // fetchImg();
}

/**
 * 下载图片
 */
function fetchImg() {
    var reptileMove = function (animal, callback) {
        if (animal.path && animal.path !== null && animal.path !== '') {
            request({ uri: animal.path, encoding: 'binary' }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    fs.writeFile(IMG_DIR + animal.index + '_1.jpg', body, 'binary', function (err) {
                        if (err) { console.error('error:' + err + ',name=' + animal.name + ',avatar=' + animal.path); }
                    });
                }
            });
        }
        callback(null, 'Call back content');
    };

    async.mapLimit(
        fetchData, 1,
        function (animal, callback) {
            reptileMove(animal, callback);
        },
        function (err, result) {
            console.log('----------------------------')
            console.log('图片下载成功')
            console.log('----------------------------')
        }
    );
}

/**
 * node --max-old-space-size=3072 fetch
 */
fetchBrand()