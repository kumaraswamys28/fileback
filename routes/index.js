// routes/index.js
import express from 'express';
import { child } from 'winston';
const router = express.Router();

router.get('/', (req, res) => {
  child.process('ls -la', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Hello from API');
});


export default router;
