const COMMANDS = [
  // 'init',
  'scaffold',
  'bundle',
  'clean',
];
const DEFAULT_COMMAND = 'bundle';
const DEFINES_MAP = {
  // init: [
  //   {
  //     key: 'config',
  //     short: 'c',
  //     type: String,
  //   },
  // ],
  scaffold: [
    {
      key: 'config',
      short: 'c',
      type: String,
    },
  ],
  bundle: [
    {
      key: 'config',
      short: 'c',
      type: String,
    },
  ],
};
const rows = process.argv.slice(2);
const command = !rows[0] || /^\-/.test(rows[0]) ? DEFAULT_COMMAND : rows[0];
if (!COMMANDS.includes(command)) {
  console.error(`Invalid command ${command}`);
  process.exit(0);
}

const argv = {
  _command: command,
};

const DEFINES = DEFINES_MAP[command];

DEFINES &&
  DEFINES.forEach(DEFINE => {
    const { key, short, type, defaultValue } = DEFINE;
    const matchedRow = rows.find(row => {
      let matchStr = `\-\-${key}`;
      if (short) matchStr += `|\-${short}`;
      return new RegExp(`^(${matchStr})$`).test(row);
    });
    let value = defaultValue;
    if (matchedRow) {
      const myIndex = rows.indexOf(matchedRow);
      if (type === Boolean) {
        value = true;
      } else {
        value = rows[myIndex + 1];
        if (type === Number) {
          value = parseFloat(value);
        }
      }
    }
    argv[key] = value;
  });

module.exports = argv;
