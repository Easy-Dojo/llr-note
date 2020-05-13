const qiniu = require('qiniu')

class QiniuManager {
  constructor (accessKey, secretKey, bucket) {
    // generate mac
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    this.bucket = bucket

    // init config
    this.config = new qiniu.conf.Config()
    this.config.zone = qiniu.zone.Zone_z0

    // init bucket
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)
  }

  uploadFile (key, localFileLocation) {
    const options = {
      scope: this.bucket + ':' + key,
    }

    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(this.mac)
    const formUploader = new qiniu.form_up.FormUploader(this.config)
    const putExtra = new qiniu.form_up.PutExtra()

    return new Promise(((resolve, reject) => {
      formUploader.putFile(uploadToken, key, localFileLocation, putExtra,
        this._handleCallback(resolve, reject))
    }))
  }

  deleteFile (key) {
    return new Promise(((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key,
        this._handleCallback(resolve, reject))
    }))
  }

  _handleCallback (resolve, reject) {
    return (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody)
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody,
        })
      }
    }
  }
}

module.exports = QiniuManager
