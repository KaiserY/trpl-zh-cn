#!/bin/bash

# 同步更新原作者代码到自己仓库
# git remote add upstream https://github.com/KaiserY/trpl-zh-cn.git
git checkout master
git fetch upstream
git merge upstream/master master
git pull origin master
git push


git checkout turing
git fetch upstream
git merge upstream/master turing
git pull origin turing
git push
