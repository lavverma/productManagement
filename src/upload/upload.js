const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFiles = async function(file){
    return new Promise(function(resolve, reject){
        let s3 = new aws.S3({apiVersion: '2006-03-01'});
        
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "manasvi/" +file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function(err, data){
            if(err){
                return reject({'error': err})
            }
            console.log(data)
            console.log("file uploaded successfully")
            return resolve(data.Location)
        })
    })
}




module.exports.uploadFiles = uploadFiles