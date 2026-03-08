## 附录 A：关键字

[appendix-01-keywords.md](https://github.com/rust-lang/book/blob/c0f0135ed8056650d0b4b8ac3cffdb277c31f06a/src/appendix-01-keywords.md)

下面的列表包含 Rust 语言当前使用中或为将来使用而保留的关键字。因此，它们不能被用作标识符（原始标识符除外，我们会在 [“原始标识符”][raw-identifiers] 一节中介绍）。_标识符_ 指的是函数、变量、参数、结构体字段、模块、crate、常量、宏、静态值、属性、类型、trait 或生命周期的名字。

[raw-identifiers]: #原始标识符

### 目前正在使用的关键字

如下为目前正在使用的关键字及其功能描述的列表。

- `as` - 原始类型转换，消除特定包含项的 trait 的歧义，或者对 `use` 语句中的项重命名
- `async` - 返回一个 `Future` 而不是阻塞当前线程
- `await` - 暂停执行直到 `Future` 的结果就绪
- `break` - 立刻退出循环
- `const` - 定义常量或常量裸指针（constant raw pointer）
- `continue` - 继续进入下一次循环迭代
- `crate` - 在模块路径中，代指 crate root
- `dyn` - 动态分发 trait 对象
- `else` - 作为 `if` 和 `if let` 控制流结构的 fallback
- `enum` - 定义一个枚举
- `extern` - 链接一个外部函数或变量
- `false` - 布尔字面值 `false`
- `fn` - 定义一个函数或 **函数指针类型** (*function pointer type*)
- `for` - 遍历一个迭代器或实现一个 trait 或者指定一个更高级的生命周期
- `if` - 基于条件表达式的结果分支
- `impl` - 实现自有或 trait 功能
- `in` - `for` 循环语法的一部分
- `let` - 绑定一个变量
- `loop` - 无条件循环
- `match` - 模式匹配
- `mod` - 定义一个模块
- `move` - 使闭包获取其所捕获项的所有权
- `mut` - 表示引用、裸指针或模式绑定的可变性
- `pub` - 表示结构体字段、`impl` 块或模块的公有可见性
- `ref` - 通过引用绑定
- `return` - 从函数中返回
- `Self` - 定义或实现 trait 的类型的类型别名
- `self` - 表示方法本身或当前模块
- `static` - 表示全局变量或在整个程序执行期间保持其生命周期
- `struct` - 定义一个结构体
- `super` - 表示当前模块的父模块
- `trait` - 定义一个 trait
- `true` - 布尔字面值 `true`
- `type` - 定义一个类型别名或关联类型
- `union` - 定义一个 [union]；仅在 union 声明中作为关键字
- `unsafe` - 表示不安全的代码、函数、trait 或实现
- `use` - 将符号引入作用域；为泛型和生命周期约束指定精确捕获
- `where` - 表示一个约束类型的从句
- `while` - 根据表达式的结果进行条件循环

[union]: https://doc.rust-lang.org/reference/items/unions.html

### 为将来使用保留的关键字

以下关键字目前尚无任何功能，但已被 Rust 保留以备将来使用。

- `abstract`
- `become`
- `box`
- `do`
- `final`
- `gen`
- `macro`
- `override`
- `priv`
- `try`
- `typeof`
- `unsized`
- `virtual`
- `yield`

### 原始标识符

**原始标识符**（_Raw identifiers_）是一种允许你使用通常不能使用的关键字的语法。通过在关键字前加上 `r#` 前缀来使用原始标识符。

例如，`match` 是关键字。如果尝试编译如下使用 `match` 作为名字的函数：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
fn match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}
```

会得到这个错误：

```text
error: expected identifier, found keyword `match`
 --> src/main.rs:4:4
  |
4 | fn match(needle: &str, haystack: &str) -> bool {
  |    ^^^^^ expected identifier, found keyword
```

该错误表示你不能将关键字 `match` 用作函数标识符。要将 `match` 用作函数名称，需要使用原始标识符语法，如下所示：

<span class="filename">文件名：src/main.rs</span>

```rust
fn r#match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}

fn main() {
    assert!(r#match("foo", "foobar"));
}
```

此代码编译没有任何错误。注意 `r#` 前缀需同时用于函数名定义和 `main` 函数中的调用。

原始标识符允许你把任意单词用作标识符，即使这个单词恰好是保留关键字。这让我们在选择标识符名称时拥有更大的自由，也让我们能够与那些把这些词当作普通名称、而不是关键字的其他语言程序进行集成。此外，原始标识符还允许你使用采用不同 Rust edition 编写的库。例如，`try` 在 2015 edition 中不是关键字，但在 2018、2021 和 2024 edition 中是。如果你依赖的某个库使用 2015 edition 编写，并且其中有一个名为 `try` 的函数，那么在较新的 edition 中调用它时，就需要使用原始标识符语法，在这里就是 `r#try`。有关 edition 的更多信息，请参见[附录 E][appendix-e]。

[appendix-e]: appendix-05-editions.html
