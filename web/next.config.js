/** @type {import('next').NextConfig} */
const CopyPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GET_USER_URL: process.env.GET_USER_URL,
    LOGIN_URL: process.env.LOGIN_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
  },
  trailingSlash: true,
  images: { unoptimized: true },
  skipTrailingSlashRedirect: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'node_modules/@oceanbase-odc/monaco-plugin-ob/worker-dist/'),
              to: 'static/ob-workers',
            },
          ],
        }),
      );
      // 添加 monaco-editor-webpack-plugin 插件
      config.plugins.push(
        new MonacoWebpackPlugin({
          // 你可以在这里配置插件的选项，例如：
          languages: ['sql'],
          filename: 'static/[name].worker.js',
        }),
      );
    }
    // config.module.rules.push({
    //   test: /\.js$/,
    //   use: 'babel-loader',
    //   exclude: /node_modules/,
    // });
    const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'));
    //
    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      // {
      //   ...fileLoaderRule,
      //   test: /\.svg$/i,
      //   resourceQuery: /url/, // *.svg?url
      // },
      {
        test: /\.svg$/,
        resourceQuery: /url/, // *.svg?url
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ['@svgr/webpack'],
    // });
    return config;
  },
  lessLoaderOptions: {},
};

const withTM = require('next-transpile-modules')([
  '@berryv/g2-react',
  '@antv/g2',
  'react-syntax-highlighter',
  '@antv/g6',
  '@antv/graphin',
  '@antv/gpt-vis',
]);

const cloneDeep = require('clone-deep');

// this plugin finds next.js's sass rules and duplicates them with less
// it mimics the exact behavior of CSS extraction/modules/client/server of SASS
// tested on next@11.0.1 with webpack@5

const addLessToRegExp = rx => new RegExp(rx.source.replace('|sass', '|sass|less'), rx.flags);

function withLess({ lessLoaderOptions = {}, ...nextConfig }) {
  return Object.assign({}, nextConfig, {
    /**
     * @param {import('webpack').Configuration} config
     * @param {*} options
     * @returns {import('webpack').Configuration}
     */
    webpack(config, opts) {
      // there are 2 relevant sass rules in next.js - css modules and global css
      let sassModuleRule;
      // global sass rule (does not exist in server builds)
      let sassGlobalRule;

      const isNextSpecialCSSRule = rule =>
        // next >= 12.0.7
        rule[Symbol.for('__next_css_remove')] ||
        // next < 12.0.7
        rule.options?.__next_css_remove;

      const cssRule = config.module.rules.find(rule => rule.oneOf?.find(isNextSpecialCSSRule));

      if (!cssRule) {
        throw new Error('Could not find next.js css rule. Please ensure you are using a supported version of next.js');
      }

      const imageRule = config.module.rules.find(rule => rule.loader === 'next-image-loader');

      if (imageRule) {
        imageRule.issuer.not = addLessToRegExp(imageRule.issuer.not);
      }

      const addLessToRuleTest = test => {
        if (Array.isArray(test)) {
          return test.map(rx => addLessToRegExp(rx));
        } else {
          return addLessToRegExp(test);
        }
      };

      cssRule.oneOf.forEach(rule => {
        if (rule.options?.__next_css_remove) return;

        if (rule.use?.loader === 'error-loader') {
          rule.test = addLessToRuleTest(rule.test);
        } else if (rule.use?.loader?.includes('file-loader')) {
          // url() inside .less files - next <= 11
          rule.issuer = addLessToRuleTest(rule.issuer);
        } else if (rule.type === 'asset/resource') {
          // url() inside .less files - next >= 12
          rule.issuer = addLessToRuleTest(rule.issuer);
        } else if (rule.use?.includes?.('ignore-loader')) {
          rule.test = addLessToRuleTest(rule.test);
        } else if (rule.test?.source === '\\.module\\.(scss|sass)$') {
          sassModuleRule = rule;
        } else if (rule.test?.source === '(?<!\\.module)\\.(scss|sass)$') {
          sassGlobalRule = rule;
        }
      });

      const lessLoader = {
        loader: 'less-loader',
        options: {
          ...lessLoaderOptions,
          lessOptions: {
            javascriptEnabled: true,
            ...(lessLoaderOptions.lessOptions || {}),
          },
        },
      };

      let lessModuleRule = cloneDeep(sassModuleRule);

      const configureLessRule = rule => {
        rule.test = new RegExp(rule.test.source.replace('(scss|sass)', 'less'));
        // replace sass-loader (last entry) with less-loader
        rule.use.splice(-1, 1, lessLoader);
      };

      configureLessRule(lessModuleRule);
      cssRule.oneOf.splice(cssRule.oneOf.indexOf(sassModuleRule) + 1, 0, lessModuleRule);

      if (sassGlobalRule) {
        let lessGlobalRule = cloneDeep(sassGlobalRule);
        configureLessRule(lessGlobalRule);
        cssRule.oneOf.splice(cssRule.oneOf.indexOf(sassGlobalRule) + 1, 0, lessGlobalRule);
      }
      console.log('======start=====');
      console.log(cssRule.oneOf.filter(d => `${d.test}`.includes('less')));
      console.log('======end=====');
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, opts);
      }

      return config;
    },
  });
}

module.exports = withTM(
  withLess({
    ...nextConfig,
  }),
);
