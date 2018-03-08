## 引用不同模块中的名称

> [ch07-03-importing-names-with-use.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch07-03-importing-names-with-use.md)
> <br>
> commit 550c8ea6f74060ff1f7b67e7e1878c4da121682d

我们已经讲到了如何使用模块名称作为调用的一部分，来调用模块中的函数，如示例 7-7 中所示的 `nested_modules` 函数调用。

<span class="filename">文件名: src/main.rs</span>

```rust
pub mod a {
    pub mod series {
        pub mod of {
            pub fn nested_modules() {}
        }
    }
}

fn main() {
    a::series::of::nested_modules();
}
```

<span class="caption">示例 7-7：通过完全指定模块中的路径来调用函数</span>

如你所见，指定函数的完全限定名称可能会非常冗长。所幸 Rust 有一个关键字使得这些调用显得更简洁。

### 使用 `use` 关键字将名称导入作用域

Rust 的 `use` 关键字的工作通过将想要调用的函数所在的模块引入到作用域中来缩短冗长的函数调用。这是一个将 `a::series::of` 模块导入一个二进制 crate 的根作用域的例子：

<span class="filename">文件名: src/main.rs</span>

```rust
pub mod a {
    pub mod series {
        pub mod of {
            pub fn nested_modules() {}
        }
    }
}

use a::series::of;

fn main() {
    of::nested_modules();
}
```

`use a::series::of;` 这一行的意思是每当想要引用 `of` 模块时，不必使用完整的 `a::series::of` 路径，可以直接使用 `of`。

`use` 关键字只将指定的模块引入作用域；它并不会将其子模块也引入。这就是为什么想要调用 `nested_modules` 函数时仍然必须写成 `of::nested_modules`。

也可以将函数本身引入到作用域中，通过如下在 `use` 中指定函数的方式：

```rust
pub mod a {
    pub mod series {
        pub mod of {
            pub fn nested_modules() {}
        }
    }
}

use a::series::of::nested_modules;

fn main() {
    nested_modules();
}
```

这使得我们可以忽略所有的模块并直接引用函数。

因为枚举也像模块一样组成了某种命名空间，也可以使用 `use` 来导入枚举的成员。对于任何类型的 `use` 语句，如果从一个命名空间导入多个项，可以在最后使用大括号和逗号来列举它们，像这样：

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

use TrafficLight::{Red, Yellow};

fn main() {
    let red = Red;
    let yellow = Yellow;
    let green = TrafficLight::Green;
}
```

我们仍然为 `Green` 成员指定了 `TrafficLight` 命名空间，因为并没有在 `use` 语句中包含 `Green`。

### 使用 glob 将所有名称引入作用域

为了一次将某个命名空间下的所有名称都引入作用域，可以使用 `*` 语法，这称为 **glob 运算符**（*glob operator*）。这个例子将一个枚举的所有成员引入作用域而没有将其一一列举出来：

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

use TrafficLight::*;

fn main() {
    let red = Red;
    let yellow = Yellow;
    let green = Green;
}
```

`*` 会将 `TrafficLight` 命名空间中所有可见的项都引入作用域。请保守的使用 glob：它们是方便的，但是也可能会引入多于预期的内容从而导致命名冲突。

### 使用 `super` 访问父模块

正如我们已经知道的，当创建一个库 crate 时，Cargo 会生成一个 `tests` 模块。现在让我们来深入了解一下。在 `communicator` 项目中，打开 *src/lib.rs*。

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
pub mod client;

pub mod network;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

第十一章会更详细的解释测试，不过其中部分内容现在应该可以理解了：有一个叫做 `tests` 的模块紧邻其他模块，同时包含一个叫做 `it_works` 的函数。即便存在一些特殊注解，`tests` 也不过是另外一个模块！所以我们的模块层次结构看起来像这样：

```text
communicator
 ├── client
 ├── network
 |   └── client
 └── tests
```

测试是为了检验库中的代码而存在的，所以让我们尝试在 `it_works` 函数中调用 `client::connect` 函数，即便现在不准备测试任何功能。这还不能工作：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        client::connect();
    }
}
```

使用 `cargo test` 命令运行测试：

```text
$ cargo test
   Compiling communicator v0.1.0 (file:///projects/communicator)
error[E0433]: failed to resolve. Use of undeclared type or module `client`
 --> src/lib.rs:9:9
  |
9 |         client::connect();
  |         ^^^^^^ Use of undeclared type or module `client`
```

编译失败了，不过为什么呢？并不需要像 *src/main.rs* 那样将 `communicator::` 置于函数前，因为这里肯定是在 `communicator` 库 crate 之内的。失败的原因是路径是相对于当前模块的，在这里就是 `tests`。唯一的例外就是 `use` 语句，它默认是相对于 crate 根模块的。我们的 `tests` 模块需要 `client` 模块位于其作用域中！

那么如何在模块层次结构中回退一级模块，以便在 `tests` 模块中能够调用 `client::connect`函数呢？在 `tests` 模块中，要么可以在开头使用双冒号来让 Rust 知道我们想要从根模块开始并列出整个路径：

```rust,ignore
::client::connect();
```

要么可以使用 `super` 在层级中上移到当前模块的上一级模块，如下：

```rust,ignore
super::client::connect();
```

在这个例子中这两个选择看不出有多么大的区别，不过随着模块层次的更加深入，每次都从根模块开始就会显得很长了。在这些情况下，使用 `super` 来获取当前模块的同级模块是一个好的捷径。再加上，如果在代码中的很多地方指定了从根开始的路径，那么当通过移动子树或到其他位置来重新排列模块时，最终就需要更新很多地方的路径，这就非常乏味无趣了。

在每一个测试中总是不得不编写 `super::` 也会显得很恼人，不过你已经见过解决这个问题的利器了：`use`！`super::` 的功能改变了提供给 `use` 的路径，使其不再相对于根模块而是相对于父模块。

为此，特别是在 `tests` 模块，`use super::something` 是常用的手段。所以现在的测试看起来像这样：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    use super::client;

    #[test]
    fn it_works() {
        client::connect();
    }
}
```

如果再次运行`cargo test`，测试将会通过而且测试结果输出的第一部分将会是：

```text
$ cargo test
   Compiling communicator v0.1.0 (file:///projects/communicator)
     Running target/debug/communicator-92007ddb5330fa5a

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

## 总结

现在你掌握了组织代码的核心科技！利用它们将相关的代码组合在一起、防止代码文件过长并将一个整洁的公有 API 展现给库的用户。

接下来，让我们看看一些标准库提供的集合数据类型，你可以利用它们编写出漂亮整洁的代码。
