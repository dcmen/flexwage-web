const Banner = require('../models/web-admin/banner.model');
const mongoose = require('mongoose');
mongoose.connect(config.database, { useCreateIndex: true, useNewUrlParser: true });

let banners = [
    new Banner({
        imagePath: '/uploads/1566528913243-1565602417670-mockup-1.png',
        title: 'sell your product',
        description: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim.dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd</p>\r\n',
        linkButton1: '#',
        linkButton2: '#',
        status: true
    }),
    new Banner({
        imagePath: 'uploads/1565057995071-resize1563418431071-iPhone-X-mockup-2.png',
        title: 'Your pay your way',
        description: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim.</p>\r\n',
        linkButton1: '#',
        linkButton2: '#',
        status: true
    })
]

let done = 0;
for (var i = 0; i < banners.length; i++) {
    banners[i].save((err, result) => {
        done++;
        if (done === banners.length) {
            exit();
        }
    });
}

const exit = () =>  {
    mongoose.disconnect();
}