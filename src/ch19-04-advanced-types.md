## 高级类型

> [ch19-04-advanced-types.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-04-advanced-types.md)
> <br>
> commit e084e1773667c8eae28d9aab6d4939348eec0092

Rust 的类型系统有一些我们曾经提到或用到但没有讨论过的功能。我们从有关 trait 的 newtype 模式开始讨论；首先从一个关于为什么 newtype 与类型一样有用的更宽泛的讨论开始。接着会转向类型别名（type aliases），一个类似于 newtype 但有着稍微不同的语义的功能。我们还会讨论 `!` 类型和动态大小类型。

### 为了类型安全和抽象而使用 newtype 模式

在“高级 trait”部分最后开始的 newtype 模式的讨论中，我们以一个包含一个封装了某类型的字段的元组结构体创建了一个新类型，这对于静态的确保其值不被混淆也是有帮助的，并且它经常用来表示一个值的单元。实际上列表 19-26 中已有一个例子：`Millimeters` 和 `Meters` 结构体都将 `u32` 值封装进了新类型。如果编写了一个有 `Millimeters` 类型参数的函数，不小心使用 `Meters` 或普通的 `u32` 值来调用该函数的程序是不能编译的。

另一个使用 newtype 模式的原因是用来抽象掉一些类型的实现细节：例如，封装类型可以暴露出与直接使用其内部私有类型时所不同的 API，以便限制其功能。新类型也可以隐藏其内部的泛型类型。例如，可以提供一个封装了 `HashMap<i32, String>` 的 `People` 类型，用来储存人名以及相应的 ID。使用 `People` 的代码只需与提供的公有 API 交互即可，比如向 `People` 集合增加名字字符串的方法，这样这些代码就无需知道在内部我们将一个 `i32` ID 赋予了这个名字了。newtype 模式是一种实现第十七章所讨论的隐藏实现细节的封装的轻量级方法。

### 类型别名用来创建同义类型

newtype 模式涉及到创建新结构体来作为新的、单独的类型。Rust 还提供了声明**类型别名**（*type alias*）的能力，使用 `type` 关键字来给予现有类型另一个名字。例如，可以像这样创建 `i32` 的别名 `Kilometers`：

```rust
type Kilometers = i32;
```

这意味着 `Kilometers` 是 `i32` 的**同义词**（*synonym*）；不同于列表 19-26 中创建的 `Millimeters` 和 `Meters` 类型。`Kilometers` 不是一个新的、单独的类型。`Kilometers` 类型的值将被完全当作 `i32` 类型值来对待：

```rust
type Kilometers = i32;

let x: i32 = 5;
let y: Kilometers = 5;

println!("x + y = {}", x + y);
```

因为 `Kilometers` 是 `i32` 的别名，他们是同一类型。可以将 `i32` 与 `Kilometers` 相加，可以将 `Kilometers` 传递给获取 `i32` 参数的函数。但无法获得上一部分讨论的 newtype 模式所提供的类型检查的好处。

类型别名的主要用途是减少重复。例如，可能会有这样很长的类型：

```rust
Box<FnOnce() + Send + 'static>
```

在函数签名或类型注解中每次都书写这个类型将是枯燥且易于出错的。想象一下如列表 19-31 这样全是如此代码的项目：

```rust
let f: Box<FnOnce() + Send + 'static> = Box::new(|| println!("hi"));

fn takes_long_type(f: Box<FnOnce() + Send + 'static>) {
    // ...
}

fn returns_long_type() -> Box<FnOnce() + Send + 'static> {
    // ...
#     Box::new(|| ())
}
```

<span class="caption">列表 19-31：在大部分地方使用名称很长的类型</span>

