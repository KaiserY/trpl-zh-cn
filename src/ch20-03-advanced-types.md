## 高级类型

> [ch20-03-advanced-types.md](https://github.com/rust-lang/book/blob/main/src/ch20-03-advanced-types.md)
> <br>
> commit 56ec353290429e6547109e88afea4de027b0f1a9

Rust 的类型系统有一些我们曾经提到但尚未讨论过的特性。首先我们将从一般意义上讨论 newtype 并探讨它们作为类型为何有用。接着会转向类型别名（type aliases），一个类似于 newtype 但有着稍微不同的语义的功能。我们还会讨论 `!` 类型和动态大小类型。

### 使用 newtype 模式实现类型安全和抽象

本小节假设你已经阅读了之前的 [“使用 newtype 模式在外部类型上实现外部 trait”][using-the-newtype-pattern] 部分。

newtype 模式还可用于我们到目前为止尚未讨论的其他任务，包括静态地确保值不会混淆以及标注值的单位。你在示例 20-16 中已经看到了一个使用 newtype 来表示单位的例子：`Millimeters` 和 `Meters` 结构体都在 newtype 中封装了 `u32` 值。如果编写了一个有 `Millimeters` 类型参数的函数，不小心使用 `Meters` 或普通的 `u32` 值来调用该函数的程序是不能编译的。

newtype 模式也可以用于抽象掉某个类型的部分实现细节：新的类型可以暴露与其私有内部类型不同的共有 API。

newtype 模式还可以隐藏内部实现。例如，可以提供一个封装了 `HashMap<i32, String>` 的 `People` 类型，用来储存人名以及相应的 ID。使用 `People` 的代码只需与我们提供的公有 API 交互即可，比如向 `People` 集合增加名字字符串的方法；这样这些代码就无需知道在内部我们将一个 `i32` ID 赋予了这个名字了。newtype 模式是一种实现第十八章 [“封装隐藏了实现细节”][encapsulation-that-hides-implementation-details] 中讨论的隐藏实现细节的轻量级封装方法。

### 使用类型别名创建类型同义词

Rust 提供了声明 **类型别名**（*type alias*）的能力，使用 `type` 关键字为现有类型赋予另一个名字。例如，可以像这样创建 `i32` 的别名 `Kilometers`：

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-04-kilometers-alias/src/main.rs:here}}
```

这意味着 `Kilometers` 是 `i32` 的 **同义词**（*synonym*）；不同于示例 20-16 中创建的 `Millimeters` 和 `Meters` 类型。`Kilometers` 并不是一个新的、单独的类型。`Kilometers` 类型的值将被完全当作 `i32` 类型值来对待：

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-04-kilometers-alias/src/main.rs:there}}
```

因为 `Kilometers` 是 `i32` 的别名，它们是同一类型，可以将 `i32` 与 `Kilometers` 相加，也可以将 `Kilometers` 传递给获取 `i32` 参数的函数。但通过这种手段无法获得上一部分讨论的 newtype 模式所提供的类型检查的好处。换句话说，如果在某处混用 `Kilometers` 和 `i32` 的值，编译器也不会给出一个错误。

类型别名的主要用途是减少重复。例如，可能会有这样很长的类型：

```rust,ignore
Box<dyn Fn() + Send + 'static>
```

在函数签名和类型注解中到处书写这个冗长的类型既乏味又容易出错。想象一下有一个项目，到处都是像 Listing 20-25 那样的代码。

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-25/src/main.rs:here}}
```

<span class="caption">示例 20-25: 在很多地方使用名称很长的类型</span>

类型别名通过减少重复使代码更易于管理。在示例 20-26 中，我们为这个冗长的类型引入了名为 `Thunk` 的别名，并可以使用更简洁的 `Thunk` 来替换所有使用该类型的地方。

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-26/src/main.rs:here}}
```

<span class="caption">示例 20-26: 引入类型别名 `Thunk` 来减少重复</span>

这样阅读和编写代码都容易多了！为类型别名选择一个好名字也可以帮助你表达意图（单词 *thunk* 表示会在之后被计算的代码，所以这是一个存放闭包的合适的名字）。

类型别名也经常与 `Result<T, E>` 结合使用来减少重复。考虑一下标准库中的 `std::io` 模块。I/O 操作通常会返回一个 `Result<T, E>` 来处理操作失败的情况。标准库中的 `std::io::Error` 结构体代表了所有可能的 I/O 错误。`std::io` 中的许多函数都会返回 `Result<T, E>`，其中 `E` 是 `std::io::Error`，比如 `Write` trait 中的这些函数：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-05-write-trait/src/lib.rs}}
```

这里重复出现了很多次 `Result<..., Error>`。为此，`std::io` 有这个类型别名声明：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-06-result-alias/src/lib.rs:here}}
```

该声明位于 `std::io` 模块中，因此我们可以使用完全限定的别名 `std::io::Result<T>`；也就是说，`Result<T, E>` 中 `E` 放入了 `std::io::Error`。`Write` trait 中的函数最终看起来像这样：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-06-result-alias/src/lib.rs:there}}
```

类型别名在两个方面有帮助：易于编写**并**在整个 `std::io` 中提供了一致的接口。因为这是一个别名，它只是另一个 `Result<T, E>`，这意味着可以在其上使用 `Result<T, E>` 的任何方法，以及像 `?` 这样的特殊语法。

### 从不返回的 never type

Rust 有一个叫做 `!` 的特殊类型。在类型理论术语中被称为 *empty type*，因为它没有值。我们更倾向于称之为 *never type*。这个名字描述了它的作用：在函数从不返回的时候充当返回值。下面是一个示例：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-07-never-type/src/lib.rs:here}}
```

这段代码可以读作 “函数 `bar` 从不返回”，而从不返回的函数被称为 **发散函数**（*diverging functions*）。不能创建 `!` 类型的值，所以 `bar` 也不可能返回值。

不过一个不能创建值的类型有什么用呢？回想一下示例 2-5 中猜数字游戏的代码；我们在示例 20-27 中重现了其中的一小部分：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-05/src/main.rs:ch19}}
```

<span class="caption">示例 20-27: `match` 语句和一个以 `continue` 结束的分支</span>

当时我们忽略了代码中的一些细节。在第六章 [“`match` 控制流运算符”][the-match-control-flow-operator] 部分，我们学习了 `match` 的分支必须返回相同的类型。如下代码不能工作：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-08-match-arms-different-types/src/main.rs:here}}
```

这里的 `guess` 必须既是整型 **也是** 字符串，而 Rust 要求 `guess` 只能是一个类型。那么 `continue` 返回了什么呢？为什么在示例 20-27 中，一个分支返回 `u32`，而另一个分支却以 `continue` 结束呢？

正如你可能猜到的，`continue` 的值是 `!`。也就是说，当 Rust 要计算 `guess` 的类型时，它会查看这两个分支。前者是 `u32` 值，而后者是 `!` 值。因为 `!` 类型永远不会有值，Rust 决定 `guess` 的类型是 `u32`。

描述这种行为的正式方式是，类型为 `!` 的表达式可以被强制转换为任意其他类型。之所以允许 `match` 分支以 `continue` 结束是因为 `continue` 并不真正返回值；相反它把控制权交回上层循环，所以在 `Err` 的情况，事实上并未对 `guess` 进行赋值。

never type 在 `panic!` 宏中也很有用。还记得 `Option<T>` 上的 `unwrap` 函数吗？它产生一个值或 panic。这里是它的定义：

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-09-unwrap-definition/src/lib.rs:here}}
```

这里与示例 20-27 中的 `match` 发生了相同的情况：Rust 知道 `val` 是 `T` 类型，`panic!` 是 `!` 类型，所以整个 `match` 表达式的结果是 `T` 类型。这能工作是因为 `panic!` 并不产生一个值；它会终止程序。对于 `None` 的情况，`unwrap` 并不返回一个值，所以这些代码是有效的。

最后一个有着 `!` 类型的表达式是 `loop`：

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-10-loop-returns-never/src/main.rs:here}}
```

这里，循环永远也不结束，所以此表达式的值是 `!`。但是如果引入 `break` 这就不为真了，因为循环在执行到 `break` 后就会终止。

### 动态大小类型和 `Sized` trait

Rust 需要知道有关类型的某些细节，例如为特定类型的值需要分配多少空间。这便是起初留下的一个类型系统中令人迷惑的角落：即 **动态大小类型**（*dynamically sized types*）的概念。这有时被称为 “DST” 或 “unsized types”，它们让我们能够编写使用那些只有在运行时才能知道大小的值的代码。

让我们深入研究我们在整本书中一直在使用的动态大小类型 `str` 的细节。没错，不是 `&str`，而是单独的 `str` 就是一个 DST。直到运行时我们都不知道字符串有多长。我们无法在编译时知道字符串的长度，这意味着我们无法创建 `str` 类型的变量，也不能获取 `str` 类型的参数。考虑一下这些代码，它们不能工作：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-11-cant-create-str/src/main.rs:here}}
```

Rust 需要知道应该为特定类型的值分配多少内存，同时所有同一类型的值必须使用相同数量的内存。如果允许编写这样的代码，也就意味着这两个 `str` 需要占用完全相同大小的空间。不过它们有着不同的长度：`s1` 需要 12 字节存储，而 `s2` 需要 15 字节。这也就是为什么不可能创建一个存放动态大小类型的变量的原因。

那么该怎么办呢？在这种情况下，你已经知道答案：`s1` 和 `s2` 的类型是 `&str` 而不是 `str`。如果你回想第四章 [“字符串 slice”][string-slices] 中提到，slice 数据结构仅仅储存了开始位置和 slice 的长度。所以虽然 `&T` 是一个储存了 `T` 所在的内存位置的单个值，`&str` 则是**两个**值：`str` 的地址和其长度。这样，`&str` 就有了一个在编译时可以知道的大小：它是 `usize` 长度的两倍。也就是说，无论所引用的字符串多长，我们总是知道 `&str` 的大小。一般来说，这就是 Rust 使用动态大小类型的方式：它们有一些额外的元信息来储存动态信息的大小。这引出了动态大小类型的黄金法则：必须将动态大小类型的值置于某种指针之后。

可以将 `str` 与所有类型的指针结合：比如 `Box<str>` 或 `Rc<str>`。事实上，之前我们已经见过了，不过是另一个动态大小类型：trait。每一个 trait 都是一个可以通过 trait 名称来引用的动态大小类型。在第十八章 [顾及不同类型值的 trait 对象”][using-trait-objects-that-allow-for-values-of-different-types] 中，我们提到了为了将 trait 用于 trait 对象，必须将它们放入指针之后，比如 `&dyn Trait` 或 `Box<dyn Trait>`（`Rc<dyn Trait>` 也可以）。

为了处理 DST，Rust 提供了 `Sized` trait 来决定一个类型的大小是否在编译时可知。该 trait 会自动为所有在编译时大小已知的类型实现。此外，Rust 隐式地为每一个泛型函数增加了 `Sized` bound。也就是说，对于如下泛型函数定义：

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-12-generic-fn-definition/src/lib.rs}}
```

实际上，这会被当作我们写了如下内容来处理：

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-13-generic-implicit-sized-bound/src/lib.rs}}
```

默认情况下，泛型函数只能作用于在编译时大小已知的类型。然而，你可以使用如下特殊语法来放宽这一限制：

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-14-generic-maybe-sized/src/lib.rs}}
```

`?Sized` 这个 trait bound 表示 “`T` 可以是 `Sized`，也可以不是 `Sized`” 同时这个注解会覆盖泛型类型必须在编译时拥有固定大小的默认规则。具有该含义的 `?Trait` 语法仅适用于 `Sized`，而不适用于其他任何 trait。

另外注意我们将 `t` 参数的类型从 `T` 变为了 `&T`：因为其类型可能不是 `Sized` 的，所以需要将其置于某种指针之后。在这个例子中选择了引用。

接下来，我们将讨论函数和闭包！

[encapsulation-that-hides-implementation-details]:
ch18-01-what-is-oo.html#封装隐藏了实现细节
[string-slices]: ch04-03-slices.html#字符串-slice
[the-match-control-flow-operator]:
ch06-02-match.html#match-控制流结构
[using-trait-objects-that-allow-for-values-of-different-types]:
ch18-02-trait-objects.html#顾及不同类型值的-trait-对象
[using-the-newtype-pattern]: ch20-02-advanced-traits.html#使用-newtype-模式在外部类型上实现外部-trait
