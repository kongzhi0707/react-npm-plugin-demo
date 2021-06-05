
### 封装一个React组件发布到npm中

#### 1. 封装一个react组件

  在项目对应的位置，新建项目文件夹，使用命令: mkdir change-button. 然后进入该项目目录下：cd change-button; 然后我们初始化一个 package.json 文件。如下命令：
```
yarn init -y
```
#### 2. 安装相关插件包

package.json

```
"devDependencies": {
  "@babel/core": "^7.10.4",
  "@hot-loader/react-dom": "^16.13.0",
  "@babel/preset-env": "^7.10.4",
  "@babel/preset-react": "^7.10.4",
  "autoprefixer": "^9.8.4",
  "babel-loader": "^8.1.0",
  "clean-webpack-plugin": "^3.0.0",
  "css-loader": "^3.6.0",
  "html-webpack-plugin": "^4.3.0",
  "optimize-css-assets-webpack-plugin": "^5.0.3",
  "postcss-loader": "^3.0.0",
  "style-loader": "^1.2.1",
  "terser-webpack-plugin": "^3.0.6",
  "webpack": "^4.43.0",
  "webpack-cli": "^3.3.12",
  "webpack-dev-server": "^3.11.0",
  "webpack-merge": "^5.0.9",
  "webpack-node-externals": "^2.5.0"
},
"dependencies": {
  "react": "^16.13.1",
  "react-dom": "^16.13.1"
}
```

#### 3. 编写组件内容

#### 3.1. src/components/change-button.js 代码如下：
```
import React, { Component } from 'react';
import './change-button.css';

class ChangeButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnTxt: 'Login'
    };
  }
  render() {
    const { btnTxt } = this.state;
    return (
      <div className='button-container' onClick={
        () => {
          this.setState({
            btnTxt: btnTxt === 'Login' ? 'Logout' : 'Login'
          })
        }
      }>
        <span>{ btnTxt }</span>
      </div>
    )
  }
}

export default ChangeButton;
```
#### 3.2 src/components/change-button.css 代码如下：
```
.button-container {
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: aquamarine;
  border-radius: 5px;
}
.button-container:hover {
  cursor: pointer;
}
```
#### 3.3 src/components/index.js 代码如下：
```
import ChangeButton from './change-button';
export default ChangeButton;
```
#### 3.4 src/index.js 代码如下：
```
import React from 'react';
import ReactDOM from 'react-dom';
import ChangeButton from './components/change-button';

const App = () => {
  return (
    <div>
      <ChangeButton />
    </div>
  );
}

// 要实现局部热更新，必须添加如下代码
if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(<App />, document.getElementById('root'));
```
#### 3.5 public/index.html 代码如下：
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>React</title>
  </head>
  <body>
    <div id="root" class="root"></div>
  </body>
</html>
```
#### 4. 编写webpack内容

#### 4.1 script/webpack.base.config.js
```
const webpackConfigBase = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('autoprefixer')()
              ],
            }
          }
        ]
      }
    ]
  }
};

module.exports = webpackConfigBase;
```
#### 4.2 scripts/webpack.dev.config.js
```
const path = require('path');
const webpack = require('webpack');
const webpackConfigBase = require('./webpack.base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}

const webpackConfigDev = {
  mode: 'development',

  entry: {
    app: [resolve('../src/index.js')],
  },

  output: {
    path: resolve('../lib'), 
    filename: 'change-button.js',
  },

  devtool: 'cheap-module-eval-source-map',   

  devServer: {
    contentBase: resolve('../lib'), 
    hot: true,
    open: true,   
    host: 'localhost',
    port: 8080,
  },

  plugins: [
    new HtmlWebpackPlugin({template: './public/index.html', }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}

module.exports = merge(webpackConfigBase, webpackConfigDev);
```

#### 4.3 scripts/webpack.prod.config.js 代码如下：

```
const path = require('path');
const webpack = require('webpack');
const nodeExternals  = require('webpack-node-externals');
const webpackConfigBase = require('./webpack.base.config');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}

const webpackConfigProd = {
  mode: 'production',

  entry: {
    app: [resolve('../src/components/index.js')], 
  },

  output: {
    filename: 'change-button.js',
    path: resolve('../lib'), 
    libraryTarget:'commonjs2'
  },

  devtool: 'source-map',  //或使用'cheap-module-source-map'、'none'
  optimization: {
    minimizer: [
      // 压缩js代码
      new TerserJSPlugin({// 多进程压缩
        parallel: 4,// 开启多进程压缩
        terserOptions: {
          compress: {
            drop_console: true,   // 删除所有的 `console` 语句
          },
        },
      }),
      //压缩css代码
      new OptimizeCSSAssetsPlugin()
    ],
  },
  externals: [nodeExternals()],

  plugins:[
    new CleanWebpackPlugin() //每次执行都将清空一下./dist目录
  ]
}
module.exports = merge(webpackConfigBase, webpackConfigProd);
```

#### 注意：
```
1. entry的入口文件，由开发环境的 src/index.js 改成了组件的出口 src/components/index.js；表示该处只负责输出组件。
2. output的 libraryTarget 需要为：commonjs2。
3. nodeExternals() 将打包组件内的react等依赖给去除了，减少了包的体积。在引用该包时，只要其环境下有相关包，就可以正常使用。
```
#### 4.4 在package.json中添加如下scripts，用来启动webpack
```
"scripts": {
  "build": "webpack --config ./scripts/webpack.prod.config.js",
  "dev": "webpack-dev-server --config ./scripts/webpack.dev.config.js"
},
```
#### 5. 配置组件发布的相关信息

package.json 文件
```
{
  "name": "change-button",
  "version": "1.0.0",
  "main": "lib/change-button.js",
  "author": "tugenhua",
  "description": "测试button组件",
  "keywords": ["测试button组件"],
  "repository": "",
  "license": "MIT",
}
```
  属性说明：

  name：包名。

  version：包的版本，每次发布包的版本时，需要改变包名或叫升级。

  description：包的简介。

  repository：一般写Github的地址

  author：该组件的作者是谁。

  license：认证。一般写 "MIT".

  main: 包的入口文件。就是当我们引入这个包的时候去加载的入口文件。

  keywords: 添加一些关键字更容易使我的包被搜索的到。

#### 6. 调试并生存组件包文件

  6.1 启动开发环境

  在项目的根目录下运行： yarn dev

  在启动我们的开发环境项目，并且对组件内的代码进行调试修改。(我们配置了热更新，所以可以实时看到修改结果)。

  6.2 打包组件

  运行命令：yarn build

  运行完成后，在项目的根目录下会生成 lib文件夹，在该文件夹下会生成 change-button.js 和 change-button.js.map 文件。

  6.3 调试验证

  1. 将组件映射到本地库

  在组件项目的根目录下运行： 
```
yarn link
```
  运行完成后，在 yarn 的link文件夹下会有一个文件的快捷键映射。

  2. 新建一个项目，比如叫 test-button
```
使用命令： create-react-app test-button
```
  3. 在 test-button 项目中引入 change-button 组件，并且调用
```
yarn link change-button
```
  4. 在 test-button/src/App.js 中添加代码
```
import logo from './logo.svg';
import './App.css';

import ChangeButton from 'change-button';

function App() {
  return (
    <div className="App">
      <ChangeButton />
    </div>
  );
}

export default App;
```
  然后我们在 test-button 项目中运行命令： npm start 启动项目就可以看到组件效果了。

#### 7. 将组件发布到npm中

  7.1 访问npm官网： https://www.npmjs.com/
  7.2 在组件的项目根目录下登录npm. 使用命令: npm login

  按照提示输入 username, password, email 等，登录完成后，我们可以通过 npm whoami 来查看登录用户信息。

  7.3 发布组件到npm上
```
npm publish
```

#### 7.4 验证

  在新项目中通过引入 change-button组件，并调用来进行验证。
```
yarn add change-button
```
