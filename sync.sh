#!/bin/bash

# 同步更新原作者代码到自己仓库
# git remote add upstream https://github.com/KaiserY/trpl-zh-cn.git
git checkout master
git fetch upstream
git merge upstream/master master
git pull origin master
git push


# 请同步更新master分支之后将变更文件同步到turing分支
#git checkout turing
#git fetch upstream
#git merge upstream/master turing
#git pull origin turing
#git push
