module.exports = (() => {

  'use strict';

  const fs = require('fs');
  const path = require('path');
  const colors = require('colors/safe');

  const Command = require('./command.js');

  class CommandLineInterface {

    constructor() {

      this.commands = {};

    }

    parse(args) {

      let commands = args.shift();
      commands = commands ? commands.split(':') : [];

      let raw = args.join(' ');

      let curArgType = 'args';
      args = args.reduce((args, val) => {

        let newArg = false;

        ['flags', 'vflags'].forEach(argType => {

          if (val[0] === '-') {

            val = val.substr(1);
            curArgType = argType;
            newArg = true;

          }

        });

        newArg && args[curArgType].push([val]);

        if (!newArg) {
          if (curArgType === 'args') {
            args[curArgType].push(val);
          } else {
            args[curArgType][args[curArgType].length - 1].push(val);
          }
        }

        return args;

      }, {
        names: commands,
        args: [],
        flags: [],
        vflags: [],
        buffer: new Buffer(raw)
      });

      ['flags', 'vflags'].forEach(argType => {

        args[argType] = args[argType].reduce((obj, arr) => {

          obj[arr[0]] = arr.slice(1);
          return obj;

        }, {});

      });

      return args;

    }

    load(root, dir) {

      fs.readdirSync(path.join(root, dir)).forEach(filename => {

        if (filename.indexOf('.') === 0) {
          return;
        }

        let pathname = path.join(dir, filename);
        let fullpath = path.join(root, pathname);

        let stat = fs.statSync(fullpath);

        if (stat.isDirectory()) {

          this.load(root, pathname);

        } else {

          this.add(require(fullpath));

        }

      });

    }

    add(CommandConstructor) {

      if (!(Command.isPrototypeOf(CommandConstructor))) {
        throw new Error('Not a valid command');
      }

      let command = new CommandConstructor();
      this.commands[this.format(command.names)] = command;

    }

    format(names) {

      return names.join(':');

    }

    run(args, callback) {

      callback = callback || ((err, result) => {

        if (err) {
          console.error(colors.bold.red('Error: ') + err.message);
          if (err.details && typeof err.details === 'object') {
            Object.keys(err.details).sort().forEach(key => {
              console.log(`  ${key}:`);
              if (err.details[key] instanceof Array) {
                err.details[key].forEach(value => console.log(`    - ${value}`));
              } else {
                console.log(`    - ${err.details[key]}`);
              }
            });
          }
          return process.exit(1);
        }

        (result !== undefined) && console.log(result);
        return process.exit(0);

      });

      args = this.parse(args);
      if (args.names[0] === 'help') {

        let commands = Object.keys(this.commands);
        let specific = args.args[0];

        if (specific) {
          commands = commands.filter(cmd => (cmd === specific) || (cmd.indexOf(`${specific}:`) === 0));
        }

        return console.log(
          commands
            .filter(cmd => this.commands[cmd].help().description)
            .sort()
            .map(cmd => {
              let command = this.commands[cmd];
              return [[cmd].concat((command.help().args || []).map(a => `[${a}]`)).join(' ')].concat(
                Object.keys(command.help().flags || {}).sort()
                  .map(flag => `\t-${flag}${Array(21 - flag.length).join(' ')}${command.help().flags[flag]}`),
                Object.keys(command.help().vflags || {}).sort()
                  .map(vflag => `\t--${vflag}${Array(20 - vflag.length).join(' ')}${command.help().vflags[vflag]}`),
                (command.help().flags || command.help().vflags) ? '\t' : '',
                (command.help().description || 'No information available').split('\n')
                  .map(line => line.replace(/^\s*(.*)$/, '$1'))
                  .filter(l => l)
                  .map(line => `\t${line}`),
                command.help().description ? '\t' : ''
              ).filter(l => l).join('\n');
            }).join('\n') || 'No commands found'
        );
      }

      let command = this.commands[this.format(args.names)];

      if (!command) {
        return callback(new Error(`Command "${this.format(args.names)}" does not exist.`));
      }

      let params = {
        args: args.args,
        flags: args.flags,
        vflags: args.vflags,
        buffer: args.buffer
      };

      return command.run(params, callback);

    }

  }

  return CommandLineInterface;

})();
