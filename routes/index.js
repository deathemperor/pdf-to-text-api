const fs = require('fs');
const pdf2Text = require('pdf-to-text');
const express = require('express');
const router = express.Router();
const request = require('request-promise');

router.post('/', async function (req, res, next) {
  const options = {
    uri: req.body.file,
    method: "GET",
    encoding: "binary",
    headers: {
      "Content-type": "application/pdf"
    }
  };
  const fileContent = await request.get(options);
  const fileName = `files/${Date.now()}.pdf`;
  const writeStream = fs.createWriteStream(fileName);
  writeStream.write(fileContent, 'binary');
  writeStream.on('finish', () => {
    console.log('wrote all data to file');
  });
  writeStream.end();
  const parsePdfToText = pdf =>
    new Promise((resolve, reject) => {
      pdf2Text.pdfToText(pdf, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  const text = await parsePdfToText('file.pdf');
  fs.unlinkSync(fileName);
  res.send({
    file: req.body.file,
    text
  });
});

module.exports = router;