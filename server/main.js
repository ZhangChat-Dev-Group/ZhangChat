/**
  * ZhangChat main server entry point
  * @author MrZhang365 ( https://blog.mrzhang365.cf )
  * @version v2.0
  * @license Apache-2.0
  */

// import and initialize the core application
import { CoreApp } from './src/serverLib/CoreApp';

const coreApp = new CoreApp();
coreApp.init();
