function test(){
    var text = '22.98-35.48万';
    var index = text.indexOf('-');
    console.error('min=' + text.substring(0, index));
    console.error('max=' + text.substring(index+1, text.length-1));
}

test();