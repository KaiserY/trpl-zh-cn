## 将模块拆分成多个文件

[ch07-05-separating-modules-into-different-files.md](https://github.com/rust-lang/book/blob/79b9d15410a7b15a65cb86bcb40cbea99198a9e4/src/ch07-05-separating-modules-into-different-files.md)

到目前为止，本章的所有示例都在一个文件中定义了多个模块。当模块变大时，你可能想把它们的定义移到单独的文件中，以便让代码更容易浏览。

例如，我们从示例 7-17 中包含多个餐厅模块的代码开始。我们会将模块提取到各自的文件中，而不是将所有模块都定义到 crate 根文件中。在这里，crate 根文件是 *src/lib.rs*，不过这个过程也适用于 crate 根文件是 *src/main.rs* 的二进制 crate。

首先把 `front_of_house` 模块提取到它自己的文件中。删除 `front_of_house` 模块花括号内的代码，只保留 `mod front_of_house;` 声明，这样 *src/lib.rs* 就会只剩下示例 7-21 所示的代码。注意，在创建出示例 7-22 中的 *src/front_of_house.rs* 文件之前，这段代码都无法编译。

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-21-and-22/src/lib.rs}}
```

<span class="caption">示例 7-21: 声明 `front_of_house` 模块，其内容将位于 *src/front_of_house.rs*</span>

接下来，把刚才花括号中的代码放进一个名为 *src/front_of_house.rs* 的新文件中，如示例 7-22 所示。编译器之所以知道要去这个文件里查找，是因为它在 crate 根中看到了名为 `front_of_house` 的模块声明。

<span class="filename">文件名：src/front_of_house.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-21-and-22/src/front_of_house.rs}}
```

<span class="caption">示例 7-22: 在 *src/front_of_house.rs* 中定义 `front_of_house` 模块</span>

注意，在模块树中，你只需要用 `mod` 声明加载某个文件一次。一旦编译器知道这个文件是项目的一部分了，并且因为 `mod` 语句所在的位置而知道这段代码位于模块树的什么位置，那么项目中的其他文件就应该用它声明位置对应的路径来引用这段代码，这一点会在[“引用模块树中项的路径”][paths]部分讲到。换句话说，`mod` **不是**某些其他编程语言里那种 “include” 操作。

接下来，我们也把 `hosting` 模块提取到它自己的文件中。这个过程稍有不同，因为 `hosting` 是 `front_of_house` 的子模块，而不是根模块。我们会把 `hosting` 对应的文件放进一个以其在模块树中的祖先模块命名的新目录中，这里就是 *src/front_of_house*。

要开始移动 `hosting`，先把 *src/front_of_house.rs* 改成只包含 `hosting` 模块的声明：

<span class="filename">文件名：src/front_of_house.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/no-listing-02-extracting-hosting/src/front_of_house.rs}}
```

然后，创建一个 *src/front_of_house* 目录和一个 *hosting.rs* 文件，用来放置 `hosting` 模块中的定义：

<span class="filename">文件名：src/front_of_house/hosting.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch07-managing-growing-projects/no-listing-02-extracting-hosting/src/front_of_house/hosting.rs}}
```

如果我们反而把 *hosting.rs* 放在 *src* 目录中，编译器就会认为 *hosting.rs* 里的代码属于在 crate 根中声明的 `hosting` 模块，而不是 `front_of_house` 的子模块。编译器关于“要去哪些文件中查找哪些模块代码”的规则，使得目录和文件结构会更贴近模块树本身。

> ### 替代文件路径
>
> 到目前为止，我们介绍的是 Rust 编译器最惯用的文件路径，不过 Rust 也支持一种较旧的文件路径风格。
>
> 对于在 crate 根中声明的 `front_of_house` 模块，编译器会在以下位置查找模块代码：
>
> - *src/front_of_house.rs*（前面介绍的方式）
> - *src/front_of_house/mod.rs*（较旧的风格，但仍然受支持）
>
> 对于 `front_of_house` 的子模块 `hosting`，编译器会在以下位置查找模块代码：
>
> - *src/front_of_house/hosting.rs*（前面介绍的方式）
> - *src/front_of_house/hosting/mod.rs*（较旧的风格，但仍然受支持）
>
> 如果你对同一个模块同时使用这两种风格，编译器就会报错。在同一个项目里为不同模块混用两种风格是允许的，不过这可能会让浏览项目的人感到困惑。
>
> 使用 *mod.rs* 这种文件名风格的主要缺点是，项目里最后可能会有很多都叫 *mod.rs* 的文件；当你在编辑器里同时打开它们时，就会变得很混乱。

现在，我们已经把每个模块的代码都移动到了独立文件中，而模块树保持不变。`eat_at_restaurant` 中的函数调用也完全不需要修改，即使这些定义现在位于不同的文件中也一样能工作。这个技巧让你可以在模块逐渐变大时，再把它们迁移到新文件里。

注意，*src/lib.rs* 中的 `pub use crate::front_of_house::hosting` 语句也完全没有变化，而且 `use` 也不会影响 crate 会编译哪些文件。`mod` 关键字用来声明模块，而 Rust 会在与模块同名的文件中查找应放进该模块的代码。


## 总结

Rust 允许你把一个包拆分成多个 crate，再把一个 crate 拆分成多个模块，这样你就能在一个模块中引用另一个模块里定义的项。你既可以使用绝对路径，也可以使用相对路径。还可以用 `use` 语句把路径引入作用域，这样在同一作用域内多次使用该项时就能写更短的路径。模块代码默认是私有的，不过你可以加上 `pub` 关键字，把定义公开出去。

下一章，我们将看看标准库中的一些集合数据结构，你可以在组织良好的代码中使用它们。

[paths]: ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html
