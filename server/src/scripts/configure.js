/**
  * Server configuration script, to (re)configure server options
  * @author Marzavec ( https://github.com/marzavec )
  * @version v2.0.0
  * @license WTFPL ( http://www.wtfpl.net/txt/copying/ )
  */

// import required classes
import { join } from 'path';
import ConfigManager from '../serverLib/ConfigManager';
import SetupWizard from './configLib/SetupWizard';

if (!!process.env.ZHC_IN_DOCKER && !process.env.ZHC_CONFIG_FORCE) {
  console.info('This script is running in a docker contain, please mount data volumn instead of executing me.')
  console.info('If you want to use this script anyway, please set `ZHC_CONFIG_FORCE` to any value.')
  process.exit(0)
}

// import and initialize configManager & dependencies
const serverConfig = new ConfigManager(join(__dirname, '../..'));
const setup = new SetupWizard(serverConfig);

setup.start();
