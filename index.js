/*
 * @Author: xiaotian.zy
 * @Descriptions:
 *   ihome 应用文件输出处理
 *   @param option: { data, filePath, config }
 *   - data: module and generate code Data
 *   - filePath: Pull file storage directory
 *   - config: cli config
 * @TodoList: 无
 * @Date: 2021-09-29 21:12:09
 * @Last Modified by: xiaotian.zy
 * @Last Modified time: 2021-10-05 19:23:01
 */

const fse = require('fs-extra');
const chalk = require('chalk');

const generatePlugin = async (option) => {
  let { data, config, filePath } = option;
  let result = {
    errorList: [],
  };
  if (!data) return { message: '参数不对' };
  const panelDisplay =
    (data.code && data.code.panelDisplay) || data.data.code.panelDisplay;

  if (!fse.existsSync(filePath)) {
    fse.mkdirSync(filePath);
  }

  try {
    let index = 0;
    for (const item of panelDisplay) {
      let value = item.panelValue;
      const { panelName } = item;

      const strArr = panelName.split('/');
      strArr.pop();

      let folder = `${filePath}`;
      for (const strItem of strArr) {
        folder = `${folder}/${strItem}`;
        if (!fse.existsSync(folder)) {
          fse.mkdirSync(folder);
        }
      }

      const outputFilePath = `${filePath}/${panelName}`;

      // Depend on merge processing for package
      try {
        if (panelName === 'package.json') {
          const packagePath = `${filePath}/package.json`;
          const newPackage = JSON.parse(value) || null;
          if (newPackage && fse.existsSync(packagePath)) {
            let packageJson = await fse.readJson(packagePath);
            if (!packageJson.dependencies) {
              packageJson.dependencies = {};
            }
            const newDependencies = Object.assign(
              newPackage.dependencies,
              packageJson.dependencies
            );
            packageJson.dependencies = newDependencies;
            value = JSON.stringify(packageJson, null, 2);
          }
        }
      } catch (error) {
        result.errorList.push(error);
      } finally {
      }
      await fse.writeFile(outputFilePath, value, 'utf8');
      index++;
    }
  } catch (error) {
    result.errorList.push(error);
  }

  return { data, filePath, config, result };
};

module.exports = (...args) => {
  return generatePlugin(...args).catch((err) => {
    console.log(chalk.red(err));
  });
};
