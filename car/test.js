




function test(){
    var path = 'ewewewewewe99,';
    if (path.endsWith(',')) {
        path = path.substring(0, path.length - 1);
    }
    console.error(path);
}

test();