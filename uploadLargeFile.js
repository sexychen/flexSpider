let OSS = require('ali-oss')
let client = new OSS({
  region: '<Your region>',
  accessKeyId: '<Your AccessKeyId>',
  accessKeySecret: '<Your AccessKeySecret>',
  bucket: 'Your bucket name'
});

async function multipartUpload () {
  try {
    let result = await client.multipartUpload('imgs.tar.gz', './imgs.tar.gz');
  console.log(result);
  } catch (e) {
   // 捕获超时异常
    if (e.code === 'ConnectionTimeoutError') {
      console.log("Woops,超时啦!");
    }
    console.log(e)
  }
}

multipartUpload();