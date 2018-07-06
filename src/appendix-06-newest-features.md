## F - 最新功能

> [appendix-06-newest-features.md](https://github.com/rust-lang/book/blob/master/second-edition/src/appendix-06-newest-features.md)
> <br />
> commit b64de01431cdf1020ad3358d2f83e46af68a39ed

自从本书的主要部分完成之后，该附录文档中的特性已经加到 Rust 的稳定版中。

### 字段初始化缩写

我们可以通过具名字段来初始化一个数据结构（结构体、枚举、联合体），如将 `fieldname: fieldname` 缩写为 `fieldname` 。这可以以更少的重复代码来完成一个复杂的初始化语法。

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u8,
}

fn main() {
    let name = String::from("Peter");
    let age = 27;

    // Using full syntax:
    let peter = Person { name: name, age: age };

    let name = String::from("Portia");
    let age = 27;

    // Using field init shorthand:
    let portia = Person { name, age };

    println!("{:?}", portia);
}
```


## 从循环中返回（ loop ）

`loop` 的用法之一是重试一个可以操作，比如检查线程是否完成其任务。然而可能需要将该操作的结果传到其他部分代码。如果加上 `break` 表达式来停止循环，则会从循环中断中返回：

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    assert_eq!(result, 20);
}
```

## `use` 声明中的内置组

如果有一个包含许多不同子模块的复杂模块树，然后需要从每个子模块中引入几个特性，那么将所有导入模块放在同一声明中来保持代码清洁同时避免根模块名重复将会非常有用。

`use` 声明所支持的嵌套在这些情况下对你有帮助：简单的导入和全局导入。例如，下面的代码片段导入了 `bar` 、 `Foo` 、 `baz` 中所有项和 `Bar` ：

```rust
# #![allow(unused_imports, dead_code)]
#
# mod foo {
#     pub mod bar {
#         pub type Foo = ();
#     }
#     pub mod baz {
#         pub mod quux {
#             pub type Bar = ();
#         }
#     }
# }
#
use foo::{
    bar::{self, Foo},
    baz::{*, quux::Bar},
};
#
# fn main() {}
```

## 范围包含

先前，当在表达式中使用范围（ `..` 或 `...` ）时，其必须使用排除上界的 `..` ，而在模式中，则要使用包含上界的 `...` 。而现在，`..=` 可作为语法用于表达式或范围上下文件中的包含范围中。

```rust
fn main() {
    for i in 0 ..= 10 {
        match i {
            0 ..= 5 => println!("{}: low", i),
            6 ..= 10 => println!("{}: high", i),
            _ => println!("{}: out of range", i),
        }
    }
}
```

`...` 语法也可用在匹配语法中，但不能用于表达式中，而 `..=` 则二者皆可。

## 128 字节的整数

Rust 1.26.0 添加了 128 字节的整数基本类型：

- `u128`: 一个在 [0, 2^128 - 1] 范围内的 128 字节的无符号整数
- `i128`: 一个在 [-(2^127), 2^127 - 1] 范围内的有符号整数

这俩基本类型由 LLVM 支持高效地实现。即使在不支持 128 字节整数的平台上，它们都是可用的，且可像其他整数类型那样使用。

这俩基本类型在那些需要高效使用大整数的算法中非常有用，如某些加密算法。
