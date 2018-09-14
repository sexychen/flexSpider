let OSS = require('ali-oss')
let client = new OSS({
  region: '<Your region>',
  accessKeyId: '<Your AccessKeyId>',
  accessKeySecret: '<Your AccessKeySecret>',
  bucket: 'Your bucket name'
});

async function multipartUpload() {
  try {
    const progress = async function (p) {
      console.error(p);
    };
    let result = await client.multipartUpload('imgs.tar.gz', './imgs.tar.gz', {
      progress,
      meta: {
        year: 2018
      }
    });
    console.error(result);
  } catch (e) {
    console.error(e)
    // 捕获超时异常
    if (e.code === 'ConnectionTimeoutError') {
      console.error("Woops,超时啦!");
    }
    console.error(e)
  }
}

multipartUpload();