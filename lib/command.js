module.exports = (() => {

  'use strict';

  class Command {

    constructor(commandName, subName) {

      this.name = commandName || '';
      this.sub = subName || '';

    }

    help() {

      return {};

      /* Example below */

      return {
        description: 'No information available',
        args: ['example'],
        flags: {i: 'Information Flag'},
        vflags: {iverbose: 'Verbose Information Flag'}
      };

    }

    run(args, flags, vflags, callback) {

      return callback(null);

    }

  }

  return Command;

})();
