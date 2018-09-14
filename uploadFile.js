var ossClient = require('ali-oss')
var client = new ossClient({
  region: '*******',
  accessKeyId: '*******',
  accessKeySecret: '*******',
  bucket: '*******'
});

function put() {
  try {
    var result = client.put('imgs.tar.gz', './imgs.tar.gz');
    console.log(result);
  } catch (e) {
      console.log(e);
  }
}
put();