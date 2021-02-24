const fs = require('fs-extra');
const path = require('path');

/**
 * 替换文件中的 css 名称
 *
 * @param {*} panelValue
 * @param {*} fileName
 * @return {*}
 */
function replaceCssImport(panelValue, fileName) {
  panelValue = panelValue.replace(
    `import styles from './${fileName}.css';`,
    `import styles from './index.css';`
  );
  panelValue = panelValue.replace(
    `import './${fileName}.css';`,
    `import './index.css';`
  );
  return panelValue;
}

/**
 * 根据项目类型来优化导出文件格式
 * @param {*} fileType
 * @param {*} isTS
 * @param {*} projectType
 */
function optimizeFileType(workspaceFolder, fileType) {
  const pathArr = workspaceFolder.split('/');
  let isTSProject = false;

  while (pathArr.length > 1 && !isTSProject) {
    pathArr.pop();
    isTSProject = fs.pathExistsSync(
      path.join(pathArr.join('/'), 'tsconfig.json')
    );
  }

  if (isTSProject) {
    if (fileType === 'js') {
      return 'ts';
    }
    if (fileType === 'jsx') {
      return 'tsx';
    }
  }

  return fileType;
}

/**
 * 计算工程目录信息
 * @param {*} workspaceFolders
 * @param {*} filePath
 */
function calculateWorkspaceInfo(workspaceFolders, filePath) {
  let result = null;
  if (Array.isArray(workspaceFolders)) {
    try {
      for (let workspace of workspaceFolders) {
        const { uri = {}, name } = workspace;
        const { fsPath } = uri;
        if (filePath.indexOf(fsPath) > -1) {
          result = {};
          result.workspaceFolder = path.resolve(fsPath);
          result.workspaceName = name;
          result.filePath = filePath;
          break;
        }
      }
    } catch (e) {}
  }
  if (!result) {
    result = {};
    result.workspaceFolder = filePath;
    result.workspaceName = filePath.substr(filePath.lastIndexOf('/') + 1);
    result.filePath = filePath;
  }
  return result;
}

export { replaceCssImport, optimizeFileType, calculateWorkspaceInfo };
