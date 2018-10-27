




function test(){
    var path = 'http://www.manmankan.com/dy2013/mingxing/201301/189.shtml';
    console.error(path.lastIndexOf('/'));
    console.error(path.indexOf('shtml'));
    console.error(path.substring(path.lastIndexOf('/') + 1, path.indexOf('shtml') - 1));
    console.error(path.substring(47, 53));
}

test();