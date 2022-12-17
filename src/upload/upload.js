const aws = require('aws-sdk');

const {ACCESS_KEY_ID , SECRET_ACCESS_KEY , REGION , ACL, BUCKET , KEY , API_VERSION} = process.env

aws.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY ,
    region: REGION
})

let uploadFiles = async function(file){
    return new Promise(function(resolve, reject){
        let s3 = new aws.S3({apiVersion: API_VERSION});
        
        var uploadParams = {
            ACL: ACL,
            Bucket: BUCKET,
            Key: KEY +file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function(err, data){
            if(err){
                return reject({'error': err})
            }
            // console.log(data)
            console.log("file uploaded successfully")
            return resolve(data.Location)
        })
    })
}



module.exports.uploadFiles = uploadFiles