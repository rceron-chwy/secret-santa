import http from 'http';
import path from 'path';
import methods from 'methods';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import errorhandler from 'errorhandler';

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
let app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(require('method-override')());
// app.use(express.static(__dirname + '/public'));

if (!isProduction) {
    app.use(errorhandler());
}

// if (isProduction) {
//     mongoose.connect(process.env.MONGODB_URI);
// } else {
//     mongoose.connect('mongodb://localhost/conduit');
//     mongoose.set('debug', true);
// }

// require('./models/User');
// require('./models/Article');
// require('./models/Comment');
// require('./config/passport');

app.use(require('routes'));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found !!');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function (err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({
            'errors': {
                message: err.message,
                error: err
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'errors': {
            message: err.message,
            error: {}
        }
    });
});

// finally, let's start our server...
let server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
});