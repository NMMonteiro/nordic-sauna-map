const { spawn } = require('child_process');

function setSecret(name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['firebase', 'functions:secrets:set', name], { shell: true });
    
    child.stdin.write(value);
    child.stdin.end();

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      console.log(`Command closed with code ${code}`);
      console.log(output);
      if (code === 0) resolve();
      else reject(new Error(output));
    });
  });
}

async function run() {
  try {
    await setSecret('SMTP_USER', 'info@suomiportaat.com');
    await setSecret('SMTP_PASS', '!!finlanD2026!!');
    console.log('Secrets set successfully without newlines!');
  } catch (err) {
    console.error(err);
  }
}

run();
