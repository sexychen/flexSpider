var fs = require('fs')

const path = '/Users/sexychen/myFile/work/code/project/my/flexSpider/food'
function init() {
    fs.readFile(`${path}/data.json`, 'utf8', function(err, data) {
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
    var foodSQL = ''
    for (let index = 0; index < jsonData.length; index++) {
        var food = jsonData[index];

        var medias = '';
        if (food.medias && food.medias.length > 0) {
            for (let j = 0; j < food.medias.length; j++) {
                var localFilePath = `${path}/avatar/${food.id}_${j+1}.jpg`;
                if(fsExistsSync(localFilePath)){
                    var newPath = ``;
                    medias = medias + '{\"path\":\"' + newPath + '\",\"mediaType\":0}';
                    if (j != food.medias.length - 1) {
                        medias = medias + ',';
                    }
                }
                else{
                    console.error(`food.id=${food.id},index=${j+1}`);
                }
            }
        }
        if (medias.endsWith(',')) {
            medias = medias.substring(0, medias.length - 1);
        }
        if (medias != '') {
            medias = '[' + medias + ']';
        }

        var newSeriesSQL = '';

        foodSQL = foodSQL + newSeriesSQL;
    }

    fs.writeFileSync(`${path}/sql.json`, foodSQL);
}

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

init()
