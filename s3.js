const knox = require('knox');
const fs = require('fs');
let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in production the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'sergio-socialnetwork'
});

exports.upload = function(req, res, next) {
    if(!req.file){
        return res.json({
            error: true
        })
    }
    const s3Request = client.put(req.file.filename, {
        // first two are headers for amazon to serve the file
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size, // size of the file
        // telling amazon the file is available for everyone to READ only
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        console.log(s3Response.statusCode);
        if (s3Response.statusCode == 200) {
            next()
            fs.unlink(req.file.path, () => 0)
        } else {
            return res.json({
                error: true
            });
        }
    });
};
