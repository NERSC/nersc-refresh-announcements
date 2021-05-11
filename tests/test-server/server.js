const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000 || process.env.PORT;

const emptyAnnouncement = process.argv.includes('--empty-announcement');

app.use(cors());

app.listen(PORT, () => {
    if (emptyAnnouncement) {
        console.log(`Announcement at port ${PORT}`);
    } else {
        console.log(`Empty Announcement at port ${PORT}`);
    }
});

app.get('/', (req, res) => {
    res.status(200);
    if (emptyAnnouncement) {
        res.json({});
    } else {
        res.json({
            user: 'rcthomas',
            announcement:
                'This is a test of the Jupyter announcement system. This is only a test. Here is a link to the <a href="https://www.nersc.gov/live-status/motd/">NERSC MOTD</a>.',
            timestamp: '2021-05-05T13:05:57.957231'
        });
    }
});
