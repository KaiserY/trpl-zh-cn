## 定义模块来控制作用域与私有性

> [ch07-02-defining-modules-to-control-scope-and-privacy.md](https://github.com/rust-lang/book/blob/main/src/ch07-02-defining-modules-to-control-scope-and-privacy.md)
> <br>
> commit 310ea6cb0dd855eaf510c9ba05648bc5836ead0c

在本节，我们将讨论模块和其它一些关于模块系统的部分，如允许你命名项的 *路径*（*paths*）；用来将路径引入作用域的 `use` 关键字；以及使项变为公有的 `pub` 关键字。我们还将讨论 `as` 关键字、外部包和 glob 运算符。现在，让我们把注意力放在模块上！

首先，我们将从一系列的规则开始，在你未来组织代码的时候，这些规则可被用作简单的参考。接下来我们将会详细的解释每条规则。

## 模块小抄

这里我们提供一个简单的参考，用来解释模块、路径、`use`关键词和`pub`关键词如何在编译器中工作，以及大部分开发者如何组织他们的代码。我们将在本章节中举例说明每条规则，不过这是一个解释模块工作方式的良好参考。

- **从 crate 根节点开始**: 当编译一个 crate, 编译器首先在 crate 根文件（通常，对于一个库 crate 而言是*src/lib.rs*，对于一个二进制 crate 而言是*src/main.rs*）中寻找需要被编译的代码。
- **声明模块**: 在 crate 根文件中，你可以声明一个新模块；比如，你用`mod garden;`声明了一个叫做`garden`的模块。编译器会在下列路径中寻找模块代码：
  - 内联，在大括号中，当`mod garden`后方不是一个分号而是一个大括号
  - 在文件 *src/garden.rs*
  - 在文件 *src/garden/mod.rs*
- **声明子模块**: 在除了 crate 根节点以外的其他文件中，你可以定义子模块。比如，你可能在*src/garden.rs*中定义了`mod vegetables;`。编译器会在以父模块命名的目录中寻找子模块代码：
  - 内联，在大括号中，当`mod vegetables`后方不是一个分号而是一个大括号
  - 在文件 *src/garden/vegetables.rs*
  - 在文件 *src/garden/vegetables/mod.rs*
- **模块中的代码路径**: 一旦一个模块是你 crate 的一部分，你可以在隐私规则允许的前提下，从同一个 crate 内的任意地方，通过代码路径引用该模块的代码。举例而言，一个 garden vegetables 模块下的`Asparagus`类型可以在`crate::garden::vegetables::Asparagus`被找到。
- **私有 vs 公用**: 一个模块里的代码默认对其父模块私有。为了使一个模块公用，应当在声明时使用`pub mod`替代`mod`。为了使一个公用模块内部的成员公用，应当在声明前使用`pub`。
- **`use` 关键字**: 在一个作用域内，`use`关键字创建了一个成员的快捷方式，用来减少长路径的重复。在任何可以引用`crate::garden::vegetables::Asparagus`的作用域，你可以通过 `use crate::garden::vegetables::Asparagus;`创建一个快捷方式，然后你就可以在作用域中只写`Asparagus`来使用该类型。

这里我们创建一个名为`backyard`的二进制 crate 来说明这些规则。该 crate 的路径同样命名为`backyard`，该路径包含了这些文件和目录：

```text
backyard
├── Cargo.lock
├── Cargo.toml
└── src
    ├── garden
    │   └── vegetables.rs
    ├── garden.rs
    └── main.rs
```

这个例子中的 crate 根文件是*src/main.rs*，该文件包括了：

<span class="filename">文件名：src/main.rs</span>

```rust,noplayground,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/quick-reference-example/src/main.rs}}
```

`pub mod garden;`行告诉编译器应该包含在*src/garden.rs*文件中发现的代码：

<span class="filename">文件名：src/garden.rs</span>

```rust,noplayground,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/quick-reference-example/src/garden.rs}}
```

在此处， `pub mod vegetables;`意味着在*src/garden/vegetables.rs*中的代码也应该被包括。这些代码是：

```rust,noplayground,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/quick-reference-example/src/garden/vegetables.rs}}
```

现在让我们深入了解这些规则的细节并在实际中演示它们！

### 在模块中对相关代码进行分组

*模块* 让我们可以将一个 crate 中的代码进行分组，以提高可读性与重用性。因为一个模块中的代码默认是私有的，所以还可以利用模块控制项的 *私有性*。私有项是不可为外部使用的内在详细实现。我们也可以将模块和它其中的项标记为公开的，这样，外部代码就可以使用并依赖于它们。

在餐饮业，餐馆中会有一些地方被称之为 *前台*（*front of house*），还有另外一些地方被称之为 *后台*（*back of house*）。前台是招待顾客的地方，在这里，店主可以为顾客安排座位，服务员接受顾客下单和付款，调酒师会制作饮品。后台则是由厨师工作的厨房，洗碗工的工作地点，以及经理做行政工作的地方组成。

我们可以将函数放置到嵌套的模块中，来使我们的 crate 结构与实际的餐厅结构相同。通过执行 `cargo new --lib restaurant`，来创建一个新的名为 `restaurant` 的库。然后将示例 7-1 中所罗列出来的代码放入 *src/lib.rs* 中，来定义一些模块和函数。

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-01/src/lib.rs}}
```

<span class="caption">示例 7-1：一个包含了其他内置了函数的模块的 `front_of_house` 模块</span>

我们定义一个模块，是以 `mod` 关键字为起始，然后指定模块的名字（本例中叫做 `front_of_house`），并且用花括号包围模块的主体。在模块内，我们还可以定义其他的模块，就像本例中的 `hosting` 和 `serving` 模块。模块还可以保存一些定义的其他项，比如结构体、枚举、常量、特性、或者函数。

通过使用模块，我们可以将相关的定义分组到一起，并指出它们为什么相关。程序员可以通过使用这段代码，更加容易地找到他们想要的定义，因为他们可以基于分组来对代码进行导航，而不需要阅读所有的定义。程序员向这段代码中添加一个新的功能时，他们也会知道代码应该放置在何处，可以保持程序的组织性。

在前面我们提到了，`src/main.rs` 和 `src/lib.rs` 叫做 crate 根。之所以这样叫它们是因为这两个文件的内容都分别在 crate 模块结构的根组成了一个名为 `crate` 的模块，该结构被称为 *模块树*（*module tree*）。

示例 7-2 展示了示例 7-1 中的模块树的结构。

```text
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

<span class="caption">示例 7-2: 示例 7-1 中代码的模块树</span>

这个树展示了一些模块是如何被嵌入到另一个模块的（例如，`hosting` 嵌套在 `front_of_house` 中）。这个树还展示了一些模块是互为 *兄弟*（*siblings*）的，这意味着它们定义在同一模块中（`hosting` 和 `serving` 被一起定义在 `front_of_house` 中）。继续沿用家庭关系的比喻，如果一个模块 A 被包含在模块 B 中，我们将模块 A 称为模块 B 的 *子*（*child*），模块 B 则是模块 A 的 *父*（*parent*）。注意，整个模块树都植根于名为 `crate` 的隐式模块下。

这个模块树可能会令你想起电脑上文件系统的目录树；这是一个非常恰当的类比！就像文件系统的目录，你可以使用模块来组织你的代码。并且，就像目录中的文件，我们需要一种方法来找到模块。
