import express from 'express';
import nodemailer from 'nodemailer';
import Users from 'data/Users';

const router = express.Router();

// return a list of tags
router.get('/users', function (req, res, next) {
    res.json(Users);
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

router.get('/xmas', function (req, res, next) {

    const participants = Users.map(user => ({ ...user }));
    // console.log(participants);

    const secret = participants.map(participant => ({
            [participant.displayName]: pickSecretFor(participant, participants)
        })
    );

    const mailOptions = {
        from: 'youremail@gmail.com',
        to: 'myfriend@yahoo.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

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

module.exports = router;
