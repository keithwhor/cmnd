class Command {

  constructor () {
    let args = [].slice.call(arguments);
    this.names = args;
  }

  help () {
    /* Example below */
    return {
      description: 'No information available',
      args: ['example'],
      flags: {i: 'Information Flag'},
      vflags: {iverbose: 'Verbose Information Flag'}
    };
  }

  async run (params) {
    /* Code here when inherited */
    return true;
  }

}

module.exports = Command;
