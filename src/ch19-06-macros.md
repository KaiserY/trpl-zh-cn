## 宏

> [ch19-06-macros.md](https://github.com/rust-lang/book/blob/master/src/ch19-06-macros.md)
> <br>
> commit 7ddc46460f09a5cd9bd2a620565bdc20b3315ea9

我们已经在本书中使用过像 `println!` 这样的宏了，不过还没完全探索什么是宏以及它是如何工作的。**宏**（*Macro*）指的是 Rust 中一系列的功能：**声明**（*Declarative*）宏，使用 `macro_rules!`，和三种 **过程**（*Procedural*）宏：

* 自定义 `#[derive]` 宏在结构体和枚举上指定通过 `derive` 属性添加的代码
* 类属性（Attribute-like）宏定义可用于任意项的自定义属性
* 类函数宏看起来像函数不过作用于作为参数传递的 token。

我们会依次讨论每一种宏，不过首要的是，为什么已经有了函数还需要宏呢？

### 宏和函数的区别

从根本上来说，宏是一种为写其他代码而写代码的方式，即所谓的 **元编程**（*metaprogramming*）。在附录 C 中会探讨 `derive` 属性，其生成各种 trait 的实现。我们也在本书中使用过 `println!` 宏和 `vec!` 宏。所有的这些宏以 **展开** 的方式来生成比你所手写出的更多的代码。

元编程对于减少大量编写和维护的代码是非常有用的，它也扮演了函数扮演的角色。但宏有一些函数所没有的附加能力。

一个函数标签必须声明函数参数个数和类型。相比之下，宏能够接受不同数量的参数：用一个参数调用 `println!("hello")` 或用两个参数调用 `println!("hello {}", name)` 。而且，宏可以在编译器翻译代码前展开，例如，宏可以在一个给定类型上实现 trait 。而函数则不行，因为函数是在运行时被调用，同时 trait 需要在编译时实现。

实现一个宏而不是函数的消极面是宏定义要比函数定义更复杂，因为你正在编写生成 Rust 代码的 Rust 代码。由于这样的间接性，宏定义通常要比函数定义更难阅读、理解以及维护。

宏和函数的最后一个重要的区别是：在一个文件里调用宏 **之前** 必须定义它，或将其引入作用域，而函数则可以在任何地方定义和调用。

### 使用 `macro_rules!` 的声明宏用于通用元编程

Rust 最常用的宏形式是 **声明宏**（*declarative macros*）。它们有时也被称为 “macros by example”、“`macro_rules!` 宏” 或者就是 “macros”。其核心概念是，声明宏允许我们编写一些类似 Rust `match` 表达式的代码。正如在第六章讨论的那样，`match` 表达式是控制结构，其接收一个表达式，与表达式的结果进行模式匹配，然后根据模式匹配执行相关代码。宏也将一个值和包含相关代码的模式进行比较；此种情况下，该值是传递给宏的 Rust 源代码字面值，模式用于和传递给宏的源代码进行比较，同时每个模式的相关代码则用于替换传递给宏的代码。所有这一切都发生于编译时。

可以使用 `macro_rules!` 来定义宏。让我们通过查看 `vec!` 宏定义来探索如何使用 `macro_rules!` 结构。第八章讲述了如何使用 `vec!` 宏来生成一个给定值的 vector。例如，下面的宏用三个整数创建一个 vector：

```rust
let v: Vec<u32> = vec![1, 2, 3];
```

也可以使用 `vec!` 宏来构造两个整数的 vector 或五个字符串 slice 的 vector 。但却无法使用函数做相同的事情，因为我们无法预先知道参数值的数量和类型。

在示例 19-28 中展示了一个 `vec!` 稍微简化的定义。

<span class="filename">文件名: src/lib.rs</span>

```rust
#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

<span class="caption">示例 19-28: 一个 `vec!` 宏定义的简化版本</span>

> 注意：标准库中实际定义的 `vec!` 包括预分配适当量的内存的代码。这部分为代码优化，为了让示例简化，此处并没有包含在内。


无论何时导入定义了宏的包，`#[macro_export]` 注解说明宏应该是可用的。 如果没有该注解，这个宏不能被引入作用域。

接着使用 `macro_rules!` 和宏名称开始宏定义，且所定义的宏并 **不带** 感叹号。名字后跟大括号表示宏定义体，在该例中宏名称是 `vec` 。

`vec!` 宏的结构和 `match` 表达式的结构类似。此处有一个单边模式 `( $( $x:expr ),* )` ，后跟 `=>` 以及和模式相关的代码块。如果模式匹配，该相关代码块将被执行。假设这是这个宏中唯一的模式，则只有这一种有效匹配，其他任何匹配都是错误的。更复杂的宏会有多个单边模式。

宏定义中有效模式语法和在第十八章提及的模式语法是不同的，因为宏模式所匹配的是 Rust 代码结构而不是值。回过头来检查下示例 19-28 中模式片段什么意思。对于全部的宏模式语法，请查阅[参考]。

[参考]: https://doc.rust-lang.org/reference/macros.html

首先，一对括号包含了整个模式。接下来是美元符号（ `$` ），后跟一对括号，捕获了符合括号内模式的值以用于替换后的代码。`$()` 内则是 `$x:expr` ，其匹配 Rust 的任意表达式，并将该表达式记作 `$x`。

`$()` 之后的逗号说明一个可有可无的逗号分隔符可以出现在 `$()` 所匹配的代码之后。紧随逗号之后的 `*` 说明该模式匹配零个或更多个 `*` 之前的任何模式。

当以 `vec![1, 2, 3];` 调用宏时，`$x` 模式与三个表达式 `1`、`2` 和 `3` 进行了三次匹配。

现在让我们来看看与此单边模式相关联的代码块中的模式：对于每个（在 `=>` 前面）匹配模式中的 `$()` 的部分，生成零个或更多个（在 `=>` 后面）位于 `$()*` 内的 `temp_vec.push()` ，生成的个数取决于该模式被匹配的次数。`$x` 由每个与之相匹配的表达式所替换。当以 `vec![1, 2, 3];` 调用该宏时，替换该宏调用所生成的代码会是下面这样：

```rust,ignore
let mut temp_vec = Vec::new();
temp_vec.push(1);
temp_vec.push(2);
temp_vec.push(3);
temp_vec
```

我们已经定义了一个宏，其可以接收任意数量和类型的参数，同时可以生成能够创建包含指定元素的 vector 的代码。

`macro_rules!` 中有一些奇怪的地方。在将来，会有第二种采用 `macro` 关键字的声明宏，其工作方式类似但修复了这些极端情况。在此之后，`macro_rules!` 实际上就过时（deprecated）了。在此基础之上，同时鉴于大多数 Rust 程序员 **使用** 宏而非 **编写** 宏的事实，此处不再深入探讨 `macro_rules!`。请查阅在线文档或其他资源，如 [“The Little Book of Rust Macros”][tlborm] 来更多地了解如何写宏。

[tlborm]: https://danielkeep.github.io/tlborm/book/index.html

### 用于从属性生成代码的过程宏

第二种形式的宏被称为 **过程宏**（*procedural macros*），因为它们更像函数（一种过程类型）。过程宏接收 Rust 代码作为输入，在这些代码上进行操作，然后产生另一些代码作为输出，而非像声明式宏那样匹配对应模式然后以另一部分代码替换当前代码。

有三种类型的过程宏（自定义派生（derive），类属性和类函数），不过它们的工作方式都类似。

当创建过程宏时，其定义必须位于一种特殊类型的属于它们自己的 crate 中。这么做出于复杂的技术原因，将来我们希望能够消除这些限制。使用这些宏需采用类似示例 19-29 所示的代码形式，其中 `some_attribute` 是一个使用特定宏的占位符。

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
use proc_macro;

#[some_attribute]
pub fn some_name(input: TokenStream) -> TokenStream {
}
```

<span class="caption">示例 19-29: 一个使用过程宏的例子</span>

过程宏包含一个函数，这也是其得名的原因：“过程” 是 “函数” 的同义词。那么为何不叫 “函数宏” 呢？好吧，有一个过程宏是 “类函数” 的，叫成函数会产生混乱。无论如何，定义过程宏的函数接受一个 `TokenStream` 作为输入并产生一个 `TokenStream` 作为输出。这也就是宏的核心：宏所处理的源代码组成了输入 `TokenStream`，同时宏生成的代码是输出 `TokenStream`。最后，函数上有一个属性；这个属性表明过程宏的类型。在同一 crate 中可以有多种的过程宏。

考虑到这些宏是如此类似，我们会从自定义派生宏开始。接着会解释与其他形式宏的微小区别。

### 如何编写自定义 `derive` 宏

让我们创建一个 `hello_macro` crate，其包含名为 `HelloMacro` 的 trait 和关联函数 `hello_macro`。不同于让 crate 的用户为其每一个类型实现 `HelloMacro` trait，我们将会提供一个过程式宏以便用户可以使用 `#[derive(HelloMacro)]` 注解他们的类型来得到 `hello_macro` 函数的默认实现。该默认实现会打印 `Hello, Macro! My name is TypeName!`，其中 `TypeName` 为定义了 trait 的类型名。换言之，我们会创建一个 crate，使程序员能够写类似示例 19-30 中的代码。

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use hello_macro::HelloMacro;
use hello_macro_derive::HelloMacro;

#[derive(HelloMacro)]
struct Pancakes;

fn main() {
    Pancakes::hello_macro();
}
```

<span class="caption">示例 19-30: crate 用户所写的能够使用过程式宏的代码</span>

运行该代码将会打印 `Hello, Macro! My name is Pancakes!` 第一步是像下面这样新建一个库 crate：

```text
$ cargo new hello_macro --lib
```

接下来，会定义 `HelloMacro` trait 以及其关联函数：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub trait HelloMacro {
    fn hello_macro();
}
```

现在有了一个包含函数的 trait 。此时，crate 用户可以实现该 trait 以达到其期望的功能，像这样：

```rust,ignore
use hello_macro::HelloMacro;

struct Pancakes;

impl HelloMacro for Pancakes {
    fn hello_macro() {
        println!("Hello, Macro! My name is Pancakes!");
    }
}

fn main() {
    Pancakes::hello_macro();
}
```

然而，他们需要为每一个他们想使用 `hello_macro` 的类型编写实现的代码块。我们希望为其节约这些工作。

另外，我们也无法为 `hello_macro` 函数提供一个能够打印实现了该 trait 的类型的名字的默认实现：Rust 没有反射的能力，因此其无法在运行时获取类型名。我们需要一个在编译时生成代码的宏。

下一步是定义过程式宏。在编写本部分时，过程式宏必须在其自己的 crate 内。该限制最终可能被取消。构造 crate 和其中宏的惯例如下：对于一个 `foo` 的包来说，一个自定义的派生过程宏的包被称为 `foo_derive` 。在 `hello_macro` 项目中新建名为 `hello_macro_derive` 的包。

```text
$ cargo new hello_macro_derive --lib
```

由于两个 crate 紧密相关，因此在 `hello_macro` 包的目录下创建过程式宏的 crate。如果改变在 `hello_macro` 中定义的 trait ，同时也必须改变在 `hello_macro_derive` 中实现的过程式宏。这两个包需要分别发布，编程人员如果使用这些包，则需要同时添加这两个依赖并将其引入作用域。我们也可以只用 `hello_macro` 包而将 `hello_macro_derive` 作为一个依赖，并重新导出过程式宏的代码。但现在我们组织项目的方式使编程人员在无需 `derive` 功能时也能够单独使用 `hello_macro`。

需要将 `hello_macro_derive` 声明为一个过程宏的 crate。同时也需要 `syn` 和 `quote` crate 中的功能，正如注释中所说，需要将其加到依赖中。为 `hello_macro_derive` 将下面的代码加入到 *Cargo.toml* 文件中。

<span class="filename">文件名: hello_macro_derive/Cargo.toml</span>

```toml
[lib]
proc-macro = true

[dependencies]
syn = "0.14.4"
quote = "0.6.3"
```

为定义一个过程式宏，请将示例 19-31 中的代码放在 `hello_macro_derive` crate 的 *src/lib.rs* 文件里面。注意这段代码在我们添加 `impl_hello_macro` 函数的定义之前是无法编译的。

<span class="filename">文件名: hello_macro_derive/src/lib.rs</span>

<!--
This usage of `extern crate` is required for the moment with 1.31.0, see:
https://github.com/rust-lang/rust/issues/54418
https://github.com/rust-lang/rust/pull/54658
https://github.com/rust-lang/rust/issues/55599
-->

> 在 Rust 1.31.0 时，`extern crate` 仍是必须的，请查看 <br />
> https://github.com/rust-lang/rust/issues/54418 <br />
> https://github.com/rust-lang/rust/pull/54658 <br />
> https://github.com/rust-lang/rust/issues/55599

```rust,ignore
extern crate proc_macro;

use crate::proc_macro::TokenStream;
use quote::quote;
use syn;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // 构建 Rust 代码所代表的语法树
    // 以便可以进行操作
    let ast = syn::parse(input).unwrap();

    // 构建 trait 实现
    impl_hello_macro(&ast)
}
```

<span class="caption">示例 19-31: 大多数过程式宏处理 Rust 代码时所需的代码</span>

注意 `hello_macro_derive` 函数中代码分割的方式，它负责解析 `TokenStream`，而 `impl_hello_macro` 函数则负责转换语法树：这让编写一个过程式宏更加方便。外部函数中的代码（在这里是 `hello_macro_derive`）几乎在所有你能看到或创建的过程宏 crate 中都一样。内部函数（在这里是 `impl_hello_macro`）的函数体中所指定的代码则依过程宏的目的而各有不同。

现在，我们已经引入了三个新的 crate：`proc_macro` 、 [`syn`] 和 [`quote`] 。Rust 自带 `proc_macro` crate，因此无需将其加到 *Cargo.toml* 文件的依赖中。`proc_macro` crate 是编译器用来读取和操作我们 Rust 代码的 API。

[`syn`]: https://crates.io/crates/syn
[`quote`]: https://crates.io/crates/quote

`syn` crate 将字符串中的 Rust 代码解析成为一个可以操作的数据结构。`quote` 则将 `syn` 解析的数据结构转换回 Rust 代码。这些 crate 让解析任何我们所要处理的 Rust 代码变得更简单：为 Rust 编写整个的解析器并不是一件简单的工作。

当用户在一个类型上指定 `#[derive(HelloMacro)]` 时，`hello_macro_derive`  函数将会被调用。原因在于我们已经使用 `proc_macro_derive` 及其指定名称对 `hello_macro_derive` 函数进行了注解：`HelloMacro` ，其匹配到 trait 名，这是大多数过程宏遵循的习惯。

该函数首先将来自 `TokenStream` 的 `input` 转换为一个我们可以解释和操作的数据结构。这正是 `syn` 派上用场的地方。`syn` 中的 `parse_derive_input` 函数获取一个 `TokenStream` 并返回一个表示解析出 Rust 代码的 `DeriveInput` 结构体。示例 19-32 展示了从字符串 `struct Pancakes;` 中解析出来的 `DeriveInput` 结构体的相关部分：

```rust,ignore
DeriveInput {
    // --snip--

    ident: Ident {
        ident: "Pancakes",
        span: #0 bytes(95..103)
    },
    data: Struct(
        DataStruct {
            struct_token: Struct,
            fields: Unit,
            semi_token: Some(
                Semi
            )
        }
    )
}
```

<span class="caption">示例 19-32: 解析示例 19-30 中带有宏属性的代码时得到的 `DeriveInput` 实例</span>

该结构体的字段展示了我们解析的 Rust 代码是一个类单元结构体，其 `ident`（ identifier，表示名字）为 `Pancakes`。该结构体里面有更多字段描述了所有类型的 Rust 代码，查阅 [`syn` 中 `DeriveInput` 的文档][syn-docs] 以获取更多信息。

[syn-docs]: https://docs.rs/syn/0.14.4/syn/struct.DeriveInput.html

此时，尚未定义 `impl_hello_macro` 函数，其用于构建所要包含在内的 Rust 新代码。但在此之前，注意其输出也是 `TokenStream`。所返回的 `TokenStream` 会被加到我们的 crate 用户所写的代码中，因此，当用户编译他们的 crate 时，他们会获取到我们所提供的额外功能。

你可能也注意到了，当调用 `syn::parse` 函数失败时，我们用 `unwrap` 来使 `hello_macro_derive` 函数 panic。在错误时 panic 对过程宏来说是必须的，因为 `proc_macro_derive` 函数必须返回 `TokenStream` 而不是 `Result`，以此来符合过程宏的 API。这里选择用 `unwrap` 来简化了这个例子；在生产代码中，则应该通过 `panic!` 或 `expect` 来提供关于发生何种错误的更加明确的错误信息。

现在我们有了将注解的 Rust 代码从 `TokenStream` 转换为 `DeriveInput` 实例的代码，让我们来创建在注解类型上实现 `HelloMacro` trait 的代码，如示例 19-33 所示。

<span class="filename">文件名: hello_macro_derive/src/lib.rs</span>

```rust,ignore
fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let gen = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}", stringify!(#name));
            }
        }
    };
    gen.into()
}
```

<span class="caption">示例 19-33: 使用解析过的 Rust 代码实现 `HelloMacro` trait</span>

我们得到一个包含以 `ast.ident` 作为注解类型名字（标识符）的 `Ident` 结构体实例。示例 19-32 中的结构体表明当 `impl_hello_macro` 函数运行于示例 19-30 中的代码上时 `ident` 字段的值是 `"Pancakes"`。因此，示例 19-33 中 `name` 变量会包含一个 `Ident` 结构体的实例，当打印时，会是字符串 `"Pancakes"`，也就是示例 19-30 中结构体的名称。

`quote!` 宏让我们可以编写希望返回的 Rust 代码。`quote!` 宏执行的直接结果并不是编译器所期望的并需要转换为 `TokenStream`。为此需要调用 `into` 方法，它会消费这个中间表示（intermediate representation，IR）并返回所需的 `TokenStream` 类型值。

这个宏也提供了一些非常酷的模板机制；我们可以写 `#name` ，然后 `quote!` 会以名为 `name` 的变量值来替换它。你甚至可以做一些类似常用宏那样的重复代码的工作。查阅 [`quote` crate 的文档][quote-docs] 来获取详尽的介绍。

[quote-docs]: https://docs.rs/quote

我们期望我们的过程式宏能够为通过 `#name` 获取到的用户注解类型生成 `HelloMacro` trait 的实现。该 trait 的实现有一个函数 `hello_macro` ，其函数体包括了我们期望提供的功能：打印 `Hello, Macro! My name is` 和注解的类型名。

此处所使用的 `stringify!` 为 Rust 内置宏。其接收一个 Rust 表达式，如 `1 + 2` ， 然后在编译时将表达式转换为一个字符串常量，如 `"1 + 2"` 。这与 `format!` 或 `println!` 是不同的，它计算表达式并将结果转换为 `String` 。有一种可能的情况是，所输入的 `#name` 可能是一个需要打印的表达式，因此我们用 `stringify!` 。 `stringify!` 编译时也保留了一份将 `#name` 转换为字符串之后的内存分配。

此时，`cargo build` 应该都能成功编译 `hello_macro` 和 `hello_macro_derive` 。我们将这些 crate 连接到示例 19-38 的代码中来看看过程宏的行为！在 *projects* 目录下用 `cargo new pancakes` 命令新建一个二进制项目。需要将 `hello_macro` 和 `hello_macro_derive` 作为依赖加到 `pancakes` 包的 *Cargo.toml*  文件中去。如果你正将 `hello_macro` 和 `hello_macro_derive` 的版本发布到 [crates.io](https://crates.io/) 上，其应为常规依赖；如果不是，则可以像下面这样将其指定为 `path` 依赖：

```toml
[dependencies]
hello_macro = { path = "../hello_macro" }
hello_macro_derive = { path = "../hello_macro/hello_macro_derive" }
```

把示例 19-38 中的代码放在 *src/main.rs* ，然后执行 `cargo run`：其应该打印 `Hello, Macro! My name is Pancakes!`。其包含了该过程宏中 `HelloMacro` trait 的实现，而无需 `pancakes` crate 实现它；`#[derive(HelloMacro)]` 增加了该 trait 实现。

接下来，让我们探索一下其他类型的过程宏与自定义派生宏有何区别。

### 类属性宏

类属性宏与自定义派生宏相似，不同于为 `derive` 属性生成代码，它们允许你创建新的属性。它们也更为灵活；`derive` 只能用于结构体和枚举；属性还可以用于其它的项，比如函数。作为一个使用类属性宏的例子，可以创建一个名为 `route` 的属性用于注解 web 应用程序框架（web application framework）的函数：

```rust,ignore
#[route(GET, "/")]
fn index() {
```

`#[route]` 属性将由框架本身定义为一个过程宏。其宏定义的函数签名看起来像这样：

```rust,ignore
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {
```

这里有两个 `TokenStream` 类型的参数；第一个用于属性内容本身，也就是 `GET, "/"` 部分。第二个是属性所标记的项：在本例中，是 `fn index() {}` 和剩下的函数体。

除此之外，类属性宏与自定义派生宏工作方式一致：创建 `proc-macro` crate 类型的 crate 并实现希望生成代码的函数！

### 类函数宏

类函数宏定义看起来像函数调用的宏。类似于 `macro_rules!`，它们比函数更灵活；例如，可以接受未知数量的参数。然而 `macro_rules!` 宏只能使用之前 [“使用 `macro_rules!` 的声明宏用于通用元编程”][decl] 介绍的类匹配的语法定义。类函数宏获取 `TokenStream` 参数，其定义使用 Rust 代码操纵 `TokenStream`，就像另两种过程宏一样。一个类函数宏例子是可以像这样被调用的 `sql!` 宏：

[decl]: #declarative-macros-with-macro_rules-for-general-metaprogramming

```rust,ignore
let sql = sql!(SELECT * FROM posts WHERE id=1);
```

这个宏会解析其中的 SQL 语句并检查其是否是句法正确的，这是比 `macro_rules!` 可以做到的更为复杂的处理。`sql!` 宏应该被定义为如此：

```rust,ignore
#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {
```

这类似于自定义派生宏的签名：获取括号中的 token，并返回希望生成的代码。

## 总结

好的！现在我们学习了 Rust 并不常用但在特定情况下你可能用得着的功能。我们介绍了很多复杂的主题，这样若你在错误信息提示或阅读他人代码时遇到他们，至少可以说之前已经见过这些概念和语法了。你可以使用本章作为一个解决方案的参考。

接下来，我们将再开始一个项目，将本书所学的所有内容付与实践！
