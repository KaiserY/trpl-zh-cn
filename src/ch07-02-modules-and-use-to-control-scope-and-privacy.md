## 模块系统用来控制作用域和私有性

> [ch07-01-mod-and-the-filesystem.md](https://github.com/rust-lang/book/blob/master/src/ch07-02-modules-and-use-to-control-scope-and-privacy.md)
> <br>
> commit 9d431b25ca6c7200eafe4107eb0765c088923027

Rust 的此部分功能通常被引用为 “模块系统”（“the module system”），不过其包括了一些除模块之外的功能。在本部分我们会讨论：

* 模块，一个组织代码和控制路径私有性的方式
* 路径，一个命名项（item）的方式
* `use` 关键字用来将路径引入作用域
* `pub` 关键字使项变为公有
* `as` 关键字用于将项引入作用域时进行重命名
* 使用外部包
* 嵌套路径用来消除大量的 `use` 语句
* 使用 glob 运算符将模块的所有内容引入作用域
* 如何将不同模块分割到单独的文件中

首先讲讲模块。模块允许我们将代码组织起来。示例 7-1 是一个例子，这些代码定义了名为 `sound` 的模块，其包含名为 `guitar` 的函数。

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    fn guitar() {
        // 函数体
    }
}

fn main() {

}
```

<span class="caption">示例 7-1: 包含 `guitar` 函数和 `main` 函数的 `sound` 模块</span>

这里定义了两个函数，`guitar` 和 `main`。`guitar` 函数定义于 `mod` 块中。这个块定义了 `sound` 模块。

为了将代码组织到模块层次体系中，可以将模块嵌套进其他模块，如示例 7-2 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    mod instrument {
        mod woodwind {
            fn clarinet() {
                // 函数体
            }
        }
    }

    mod voice {

    }
}

fn main() {

}
```

<span class="caption">示例 7-2: 模块中的模块</span>

在这个例子中，我们像示例 7-1 一样定义了 `sound` 模块。接着在 `sound` 模块中定义了 `instrument` 和 `voice` 模块。`instrument` 模块中定义了另一个模块 `woodwind`，这个模块包含一个函数 `clarinet`。

在 “包和 crate 用来创建库和二进制项目” 部分提到 *src/main.rs* 和 *src/lib.rs* 被称为 **crate 根**。他们被称为 crate 根是因为这两个文件在 crate 模块树的根组成了名为 `crate` 模块。所以示例 7-2 中，有如示例 7-3 所示的模块树：

```text
crate
└── sound
    ├── instrument
    │   └── woodwind
    └── voice
```

<span class="caption">示例 7-3: 示例 7-2 中代码的模块树</span>

这个树展示了模块如何嵌套在其他模块中（比如 `woodwind` 嵌套在 `instrument` 中）以及模块如何作为其他模块的子模块的（`instrument` 和 `voice` 都定义在 `sound` 中）。整个模块树都位于名为 `crate` 这个隐式模块的根下。

这个树可能会令你想起电脑上文件系统的目录树；这是一个非常恰当的比喻！就像文件系统的目录，将代码放入任意模块也将创建对应的组织结构体。另一个相似点是为了引用文件系统或模块树中的项，需要使用 **路径**（*path*）。

### 路径用来引用模块树中的项

如果想要调用函数，需要知道其 **路径**。“路径” 是 “名称”（“name”） 的同义词，不过它用于文件系统语境。另外，函数、结构体和其他项可能会有多个指向相同项的路径，所以 “名称” 这个概念不太准确。

**路径** 可以有两种形式：

* **绝对路径**（*absolute path*）从 crate 根开始，以 crate 名或者字面值 `crate` 开头。
* **相对路径**（*relative path*）从当前模块开始，以 `self`、`super` 或当前模块的标识符开头。

绝对路径和相对路径都后跟一个或多个由双冒号（`::`）分割的标识符。

如何在示例 7-2 的 `main` 函数中调用 `clarinet` 函数呢？也就是说，`clarinet` 函数的路径是什么呢？在示例 7-4 中稍微简化了代码，移除了一些模块，并展示了两种在 `main` 中调用 `clarinet` 函数的方式。这个例子还不能编译，我们会解释为什么。

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
mod sound {
    mod instrument {
        fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // Relative path
    sound::instrument::clarinet();
}
```

<span class="caption">示例 7-4: 在简化的模块树中，分别使用绝对路径和相对路径在 `main` 中调用 `clarinet` 函数</span>

第一种从 `main` 函数中调用 `clarinet` 函数的方式使用绝对路径。因为 `clarinet` 与 `main` 定义于同一 crate 中，我们使用 `crate` 关键字来开始绝对路径。接着包含每一个模块直到 `clarinet`。这类似于指定 `/sound/instrument/clarinet` 来运行电脑上这个位置的程序；使用 `crate` 从 crate 根开始就类似于在 shell 中使用 `/` 从文件系统根开始。

第二种从 `main` 函数中调用 `clarinet` 函数的方式使用相对路径。该路径以 `sound` 开始，它是定义于与 `main` 函数相同模块树级别的模块。这类似于指定 `sound/instrument/clarinet` 来运行电脑上这个位置的程序；以名称开头意味着路径是相对的。

示例 7-4 提到了它并不能编译，让我们尝试编译并看看为什么不行！示例 7-5 展示了错误。

```text
$ cargo build
   Compiling sampleproject v0.1.0 (file:///projects/sampleproject)
error[E0603]: module `instrument` is private
  --> src/main.rs:11:19
   |
11 |     crate::sound::instrument::clarinet();
   |                   ^^^^^^^^^^

error[E0603]: module `instrument` is private
  --> src/main.rs:14:12
   |
14 |     sound::instrument::clarinet();
   |            ^^^^^^^^^^
```

<span class="caption">示例 7-5: 构建示例 7-4 出现的编译器错误</span>

错误信息说 `instrument` 模块是私有的。可以看到 `instrument` 模块和 `clarinet` 函数的路径是正确的，不过 Rust 不让我们使用，因为他们是私有的。现在是学习 `pub` 关键字的时候了！

### 模块作为私有性的边界

之前我们讨论到模块的语法和组织代码的用途。Rust 采用模块还有另一个原因：模块是 Rust 中的 **私有性边界**（*privacy boundary*）。如果你希望函数或结构体是私有的，将其放入模块。私有性规则有如下：

* 所有项（函数、方法、结构体、枚举、模块和常量）默认是私有的。
* 可以使用 `pub` 关键字使项变为公有。
* 不允许使用定义于当前模块的子模块中的私有代码。
* 允许使用任何定义于父模块或当前模块中的代码。

换句话说，对于没有 `pub` 关键字的项，当你从当前模块向 “下” 看时是私有的，不过当你向 “上” 看时是公有的。再一次想象一下文件系统：如果你没有某个目录的权限，则无法从父目录中查看其内容。如果有该目录的权限，则可以查看其中的目录和任何父目录。

### 使用 `pub` 关键字使项变为公有

示例 7-5 中的错误说 `instrument` 模块是私有的。让我们使用 `pub` 关键字标记 `instrument` 模块使其可以在 `main` 函数中使用。这些改变如示例 7-6 所示，它仍然不能编译，不过会产生一个不同的错误：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
mod sound {
    pub mod instrument {
        fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // Absolute path
    crate::sound::instrument::clarinet();

    // Relative path
    sound::instrument::clarinet();
}
```

<span class="caption">示例 7-6: 将 `instrument` 模块声明为 `pub` 以便可以在 `main` 中使用</span>

在 `mod instrument` 之前增加 `pub` 关键字使得模块变为公有。通过这个改变如果允许访问 `sound` 的话，我们就可以访问 `instrument`。`instrument` 的内容仍然是私有的；使得模块公有并不使其内容也是公有的。模块上的 `pub` 关键字允许其父模块引用它。

不过示例 7-6 中的代码仍然产生错误，如示例 7-7 所示：

```text
$ cargo build
   Compiling sampleproject v0.1.0 (file:///projects/sampleproject)
error[E0603]: function `clarinet` is private
  --> src/main.rs:11:31
   |
11 |     crate::sound::instrument::clarinet();
   |                               ^^^^^^^^

error[E0603]: function `clarinet` is private
  --> src/main.rs:14:24
   |
14 |     sound::instrument::clarinet();
   |                        ^^^^^^^^
```

<span class="caption">示例 7-7: 构建示例 7-6 时产生的编译器错误</span>

现在的错误表明 `clarinet` 函数是私有的。私有性规则适用于结构体、枚举、函数和方法以及模块。

在 `clarinet` 函数前增加 `pub` 关键字使其变为公有，如示例 7-8 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

<span class="caption">示例 7-8: 在 `mod
instrument` 和 `fn clarinet` 之前都增加 `pub` 关键字使我们可以在 `main` 中调用此函数</span>

现在可以编译了！让我们看看绝对路径和相对路径再次检查为什么增加 `pub` 关键字使得我们可以在 `main` 中调用这些路径。

在绝对路径的情况下，我们从 `crate`，也就是 crate 根开始。从这开始有 `sound`，这是一个定义于 crate 根中的模块。`sound` 模块不是公有的，不过因为 `main` 函数与 `sound` 定义于同一模块中，可以从 `main` 中引用 `sound`。接下来是 `instrument`，这个模块标记为 `pub`。我们可以访问 `instrument` 的父模块，所以可以访问 `instrument`。最后，`clarinet` 函数被标记为 `pub` 所以可以访问其父模块，所以这个函数调用是有效的！

在相对路径的情况下，其逻辑与绝对路径相同，除了第一步。不同于从 crate 根开始，路径从 `sound` 开始。`sound` 模块与 `main` 定义于同一模块，所以从 `main` 所在模块开始定义的路径是有效的。接下来因为 `instrument` 和 `clarinet` 被标记为 `pub`，路径其余的部分也是有效的，因此函数调用也是有效的！

### 使用 `super` 开始相对路径

也可以使用 `super` 开头来构建相对路径。这么做类似于文件系统中以 `..` 开头：该路径从 **父** 模块开始而不是当前模块。这在例如示例 7-9 这样的情况下有用处，在这里 `clarinet` 函数通过指定以 `super` 开头的路径调用 `breathe_in` 函数：

<span class="filename">文件名: src/lib.rs</span>

```rust
# fn main() {}
#
mod instrument {
    fn clarinet() {
        super::breathe_in();
    }
}

fn breathe_in() {
    // 函数体
}
```

<span class="caption">示例 7-9: 使用以 `super` 开头的路径从父目录开始调用函数</span>

`clarinet` 函数位于 `instrument` 模块中，所以可以使用 `super` 进入 `instrument` 的父模块，也就是根 `crate`。从这里可以找到 `breathe_in`。成功！

你可能想要使用 `super` 开头的相对路而不是以 `crate` 开头的绝对路径的原因是  `super` 可能会使修改有着不同模块层级结构的代码变得更容易，如果定义项和调用项的代码被一同移动的话。例如，如果我们决定将 `instrument` 模块和 `breathe_in` 函数放入 `sound` 模块中，这时我们只需增加 `sound` 模块即可，如示例 7-10 所示。

<span class="filename">文件名: src/lib.rs</span>

```rust
mod sound {
    mod instrument {
        fn clarinet() {
            super::breathe_in();
        }
    }

    fn breathe_in() {
        // 函数体
    }
}
```

<span class="caption">示例 7-10: 增加一个名为 `sound` 的父模块并不影响相对路径 `super::breathe_in`</span>

示例 7-10 在 `clarinet` 函数中调用 `super::breathe_in` 将如示例 7-9 一样继续有效，无需更新路径。如果在 `clarinet` 函数不使用 `super::breathe_in` 而是使用 `crate::breathe_in` 的话，当增加父模块 `sound` 后，则需要更新 `clarinet` 函数使用 `crate::sound::breathe_in` 路径。使用相对路径可能意味着重新布局模块时需要更少的必要修改。

### 对结构体和枚举使用 `pub`

可以以模块与函数相同的方式来设计公有的结构体和枚举，不过有一些额外的细节。

如果在结构体定义中使用 `pub`，可以使结构体公有。然而结构体的字段仍是私有的。可以在每一个字段的基准上选择其是否公有。在示例 7-11 中定义了一个公有结构体 `plant::Vegetable`，其包含公有的 `name` 字段和私有的 `id` 字段。

<span class="filename">文件名: src/main.rs</span>

```rust
mod plant {
    pub struct Vegetable {
        pub name: String,
        id: i32,
    }

    impl Vegetable {
        pub fn new(name: &str) -> Vegetable {
            Vegetable {
                name: String::from(name),
                id: 1,
            }
        }
    }
}

fn main() {
    let mut v = plant::Vegetable::new("squash");

    v.name = String::from("butternut squash");
    println!("{} are delicious", v.name);

    // 如果将如下行取消注释代码将无法编译:
    // println!("The ID is {}", v.id);
}
```

<span class="caption">示例 7-11: 结构体带有公有和私有的字段</span>

因为 `plant::Vegetable` 结构体的 `name` 字段使公有的，在 `main` 中可以使用点号读写 `name` 字段。不允许在 `main` 中使用 `id` 字段因为其使私有的。尝试取消注释的行来打印 `id` 字段的值来看看会出现什么错误！另外注意因为 `plant::Vegetable` 有私有字段，需要提供一个公有的关联函数来构建 `Vegetable` 的实例（这里使用了传统的名称 `new`）。如果 `Vegetable` 没有提供这么一个函数，我们就不能在 `main` 中创建 `Vegetable` 的实例，因为在 `main` 中不允许设置私有字段 `id` 的值。

相反，如果有一个公有枚举，其所有成员都是公有。只需在 `enum` 关键词前加上 `pub`，如示例 7-12 所示。

<span class="filename">文件名: src/main.rs</span>

```rust
mod menu {
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

fn main() {
    let order1 = menu::Appetizer::Soup;
    let order2 = menu::Appetizer::Salad;
}
```

<span class="caption">示例 7-12: 将枚举设计为公有会使其所有成员公有</span>

因为 `Appetizer` 枚举是公有的，可以在 `main` 中使用 `Soup` and `Salad` 成员。

还有一种使用 `pub` 的场景我们还没有涉及到，而这是我们最后要讲的模块功能：`use` 关键字。我们先单独介绍 `use`，然后展示如何结合使用 `pub` 和 `use`。

### 使用 `use` 关键字将名称引入作用域

你可能考虑过本章很多的函数调用的路径是冗长和重复的。例如示例 7-8 中，当我们选择 `clarinet` 函数的绝对或相对路径时，每次想要调用 `clarinet` 时都不得不也指定 `sound` 和 `instrument`。幸运的是，有一次性将路径引入作用域然后就像调用本地项那样的方法：使用 `use` 关键字。在示例 7-13 中将 `crate::sound::instrument` 模块引入了 `main` 函数的作用域，以便只需指定 `instrument::clarinet` 来调用 `clarinet` 函数。

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use crate::sound::instrument;

fn main() {
    instrument::clarinet();
    instrument::clarinet();
    instrument::clarinet();
}
```

<span class="caption">示例 7-13: 使用 `use` 将模块引入作用域并使用绝对路径来缩短在模块中调用项所必须的路径</span>

在作用域中增加 `use` 和路径类似于在文件系统中创建软连接（符号连接，symbolic link）。通过在 crate 根增加 `use crate::sound::instrument`，现在 `instrument` 在作用域中就是有效的名称了，如同它被定义于 crate 根一样。现在，既可以使用老的全路径方式取得 `instrument` 模块的项，也可以使用新的通过 `use` 创建的更短的路径。通过 `use` 引入作用域的路径也会检查私有性，同其它路径一样。

如果希望通过 `use` 和相对路径来将项引入作用域，则与直接通过相对路径调用项有些小的区别：不同于从当前作用域的名称开始，`use` 中的路径必须以 `self` 示例 7-14 展示了如何指定相对路径来取得与示例 7-13 中使用绝对路径一样的行为。

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use self::sound::instrument;

fn main() {
    instrument::clarinet();
    instrument::clarinet();
    instrument::clarinet();
}
```

<span class="caption">示例 7-14: 通过 `use` 和相对路径将模块引入作用域</span>

当指定 `use` 后以 `self` 开头的相对路径在未来可能不是必须的；这是一个开发者正在尽力消除的语言中的不一致。

如果调用项目的代码移动到模块树的不同位置但是定义项目的代码却没有，那么选择使用 `use` 指定绝对路径可以使更新更轻松，这与示例 7-10 中同时移动的情况相对。例如，如果我们决定采用示例 7-13 的代码，将 `main` 函数的行为提取到函数 `clarinet_trio` 中，并将该函数移动到模块 `performance_group` 中，这时 `use` 所指定的路径无需变化，如示例 7-15 所示。

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

mod performance_group {
    use crate::sound::instrument;

    pub fn clarinet_trio() {
        instrument::clarinet();
        instrument::clarinet();
        instrument::clarinet();
    }
}

fn main() {
    performance_group::clarinet_trio();
}
```

<span class="caption">示例 7-15: 移动调用项的代码时绝对路径无需移动</span>

相反，如果对示例 7-14 中指定了相对路径的代码做同样的修改，则需要将 `use
self::sound::instrument` 变为 `use super::sound::instrument`。如果你不确定将来模块树会如何变化，那么选择采用相对或绝对路径是否会减少修改可能全靠猜测，不过本书的作者倾向于通过 `crate` 指定绝对路径，因为定义和调用项的代码更有可能相互独立的在模块树中移动，而不是像示例 7-10 那样一同移动。

### `use` 函数路径使用习惯 VS 其他项

示例 7-13 中，你可能会好奇为什么指定 `use crate::sound::instrument` 接着在 `main` 中调用 `instrument::clarinet`，而不是如示例 7-16 所示的有相同行为的代码：

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use crate::sound::instrument::clarinet;

fn main() {
    clarinet();
    clarinet();
    clarinet();
}
```

<span class="caption">示例 7-16: 通过 `use` 将 `clarinet` 函数引入作用域，这是不推荐的</span>

对于函数来说，通过 `use` 指定函数的父模块接着指定父模块来调用方法被认为是习惯用法。这么做而不是像示例 7-16 那样通过 `use` 指定函数的路径，清楚的表明了函数不是本地定义的，同时仍最小化了指定全路径时的重复。

对于结构体、枚举和其它项，通过 `use` 指定项的全路径是习惯用法。例如，示例 7-17 展示了将标准库中 `HashMap` 结构体引入作用域的习惯用法。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

<span class="caption">示例 7-17: 将 `HashMap` 引入作用域的习惯用法</span>

相反，示例 7-18 中的代码将 `HashMap` 的父模块引入作用域不被认为是习惯用法。这个习惯并没有很强制的理由；这是慢慢形成的习惯同时人们习惯于这么读写。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::collections;

fn main() {
    let mut map = collections::HashMap::new();
    map.insert(1, 2);
}
```

<span class="caption">示例 7-18: 将 `HashMap` 引入作用域的非习惯方法</span>

这个习惯的一个例外是如果 `use` 语句会将两个同名的项引入作用域时，这是不允许的。示例 7-19 展示了如何将两个不同父模块的 `Result` 类型引入作用域并引用它们。

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::fmt;
use std::io;

fn function1() -> fmt::Result {
#     Ok(())
}
fn function2() -> io::Result<()> {
#     Ok(())
}
```

<span class="caption">示例 7-19: 将两个同名类型引入作用域必须使用父模块</span>

因为如果我们指定 `use std::fmt::Result` 和 `use std::io::Result`，则作用域中会有两个 `Result` 类型，Rust 无法知道我们想用哪个 `Result`。尝试这么做并看看编译器错误！

### 通过 `as` 关键字重命名引入作用域的类型

将两个同名类型引入同一作用域这个问题还有另一个解决办法：可以通过在 `use` 后加上 `as` 和一个新名称来为此类型指定一个新的本地名称。示例 7-20 展示了另一个编写示例 7-19 中代码的方法，通过 `as` 重命名了其中一个 `Result` 类型。

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
#     Ok(())
}
fn function2() -> IoResult<()> {
#     Ok(())
}
```

<span class="caption">示例 7-20: 通过 `as` 关键字重命名引入作用域的类型</span>

在第二个 `use` 语句中，我们选择 `IoResult` 作为 `std::io::Result` 的新名称，它与从 `std::fmt` 引入作用域的 `Result` 并不冲突。这样做也被认为是惯用的；示例 7-19 还是示例 7-20 全看你的选择。

### 通过 `pub use` 重导出名称

当使用 `use` 关键字将名称导入作用域时，在新作用域中可用的名称是私有的。如果希望调用你编写的代码的代码能够像你一样在其自己的作用域内引用这些类型，可以结合 `pub` 和 `use`。这个技术被称为 “重导出”（*re-exporting*），因为这样做将项引入作用域并同时使其可供其他代码引入自己的作用域。

例如，示例 7-21 展示了示例 7-15 中的代码将 `performance_group` 的 `use` 变为 `pub use` 的版本。

<span class="filename">文件名: src/main.rs</span>

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

mod performance_group {
    pub use crate::sound::instrument;

    pub fn clarinet_trio() {
        instrument::clarinet();
        instrument::clarinet();
        instrument::clarinet();
    }
}

fn main() {
    performance_group::clarinet_trio();
    performance_group::instrument::clarinet();
}
```

<span class="caption">示例 7-21: 通过 `pub use` 使名称可引入任何代码的作用域中</span>

通过 `pub use`，现在 `main` 函数可以通过新路径 `performance_group::instrument::clarinet` 来调用 `clarinet` 函数。如果没有指定 `pub use`，`clarinet_trio` 函数可以在其作用域中调用 `instrument::clarinet` 但 `main` 则不允许使用这个新路径。

### 使用外部包

在第二章中我们编写了一个猜猜看游戏。那个项目使用了一个外部包，`rand`，来生成随机数。为了在项目中使用 `rand`，在 *Cargo.toml* 中加入了如下行：

<span class="filename">文件名: Cargo.toml</span>

```toml
[dependencies]
rand = "0.5.5"
```

在 *Cargo.toml* 中加入 `rand` 依赖告诉了 Cargo 要从 *https://crates.io* 下载 `rand` 和其依赖，并使其可在项目代码中使用。

接着，为了将 `rand` 定义引入项目包的作用域，加入一行 `use`，它以 `rand` 包名开头并列出了需要引入作用域的项。回忆一下第二章的 “生成一个随机数” 部分，我们曾将 `Rng` trait 引入作用域并调用了 `rand::thread_rng` 函数：

```rust,ignore
use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1, 101);
}
```

*https://crates.io* 上有很多社区成员发布的包，将其引入你自己的项目涉及到相同的步骤：在 *Cargo.toml* 列出它们并通过 `use` 将其中定义的项引入项目包的作用域中。

注意标准库（`std`）对于你的包来说也是外部 crate。因为标准库随 Rust 语言一同分发，无需修改 *Cargo.toml* 来引入 `std`，不过需要通过 `use` 将标准库中定义的项引入项目包的作用域中来引用它们，比如 `HashMap`：

```rust
use std::collections::HashMap;
```

这是一个以标注库 crate 名 `std` 开头的绝对路径。

### 嵌套路径来消除大量的 `use` 行

当需要引入很多定义于相同包或相同模块的项时，为每一项单独列出一行会占用源码很大的空间。例如猜猜看章节示例 2-4 中有两行 `use` 语句都从 `std` 引入项到作用域：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::cmp::Ordering;
use std::io;
// ---snip---
```

可以使用嵌套的路径将同样的项在一行中引入而不是两行，这么做需要指定路径的相同部分，接着是两个冒号，接着是大括号中的各自不同的路径部分，如示例 7-22 所示。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::{cmp::Ordering, io};
// ---snip---
```

<span class="caption">示例 7-22: 指定嵌套的路径在一行中将多个带有相同前缀的项引入作用域</span>

在从相同包或模块中引入很多项的程序中，使用嵌套路径显著减少所需的单独 `use` 语句！

也可以剔除掉完全包含在另一个路径中的路径。例如，示例 7-23 中展示了两个 `use` 语句：一个将 `std::io` 引入作用域，另一个将 `std::io::Write` 引入作用域：

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::io;
use std::io::Write;
```

<span class="caption">示例 7-23: 通过两行 `use` 语句引入两个路径，其中一个是另一个的子路径</span>

两个路径的相同部分是 `std::io`，这正是第一个路径。为了在一行 `use` 语句中引入这两个路径，可以在嵌套路径中使用 `self`，如示例 7-24 所示。

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::io::{self, Write};
```

<span class="caption">示例 7-24: 将示例 7-23 中部分重复的路径合并为一个 `use` 语句</span>

这将 `std::io` 和 `std::io::Write` 同时引入作用域。

### 通过 glob 运算符将所有的公有定义引入作用域

如果希望将一个路径下 **所有** 公有项引入作用域，可以指定路径后跟 `*`，glob 运算符：

```rust
use std::collections::*;
```

这个 `use` 语句将 `std::collections` 中定义的所有公有项引入当前作用域。

使用 glob 运算符时请多加小心！如此难以推导作用域中有什么名称和它们是在何处定义的。

glob 运算符经常用于测试模块 `tests` 中，这时会将所有内容引入作用域；我们将在第十一章 “如何编写测试” 部分讲解。glob 运算符有时也用于 prelude 模式；查看 [标准库中的文档](https://doc.rust-lang.org/std/prelude/index.html#other-preludes) 了解这个模式的更多细节。

### 将模块分割进不同文件

目前本章所有的例子都在一个文件中定义多个模块。当模块变得更大时，你可能想要将它们的定义移动到一个单独的文件中使代码更容易阅读。

例如从示例 7-8 的代码开始，我们可以通过修改 crate 根文件（这里是 *src/main.rs*）将 `sound` 模块移动到其自己的文件 *src/sound.rs* 中，如示例 7-25 所示。

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
mod sound;

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

<span class="caption">示例 7-25: 声明 `sound` 模块，其内容位于 *src/sound.rs* 文件</span>

而 *src/sound.rs* 中会包含 `sound` 模块的内容，如示例 7-26 所示。

<span class="filename">文件名: src/sound.rs</span>

```rust
pub mod instrument {
    pub fn clarinet() {
        // 函数体
    }
}
```

<span class="caption">示例 7-26: `sound` 模块中的定义位于 *src/sound.rs* 中</span>

在 `mod sound` 后使用分号而不是代码块告诉 Rust 在另一个与模块同名的文件中加载模块的内容。

继续重构我们例子，将 `instrument` 模块也提取到其自己的文件中，修改 *src/sound.rs* 只包含 `instrument` 模块的声明：

<span class="filename">文件名: src/sound.rs</span>

```rust
pub mod instrument;
```

接着创建 *src/sound* 目录和 *src/sound/instrument.rs* 文件来包含 `instrument` 模块的定义：

<span class="filename">文件名: src/sound/instrument.rs</span>

```rust
pub fn clarinet() {
    // 函数体
}
```

模块树依然保持相同，`main` 中的函数调用也无需修改继续保持有效，即使其定义存在于不同的文件中。这样随着代码增长可以将模块移动到新文件中。

## 总结

Rust 提供了将包组织进 crate、将 crate 组织进模块和通过指定绝对或相对路径从一个模块引用另一个模块中定义的项的方式。可以通过 `use` 语句将路径引入作用域，这样在多次使用时可以使用更短的路径。模块定义的代码默认是私有的，不过可以选择增加 `pub` 关键字使其定义变为公有。

接下来，让我们看看一些标准库提供的集合数据类型，你可以利用它们编写出漂亮整洁的代码。
