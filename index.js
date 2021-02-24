/*
 * @Author: xiaotian@tangping
 * @Descriptions:
 *   ihome 应用文件输出处理
 *   @param option: { data, filePath, config }
 *   - data: module and generate code Data
 *   - filePath: Pull file storage directory
 *   - config: cli config
 * @TodoList: 无
 * @Date: 2021-02-24 16:23:26
 * @Last Modified by: xiaotian@tangping
 * @Last Modified time: 2021-02-24 17:48:01
 */

const path = require('path');
const chalk = require('chalk');
const {
  replaceCssImport,
  optimizeFileType,
  calculateWorkspaceInfo,
} = require('./utils');

const generatePlugin = async (option) => {
  let { data, config, filePath, workspaceFolders } = option;
  const { id: moduleId, name: moduleName } = data.moduleData;
  const componentName = moduleName.split('/')[1] || moduleName;

  // 处理文件输出路径
  if (filePath.indexOf(moduleId) > -1) {
    filePath = process.cwd();
  }

  filePath = path.join(
    filePath,
    componentName.replace(/^\S/, (s) => s.toUpperCase())
  );

  const { workspaceFolder } = calculateWorkspaceInfo(
    workspaceFolders,
    filePath
  );

  // 输出文件过滤和重命名
  data.code.panelDisplay = data.code.panelDisplay
    // 过滤 css 文件
    .filter((item) => /(\.jsx|\.rpx\.css)$/.test(item.panelName))
    .map((item) => {
      try {
        let { panelName, panelValue } = item;
        const fileName = panelName.split('.')[0];
        const fileType = optimizeFileType(
          workspaceFolder,
          panelName.split('.').reverse()[0]
        );

        panelName = `index.${fileType}`;
        panelValue = replaceCssImport(panelValue, fileName);

        return {
          ...item,
          panelName,
          panelValue,
        };
      } catch (error) {
        console.log(chalk.red(error));
      }
    });

  return { data, filePath, config };
};

module.exports = (...args) => {
  return generatePlugin(...args).catch((err) => {
    console.log(chalk.red(err));
  });
};
