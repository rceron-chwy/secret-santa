import express from 'express';
import nodemailer from 'nodemailer';
import Users from 'data/Users';
import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const salt = 'FN33HNHFcqgaj4x';

const router = express.Router();

// return a list of tags
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rfceron@gmail.com',
    pass: 'ybriwltwvykfgafw'
  }
});

router.get('/reveal/:hash', (req, res, next) => {
    const encrypted = req.params.hash;
    res.json(decrypt(encrypted));
});


router.get('/xmas', (req, res, next) => {

    const participants = Users.map(user => ({ ...user }));

    const secret = participants.map(participant => {

            const selectedSecret = pickSecretFor(participant, participants);
            const encrypted = encrypt(selectedSecret.displayName);
            const subject = 'Secret Santa na casa do Belu e da Nini! 🎅 ❄️ 🎄';
            const html = `<h2>Oi ${participant.displayName}!!<h2/><p style="font-size: 12px">Clique no link abaixo pra reveler o amigo screto!</p><a target="_blank" href="https://rafaelceron.com/secretsanta/${encrypted}">AMIGO SECRETO</a>`;

            const mailOptions = {
                from: 'rfceron+secretsanta@gmail.com',
                to: 'rfceron@gmail.com',
                subject,
                html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return {
                [participant.displayName]: {
                    ...selectedSecret,
                    encrypted,
                    decrypted: decrypt(encrypted)
                }
            }
        }
    );

    res.json(secret);
});

const pickSecretFor = (participant, allCandidates) => {

    const candidates = allCandidates
        .filter(candidate => candidate.available && candidate.id !== participant.id && candidate.id !== participant.relativeId);
    console.log('CANDIDATES FOR ' + participant.displayName + ': ' + candidates.map((c, idx) => idx + ':' + c.displayName));

    const max = candidates.length - 1;
    console.log('MAX --> ', max)

    const random = (max === 0) ? 0 : getRandomIntInclusive(0, max);
    console.log('RANDOM --> ',  random);

    const chosen = candidates[random];
    console.log('CHOSEN --> ',  chosen.displayName)

    allCandidates.forEach(candidate => {
        if (candidate.id === chosen.id) candidate.available = false;
    });

    return chosen;
}

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,salt)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,salt)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
module.exports = router;
