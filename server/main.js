/**
  * ZhangChat main server entry point
  * @author MrZhang365 ( https://blog.mrzhang365.cf )
  * @version v2.0
  * @license MIT
  */

// import and initialize the core application
import { CoreApp } from './src/serverLib/CoreApp';

const coreApp = new CoreApp();
coreApp.init();
