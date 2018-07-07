## 附录D - 宏

> [appendix-04-macros.md][appendix-04]
> <br>
> commit 32215c1d96c9046c0b553a05fa5ec3ede2e125c3

[appendix-04]: https://github.com/rust-lang/book/blob/master/second-edition/src/appendix-04-macros.md

我们已经在本书中像 *println!* 这样使用过宏了，但还没完全探索什么是宏以及它是如何工作的。本附录以如下方式解释宏：

* 什么是宏以及与函数有何区别
* 如何定义一个声明式宏（ declarative macro ）来进行元编程（metaprogramming）
* 如何定义一个过程式宏（ procedural macro ）来自定义 `derive` traits

因为在 Rust 里宏仍在开发中，该附录会介绍宏的细节。宏已经改变了，在不久的将来，和语言的其他部分以及从 Rust 1.0 至今的标准库相比，将会以更快的速率改变，因此，和本书其他部分相比，本部分更有可能变得过时。由于 Rust 的稳定性保证，该处的代码将会在后续版本中继续可运行，但可能会以更优的性能或更容易的方式来写那些在此次发布版中无法实现的宏。当你尝试实现该附录任何功能时，请记住这一点。

### 宏和函数的区别

从根本上来说，宏是一种为写其他代码而写代码的方式，即所谓的*元编程*。在附录C中，探讨了 `derive` 属性，其生成各种 trait 的实现。我们也在本书中使用过 `println!` 宏和 `vec!` 宏。所有的这些宏 *扩展开* 来以生成比你手写更多的代码。

元编程对于减少大量编写和维护的代码是非常有用的，它也扮演了函数的角色。但宏有一些函数所没有的附加能力。

一个函数标签必须声明函数参数个数和类型。而宏只接受一个可变参数：用一个参数调用 `println!("hello")` 或用两个参数调用 `println!("hello {}", name)` 。而且，宏可以在编译器翻译代码前展开，例如，宏可以在一个给定类型上实现 trait 。因为函数是在运行时被调用，同时 trait 需要在运行时实现，所以函数无法像宏这样。

实现一个宏而不是函数的消极面是宏定义要比函数定义更复杂，因为你正在为写 Rust 代码而写代码。由于这样的间接性，宏定义通常要比函数定义更难阅读、理解以及维护。

宏和函数的另一个区别是：宏定义无法像函数定义那样出现在模块命名空间中。当使用外部包（ external crate ）时，为了防止无法预料的名字冲突，在导入外部包的同时也必须明确地用 `#[macro_use]` 注解将宏导入到项目中。下面的例子将所有定义在 `serde` 包中的宏导入到当前包中：

```rust,ignore
#[macro_use]
extern crate serde;
```

如果 `extern crate` 能够将宏默认导入而无需使用明确的注解，则会阻止你使用同时定义相同宏名的两个包。在练习中，这样的冲突并不经常遇到，但使用的包越多，越有可能遇到。

宏和函数最重要的区别是：在一个文件中，必须在调用宏`之前`定义或导入宏，然而却可以在任意地方定义或调用函数。

### 通用元编程的声明式宏 `macro_rules!`

在 Rust 中，最广泛使用的宏形式是 *declarative macros* 。通常也指 *macros by example* 、*`macro_rules!` macros* 或简单的 *macros* 。在其核心中，声明式宏使你可以写一些和 Rust 的 `match` 表达式类似的代码。正如在第六章讨论的那样，`match` 表达式是控制结构，其接收一个表达式，与表达式的结果进行模式匹配，然后根据模式匹配执行相关代码。宏也将一个值和包含相关代码的模式进行比较；此种情况下，该值是 Rust 源代码传递给宏的常量，而模式则与源代码结构进行比较，同时每个模式的相关代码成为传递给宏的代码<!-- 这部分翻译自己不太满意-->。所有的这些都在编译时发生。

可以使用 `macro_rules!` 来定义宏。让我们通过查看 `vec!` 宏定义来探索如何使用 `macro_rules!` 结构。第八章讲述了如何使用 `vec!` 宏来生成一个给定值的 vector。例如，下面的宏用三个整数创建一个 vector `：

```rust
let v: Vec<u32> = vec![1, 2, 3];
```

也可以使用 `vec!` 宏来构造两个整数的 vector 或五个字符串切片的 vector 。但却无法使用函数做相同的事情，因为我们无法预先知道参数值的数量和类型。

在示例 D-1 中来看一个 `vec!` 稍微简化的定义。 

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

<span class="caption">示例 D-1: `vec!` 宏定义的一个简化版本</span>

> 注意：标准库中实际定义的 `vec!` 包括预分配适当量的内存。这部分为代码优化，为了让示例简化，此处并没有包含在内。

无论何时导入定义了宏的包，`#[macro_export]` 注解说明宏应该是可用的。 如果没有 `#[macro_export]` 注解，即使凭借包使用 `#[macro_use]` 注解，该宏也不会导入进来，

接着使用 `macro_rules!` 进行了宏定义，且所定义的宏并*不带*感叹号。名字后跟大括号表示宏定义体，在该例中是 `vec` 。

`vec!` 宏的结构和 `match` 表达式的结构类似。此处有一个单边模式 `( $( $x:expr ),* )` ，后跟 `=>` 以及和模式相关的代码块。如果模式匹配，该相关代码块将被执行。假设这只是这个宏中的模式，且只有一个有效匹配，其他任何匹配都是错误的。更复杂的宏会有多个单边模式。<!-- 此处 arm, one arm 并未找到合适的翻译-->

宏定义中有效模式语法和在第十八章提及的模式语法是不同的，因为宏模式所匹配的是 Rust 代码结构而不是值。回过头来检查下示例 D-1 中模式片段什么意思。对于全部的宏模式语法，请查阅[参考]。

[参考]: https://github.com/rust-lang/book/blob/master/reference/macros.html

首先，一对括号包含了全部模式。接下来是后跟一对括号的美元符号（ `$` ），其通过替代代码捕获了符合括号内模式的值。`$()` 内则是 `$x:expr` ，其匹配 Rust 的任意表达式或给定 `$x` 名字的表达式。

`$()` 之后的逗号说明一个逗号分隔符可以有选择的出现代码之后，这段代码与在 `$()` 中所捕获的代码相匹配。紧随逗号之后的 `*` 说明该模式匹配零个或多个 `*` 之前的任何模式。

当以 `vec![1, 2, 3];` 调用宏时，`$x` 模式与三个表达式 `1`、`2` 和 `3` 进行了三次匹配。

现在让我们来看看这个出现在与此单边模式相关的代码块中的模式：在 `$()*` 部分中所生成的 `temp_vec.push()` 为在匹配到模式中的 `$()` 每一部分而生成。`$x` 由每个与之相匹配的表达式所替换。当以 `vec![1, 2, 3];` 调用该宏时，替换该宏调用所生成的代码会是下面这样：

```rust,ignore
let mut temp_vec = Vec::new();
temp_vec.push(1);
temp_vec.push(2);
temp_vec.push(3);
temp_vec
```

我们已经定义了一个宏，其可以接收任意数量和类型的参数，同时可以生成能够创建包含指定元素的 vector 的代码。


鉴于大多数 Rust 程序员*使用*宏而不是*写*宏，此处不再深入探讨 `macro_rules!` 。请查阅在线文档或其他资源，如 [“The Little Book of Rust Macros”][tlborm] 来更多地了解如何写宏。

[tlborm]: https://danielkeep.github.io/tlborm/book/index.html

### 自定义 `derive` 的过程式宏

第二种形式的宏叫做*过程式宏*（ *procedural macros* ），因为它们更像函数（一种过程类型）。过程式宏接收 Rust 代码作为输入，在这些代码上进行操作，然后产生另一些代码作为输出，而非像声明式宏那样匹配对应模式然后以另一部分代码替换当前代码。在书写部分附录时，只能定义过程式宏来使你在一个通过 `derive` 注解来指定 trait 名的类型上实现 trait 。

我们会创建一个 `hello_macro` 包，该包定义了一个关联到 `hello_macro` 函数并以 `HelloMacro` 为名的trait。并非让包的用户为其每一个类型实现`HelloMacro` trait，我们将会提供一个过程式宏以便用户可以使用 `#[derive(HelloMacro)]` 注解他们的类型来得到 `hello_macro` 函数的默认实现。该函数的默认实现会打印 `Hello, Macro! My name is TypeName!`，其中 `TypeName` 为定义了 trait 的类型名。换言之，我们会创建一个包，让使用该包的程序员能够写类似示例 D-2 中的代码。 

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
extern crate hello_macro;
#[macro_use]
extern crate hello_macro_derive;

use hello_macro::HelloMacro;

#[derive(HelloMacro)]
struct Pancakes;

fn main() {
    Pancakes::hello_macro();
}
```

<span class="caption">示例 D-2: 包用户所写的能够使用过程式宏的代码</span>

运行该代码将会打印 `Hello, Macro! My name is Pancakes!` 第一步是像下面这样新建一个库：

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

现在有了一个包含函数的 trait 。此时，包用户可以实现该 trait 以达到其期望的功能，像这样：

```rust,ignore
extern crate hello_macro;

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

另外，我们也无法为 `hello_macro` 函数提供一个能够打印实现了该 trait 的类型的名字的默认实现：Rust 没有反射的能力，因此其无法在运行时获取类型名。我们需要一个在运行时生成代码的宏。

下一步是定义过程式宏。在编写该附录时，过程式宏必须在包内。该限制后面可能被取消。构造包和包中宏的惯例如下：对于一个 `foo` 的包来说，一个自定义的派生过程式宏的包被称为 `foo_derive` 。在 `hello_macro` 项目中新建名为 `hello_macro_derive` 的包。

```text
$ cargo new hello_macro_derive --lib
```

由于两个包紧密相关，因此在 `hello_macro` 包的目录下创建过程式宏的包。如果改变在 `hello_macro` 中定义的 trait ，同时也必须改变在 `hello_macro_derive` 中实现的过程式宏。这两个包需要分别发布，编程人员如果使用这些包，则需要同时添加这两个依赖并导入到代码中。我们也可以只用 `hello_macro` 包而将 `hello_macro_derive` 作为一个依赖，并重新导出过程式宏的代码。但我们组织项目的方式使编程人员使用 `hello_macro` 成为可能，即使他们无需 `derive` 的功能。

需要将 `hello_macro_derive` 声明为一个过程式宏的包。同时也需要 `syn` 和 `quote` 包中的功能，正如注释中所说，需要将其加到依赖中。为 `hello_macro_derive` 将下面的代码加入到 *Cargo.toml* 文件中。

<span class="filename">文件名: hello_macro_derive/Cargo.toml</span>

```toml
[lib]
proc-macro = true

[dependencies]
syn = "0.11.11"
quote = "0.3.15"
```
为定义一个过程式宏，请将示例 D-3 中的代码放在 `hello_macro_derive` 包的 *src/lib.rs* 文件里面。注意这段代码在我们添加 `impl_hello_macro` 函数的定义之前是无法编译的。

<span class="filename">文件名: hello_macro_derive/src/lib.rs</span>

```rust,ignore
extern crate proc_macro;
extern crate syn;
#[macro_use]
extern crate quote;

use proc_macro::TokenStream;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // Construct a string representation of the type definition
    let s = input.to_string();

    // Parse the string representation
    let ast = syn::parse_derive_input(&s).unwrap();

    // Build the impl
    let gen = impl_hello_macro(&ast);

    // Return the generated impl
    gen.parse().unwrap()
}
```

<span class="caption">示例 D-3: 大多数过程式宏处理 Rust 代码的代码</span>

注意在 D-3 中分离函数的方式，这将和你几乎所见到或创建的每一个过程式宏都一样，因为这让编写一个过程式宏更加方便。在 `impl_hello_macro` 被调用的地方所选择做的什么依赖于该过程式宏的目的而有所不同。

现在，我们已经介绍了三个包：`proc_macro` 、 [`syn`] 和 [`quote`] 。Rust 自带 `proc_macro`  ，因此无需将其加到 *Cargo.toml* 文件的依赖中。`proc_macro` 可以将 Rust 代码转换为相应的字符串。`syn` 则将字符串中的 Rust 代码解析成为一个可以操作的数据结构。`quote` 则将 `syn` 解析的数据结构反过来传入到 Rust 代码中。这些包让解析我们所要处理的有序 Rust 代码变得更简单：为 Rust 编写整个的解析器并不是一件简单的工作。

[`syn`]: https://crates.io/crates/syn
[`quote`]: https://crates.io/crates/quote

当用户在一个类型上指定 `#[derive(HelloMacro)]` 时，`hello_macro_derive`  函数将会被调用。
原因在于我们已经使用 `proc_macro_derive` 及其指定名称对 `hello_macro_derive` 函数进行了注解：`HelloMacro` ，其匹配到 trait 名，这是大多数过程式宏的方便之处。

该函数首先将来自 `TokenStream` 的 `输入` 转换为一个名为 `to_string` 的 `String` 类型。该 `String` 代表 派生 `HelloMacro` Rust 代码的字符串。在示例 D-2 的例子中，`s` 是 `String` 类型的 `struct Pancakes;` 值，这是因为我们加上了 `#[derive(HelloMacro)]` 注解。

> 注意：编写本附录时，只可以将 `TokenStream` 转换为字符串，将来会提供更丰富的API。

现在需要将 `String` 类型的 Rust 代码 解析为一个数据结构中，随后便可以与之交互并操作该数据结构。这正是 `syn` 所做的。`syn` 中的 `parse_derive_input` 函数以一个 `String` 作为参数并返回一个 表示解析出 Rust 代码的 `DeriveInput` 结构体。 下面的代码 展示了从字符串 `struct Pancakes;` 中解析出来的 `DeriveInput` 结构体的相关部分。

```rust,ignore
DeriveInput {
    // --snip--

    ident: Ident(
        "Pancakes"
    ),
    body: Struct(
        Unit
    )
}
```

该结构体的字段展示了我们解析的 Rust 代码是一个元组结构体，其 `ident` （ identifier，表示名字）为 `Pancakes` 。该结构体里面有更多字段描述了所有有序 Rust 代码，查阅 [`syn`
documentation for `DeriveInput`][syn-docs] 以获取更多信息。

[syn-docs]: https://docs.rs/syn/0.11.11/syn/struct.DeriveInput.html

此时，尚未定义 `impl_hello_macro` 函数，其用于构建所要包含在内的 Rust 新代码。但在定义之前，要注意 `hello_macro_derive` 函数的最后一部分使用了 `quote` 包中的 `parse` 函数，该函数将 `impl_hello_macro` 的输出返回给 `TokenStream` 。所返回的 `TokenStream` 会被加到我们的包用户所写的代码中，因此，当用户编译他们的包时，他们会获取到我们所提供的额外功能。

你也注意到，当调用 `parse_derive_input` 或 `parse` 失败时，我们调用 `unwrap` 来抛出异常。在过程式宏中，有必要错误上抛异常，因为 `proc_macro_derive` 函数必须返回 `TokenStream` 而不是 `Result` ，以此来符合过程式宏的 API 。我们已经选择用 `unwrap` 来简化了这个例子；在生产中的代码里，你应该通过 `panic!` 或 `expect` 来提供关于发生何种错误的更加明确的错误信息。

现在我们有了将注解的 Rust 代码从 `TokenStream` 转换为 `String` 和 `DeriveInput` 实例的代码，让我们来创建在注解类型上实现 `HelloMacro` trait 的代码。

<span class="filename">文件名: hello_macro_derive/src/lib.rs</span>

```rust,ignore
fn impl_hello_macro(ast: &syn::DeriveInput) -> quote::Tokens {
    let name = &ast.ident;
    quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}", stringify!(#name));
            }
        }
    }
}
```

我们得到一个包含以 `ast.ident` 作为注解类型名字（标识符）的 `Ident` 结构体实例。示例 D-2 中的代码说明 `name` 会是 `Ident("Pancakes")` 。

`quote!` 宏让我们编写我们想要返回的代码，并可以将其传入进 `quote::Tokens` 。这个宏也提供了一些非常酷的模板机制；我们可以写 `#name` ，然后 `quote!` 会以 名为 `name` 的变量值来替换它。你甚至可以做些与这个正则宏任务类似的重复事情。查阅 [the `quote` crate’s
docs][quote-docs] 来获取详尽的介绍。

[quote-docs]: https://docs.rs/quote

我们期望我们的过程式宏能够为通过 `#name` 获取到的用户注解类型生成 `HelloMacro` trait 的实现。该 trait 的实现有一个函数 `hello_macro` ，其函数体包括了我们期望提供的功能：打印 `Hello, Macro! My name is` 和注解的类型名。

此处所使用的 `stringify!` 为 Rust 内置宏。其接收一个 Rust 表达式，如 `1 + 2` ， 然后在编译时将表达式转换为一个字符串常量，如 `"1 + 2"` 。这与 `format!` 或 `println!` 是不同的，它计算表达式并将结果转换为 `String` 。有一种可能的情况是，所输入的 `#name` 可能是一个需要打印的表达式，因此我们用 `stringify!` 。 `stringify!` 编译时也保留了一份将 `#name` 转换为字符串之后的内存分配。

此时，`cargo build` 应该都能成功编译 `hello_macro` 和 `hello_macro_derive` 。我们将这些 crate 连接到示例 D-2 的代码中来看看过程式宏的行为。在 *projects* 目录下用 `cargo new pancakes` 命令新建一个二进制项目。需要将 `hello_macro` 和 `hello_macro_derive` 作为依赖加到 `pancakes` 包的 *Cargo.toml*  文件中去。如果你正将 `hello_macro` 和 `hello_macro_derive` 的版本发布到 [*https://crates.io/*][crates.io] 上，其应为正规依赖；如果不是，则可以像下面这样将其指定为 `path` 依赖：

[crates.io]: https://crates.io/

```toml
[dependencies]
hello_macro = { path = "../hello_macro" }
hello_macro_derive = { path = "../hello_macro/hello_macro_derive" }
```

把示例 D-2 中的代码放在 *src/main.rs* ，然后执行 `cargo run` ： 其应该打印 `Hello, Macro! My name is Pancakes!` 。从过程式宏中实现的 `HelloMacro` trait 被包括在内，但并不包含 `pancakes` 的包，需要实现它。`#[derive(HelloMacro)]` 添加了该 trait 的实现。<!-- 中间句子翻译不是太好 -->

### 宏的前景

在将来，Rust 仍会扩展声明式宏和过程式宏。Rust会通过 `macro` 使用一个更好的声明式宏系统，以及为较之 `derive` 的更强大的任务增加更多的过程式宏类型。在本书出版时，这些系统仍然在开发中，请查阅 Rust 在线文档以获取最新信息。
