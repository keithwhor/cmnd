module.exports = (() => {

  'use strict';

  class Command {

    constructor() {

      let args = [].slice.call(arguments);
      this.names = args;

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

    run(params, callback) {

      return callback(null);

    }

  }

  return Command;

})();
