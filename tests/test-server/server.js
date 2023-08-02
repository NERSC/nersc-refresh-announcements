const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000 || process.env.PORT;

const emptyAnnouncement = process.argv.includes('--empty-announcement');
const randomAnnouncement = process.argv.includes('--random-announcement');
const testAnnouncement = {
  user: 'rcthomas',
  announcement:
    'This is a test of the Jupyter announcement system. This is only a test. Here is a link to the <a href="https://www.nersc.gov/live-status/motd/">NERSC MOTD</a>.',
  timestamp: '2021-05-05T13:05:57.957231'
};
let sampleAnnouncements = [
  'System undergoing maintenance.',
  'System returned to normal.',
  'System in degraded mode.',
  ''
];

app.use(cors());

app.listen(PORT, () => {
  if (!emptyAnnouncement) {
    console.log(`Announcement at port ${PORT}`);
  } else {
    console.log(`Empty Announcement at port ${PORT}`);
  }
});

app.get('/', (req, res) => {
  res.status(200);
  if (emptyAnnouncement) {
    res.json({ announcement: '' });
  } else if (randomAnnouncement) {
    res.json({
      user: testAnnouncement.user,
      timestamp: testAnnouncement.timestamp,
      announcement:
        sampleAnnouncements[
          Math.floor(Math.random() * sampleAnnouncements.length)
        ]
    });
  } else {
    res.json(testAnnouncement);
  }
});
