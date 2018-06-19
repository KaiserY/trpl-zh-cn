## 附录A - 关键字

> [appendix-01-keywords.md](https://github.com/rust-lang/book/blob/master/second-edition/src/appendix-01-keywords.md)
> <br>
> commit 32215c1d96c9046c0b553a05fa5ec3ede2e125c3 

下面的列表中是Rust正在使用或者以后会用关键字。因此，这些关键字不能被用作标识符，例如
函数、变量、参数、结构体、模块、crate、常量、宏、静态值、属性、类型、trait 或生命周期
的名字。

### 目前正在使用的关键字

* `as` - 强制类型转换或者对使用`use`和`extern crate`声明引入的项目重命名
* `break` - 立刻退出循环
* `const` - 定义常量或者 **不变原生指针** (*constant raw pointers*)
* `continue` - 跳出本次循环，进入下一次循环
* `crate` - 引入一个外部 **crate** 或一个代表 **crate** 的宏变量
* `else` - 创建 `if` 和 `if let` 控制流的分支
* `enum` - 定义一个枚举
* `extern` - 引入一个外部 **crate** 、函数或变量
* `false` - 布尔值 `false`
* `fn` - 定义一个函数或 **函数指针类型** (*function pointer type*)
* `for` - 遍历一个迭代器或实现一个 **trait**或者指定一个具体的生命周期
* `if` - 基于条件表达式的结果分支
* `impl` - 实现一个方法或 **trait** 功能
* `in` - for循环语法的一部分
* `let` - 绑定一个变量
* `loop` - 无条件循环
* `match` - 模式匹配
* `mod` - 定义一个模块
* `move` - 使闭包获取所有权
* `mut` - 表示一个可变绑定
* `pub` - 在结构体、`impl`块或模块中表示可以被外部使用
* `ref` - 绑定一个引用
* `return` - 从函数中返回
* `Self` - 实现一个 **trait** 类型的类型别名
* `self` - 表示方法本身或当前模块
* `static` - 表示全局变量或在整个程序执行期间保持其生命周期
* `struct` - 定义一个结构体
* `super` - 表示当前模块的父模块
* `trait` - 定义一个 **trait**
* `true` - 布尔值 `true`
* `type` - 定义一个类型别名或相关联的类型
* `unsafe` - 表示不安全的代码、函数、**traits** 或者方法实现
* `use` - 引入外部空间的符号
* `where` - 表示一个类型约束 [\[For example\]][ch13-01]
* `while` - 基于一个表达式的结果判断是否进行循环

[ch13-01]: ch13-01-closures.html#使用带有泛型和-fn-trait-的闭包

<!-- we should make sure the definitions for each keyword are consistently
phrased, so for example for enum we say "defining an enumeration" but for fn we
passively call it a "function definition" -- perhaps a good medium would be
"define an enumeration" and "define a function"? Can you go through and make
those consistent? I've attempted it for a few, but am wary of changing meaning.
Also, you may decide to go the passive definition route, which is fine by me,
as long as it's consistent-->
<!-- I've tried, I'm not sure how to be active for keywords that are nouns
though. Please let me know if any still seem inconsistent /Carol -->

### 未使用的保留字

这些关键字没有目前任何功能，但是它们是 Rust 未来会使用的保留字。

* `abstract`
* `alignof`
* `become`
* `box`
* `do`
* `final`
* `macro`
* `offsetof`
* `override`
* `priv`
* `proc`
* `pure`
* `sizeof`
* `typeof`
* `unsized`
* `virtual`
* `yield`
