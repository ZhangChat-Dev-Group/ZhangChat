import {
  start as _start,
  get,
} from 'prompt';

/**
  * Server setup wizard, quick server setup and all that jazz. . .
  * @author Marzavec ( https://github.com/marzavec )
  * @version v2.0.0
  * @license WTFPL ( http://www.wtfpl.net/txt/copying/ )
  */
class SetupWizard {
  /**
    * Create a `SetupWizard` instance for initializing the server's config.json
    * @param {Object} serverConfig reference to the server config class
    */
  constructor(serverConfig) {
    this.serverConfig = serverConfig;
  }

  /**
    * Roll a d20 and begin the wizarding process
    */
  async start() {
    // load the current config to use as defaults, if available
    const currentConfig = await this.serverConfig.load() || {};

    // auto generate the salt if not currrently created
    currentConfig.tripSalt = currentConfig.tripSalt
      || [...Array(Math.floor(Math.random() * 1024) + 1024)].map(() => (~~(Math.random() * 36)).toString(36)).join('');

    // load the setup questions & set their defaults
    const questions = require('../setupSchema/Questions.js');
    questions.properties = this.setQuestionDefaults(questions.properties, currentConfig);

    // force password re-entry
    questions.properties.trip.default = '';
    questions.properties.trip.required = true;

    // output the packages setup banner
    require('../setupSchema/Banner.js');

    // let's start playing 20 questions
    _start();
    get(questions, (err, result) => this.finalize(err, result));
  }

  /**
    * Compares the currently loaded config with the stock questions, adds a default
    * and required option to the question
    * @param {Object} questions the set of questions from /setupSchema
    * @param {Object} currentConfig the current server options
    */
  setQuestionDefaults(questions, currentConfig) {
    Object.keys(questions).forEach((qName) => {
      if (typeof currentConfig[qName] !== 'undefined') {
        questions[qName].default = currentConfig[qName];
        questions[qName].required = false;
      } else {
        questions[qName].required = true;
      }
    });

    return questions;
  }

  /**
    * Looks like all the questions have been answered, check for errors or save
    * the new config file
    *
    * @param {Object} err any errors generated by Prompt
    * @param {Object} result the answers / new config setup
    */
  async finalize(err, result) {
    // output errors and die if needed
    if (err) {
      console.error(err);
      process.exit(0);
    }

    // initialize default mods config
    if (typeof result.mods === 'undefined') {
      result.mods = [];
    }

    if (typeof result.sudoers === 'undefined') {
      result.sudoers = [];
    }

    if (result.mods.indexOf(result.trip) === -1){
      result.mods.push({trip:result.trip})
    }

    if (result.sudoers.indexOf(result.trip) === -1){
      result.sudoers.push(result.trip)
    }

    delete result.trip

    // If we should log errors with the err stack when they occur.
    // See: CommandManager.js
    if (typeof result.logErrDetailed === 'undefined') {
      result.logErrDetailed = false;
    }

    // finally create the actual JSON file
    try {
      this.serverConfig.config = result;
      await this.serverConfig.save();
    } catch (e) {
      console.error(`无法将配置写入到：${this.serverConfig.configPath}
        ${e.stack}`);
    }

    // output the packages final notice before quitting
    require('../setupSchema/Footer.js');

    process.exit(0);
  }
}

export default SetupWizard;
