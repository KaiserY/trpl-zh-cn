## 将模块拆分成多个文件

> [ch07-05-separating-modules-into-different-files.md](https://github.com/rust-lang/book/blob/main/src/ch07-05-separating-modules-into-different-files.md)
> <br>
> commit 2b4565662d1a7973d870744a923f58f8f7dcce91

到目前为止，本章所有的例子都在一个文件中定义多个模块。当模块变得更大时，你可能想要将它们的定义移动到单独的文件中，从而使代码更容易阅读。

例如，我们从示例 7-17 中包含多个餐厅模块的代码开始。我们会将模块提取到各自的文件中，而不是将所有模块都定义到 crate 根文件中。在这里，crate 根文件是 *src/lib.rs*，不过这个过程也适用于 crate 根文件是 *src/main.rs* 的二进制 crate。

首先将 `front_of_house` 模块提取到其自己的文件中。删除 `front_of_house` 模块的大括号中的代码，只留下 `mod front_of_house;` 声明，这样 *src/lib.rs* 会包含如示例 7-21 所示的代码。注意直到创建示例 7-22 中的 *src/front_of_house.rs* 文件之前代码都不能编译。

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-21-and-22/src/lib.rs}}
```

<span class="caption">示例 7-21: 声明 `front_of_house` 模块，其内容将位于 *src/front_of_house.rs*</span>

接下来将之前大括号内的代码放入一个名叫 *src/front_of_house.rs* 的新文件中，如示例 7-22 所示。因为编译器找到了 crate 根中名叫 `front_of_house` 的模块声明，它就知道去搜寻这个文件。

<span class="filename">文件名：src/front_of_house.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-21-and-22/src/front_of_house.rs}}
```

<span class="caption">示例 7-22: 在 *src/front_of_house.rs* 中定义 `front_of_house`
模块</span>

注意你只需在模块树中的某处使用一次 `mod` 声明就可以加载这个文件。一旦编译器知道了这个文件是项目的一部分（并且通过 `mod` 语句的位置知道了代码在模块树中的位置），项目中的其他文件应该使用其所声明的位置的路径来引用那个文件的代码，这在[“引用模块项目的路径”][paths]部分有讲到。换句话说，`mod` **不是** 你可能会在其他编程语言中看到的 "include" 操作。

接下来我们同样将 `hosting` 模块提取到自己的文件中。这个过程会有所不同，因为 `hosting` 是 `front_of_house` 的子模块而不是根模块。我们将 `hosting` 的文件放在与模块树中它的父级模块同名的目录中，在这里是 *src/front_of_house/*。

为了移动 `hosting`，修改 *src/front_of_house.rs* 使之仅包含 `hosting` 模块的声明。

<span class="filename">文件名：src/front_of_house.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/no-listing-02-extracting-hosting/src/front_of_house.rs}}
```

接着我们创建一个 *src/front_of_house* 目录和一个包含 `hosting` 模块定义的 *hosting.rs* 文件：

<span class="filename">文件名：src/front_of_house/hosting.rs</span>

```rust
{{#rustdoc_include ../listings/ch07-managing-growing-projects/no-listing-02-extracting-hosting/src/front_of_house/hosting.rs}}
```

如果将 *hosting.rs* 放在 *src* 目录，编译器会认为 `hosting` 模块中的 *hosting.rs* 的代码声明于 crate 根，而不是声明为 `front_of_house` 的子模块。编译器所遵循的哪些文件对应哪些模块的代码的规则，意味着目录和文件更接近于模块树。

> ### 另一种文件路径
>
> 目前为止我们介绍了 Rust 编译器所最常用的文件路径；不过一种更老的文件路径也仍然是支持的。
>
> 对于声明于 crate 根的 `front_of_house` 模块，编译器会在如下位置查找模块代码：
>
> * *src/front_of_house.rs*（我们所介绍的）
> * *src/front_of_house/mod.rs*（老风格，不过仍然支持）
>
> 对于 `front_of_house` 的子模块 `hosting`，编译器会在如下位置查找模块代码：
>
> * *src/front_of_house/hosting.rs*（我们所介绍的）
> * *src/front_of_house/hosting/mod.rs*（老风格，不过仍然支持）
>
> 如果你对同一模块同时使用这两种路径风格，会得到一个编译错误。在同一项目中的不同模块混用不同的路径风格是允许的，不过这会使他人感到疑惑。
>
> 使用 *mod.rs* 这一文件名的风格的主要缺点是会导致项目中出现很多 *mod.rs* 文件，当你在编辑器中同时打开它们时会感到疑惑。

我们将各个模块的代码移动到独立文件了，同时模块树依旧相同。`eat_at_restaurant` 中的函数调用也无需修改继续保持有效，即便其定义存在于不同的文件中。这个技巧让你可以在模块代码增长时，将它们移动到新文件中。

注意，*src/lib.rs* 中的 `pub use crate::front_of_house::hosting` 语句也并未发生改变。use 也不会对哪些文件会被编译为 crate 的一部分有任何影响。`mod` 关键字声明了模块，而 Rust 会在与模块同名的文件中查找模块的代码。


## 总结

Rust 提供了将包分成多个 crate，将 crate 分成模块，以及通过指定绝对或相对路径从一个模块引用另一个模块中定义的项的方式。你可以通过使用 `use` 语句将路径引入作用域，这样在多次使用时可以使用更短的路径。模块定义的代码默认是私有的，不过可以选择增加 `pub` 关键字使其定义变为公有。

接下来，让我们看看一些标准库提供的集合数据类型，你可以利用它们编写出漂亮整洁的代码。

[paths]: ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html
