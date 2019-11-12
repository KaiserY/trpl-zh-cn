# Rust 程序设计语言（第二版 & 2018 edition） 简体中文版

[![Build Status](https://travis-ci.org/KaiserY/trpl-zh-cn.svg?branch=master)](https://travis-ci.org/KaiserY/trpl-zh-cn)

## 状态

2018 edition 的翻译迁移已基本完成，欢迎阅读学习！

PS:

* 对照源码位置：[https://github.com/rust-lang/book/tree/master/src][source]
* 每章翻译开头都带有官方链接和 commit hash，若发现与官方不一致，欢迎 Issue 或 PR :)

[source]: https://github.com/rust-lang/book/tree/master/src

## 静态页面构建与文档撰写

![image](./vuepress_page.png)

### 构建

你可以将本 mdbook 构建成一系列静态 html 页面。这里我们采用 [vuepress](https://vuepress.vuejs.org/zh/) 打包出静态网页。在这之前，你需要安装 [Nodejs](https://nodejs.org/zh-cn/)。

全局安装 vuepress

``` bash
npm i -g vuepress 
```

cd 到项目目录，然后开始构建。构建好的静态文档会出现在 "./src/.vuepress/dist" 中

```bash
vuepress build ./src
```

### 文档撰写

vuepress 会启动一个本地服务器，并在浏览器对你保存的文档进行实时热更新。

```bash
vuepress dev ./src
```

## 社区资源

- Rust语言中文社区：<https://rust.cc/>
- Rust 中文 Wiki：<https://wiki.rust-china.org/>
- Rust编程语言社区主群：303838735
- Rust 水群：253849562

## GitBook

本翻译主要采用 [mdBook](https://github.com/rust-lang-nursery/mdBook) 格式。同时支持 [GitBook](https://github.com/GitbookIO/gitbook)，但会缺失部分功能，如一些代码没有语法高亮。

本翻译加速查看站点有：
 - 深圳站点：<http://120.78.128.153/rustbook>

[GitBook.com](https://www.gitbook.com/) 地址：<https://legacy.gitbook.com/book/kaisery/trpl-zh-cn/details>
