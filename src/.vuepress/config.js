import path from 'path';
// .vuepress/config.js
export default {
  themeConfig: {
    sidebar: "auto",
    nav: [
      { text: '回首页', link: '/' },
    ]
  },
  alias: {
    'img': path.resolve(__dirname, './../img'),
  },
};
