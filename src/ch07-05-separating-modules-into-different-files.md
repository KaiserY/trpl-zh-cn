## 将模块分割进不同文件

> [ch07-05-separating-modules-into-different-files.md](https://github.com/rust-lang/book/blob/master/src/ch07-05-separating-modules-into-different-files.md)
> <br>
> commit a5a5bf9d6ea5763a9110f727911a21da854b1d90

到目前为止，本章所有的例子都在一个文件中定义多个模块。当模块变得更大时，你可能想要将它们的定义移动到单独的文件中，从而使代码更容易阅读。

例如，我们从示例 7-17 开始，将 `front_of_house` 模块移动到属于它自己的文件 *src/front_of_house.rs* 中，通过改变 crate 根文件，使其包含示例 7-21 所示的代码。在这个例子中，crate 根文件是 *src/lib.rs*，这也同样适用于以 *src/main.rs* 为 crate 根文件的二进制 crate 项。

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}
```

<span class="caption">示例 7-21: 声明 `front_of_house` 模块，其内容将位于 *src/front_of_house.rs*</span>

*src/front_of_house.rs* 会获取 `front_of_house` 模块的定义内容，如示例 7-22 所示。

<span class="filename">文件名: src/front_of_house.rs</span>

```rust
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```

<span class="caption">示例 7-22: 在 *src/front_of_house.rs* 中定义 `front_of_house`
模块</span>

在 `mod front_of_house` 后使用分号，而不是代码块，这将告诉 Rust 在另一个与模块同名的文件中加载模块的内容。继续重构我们例子，将 `hosting` 模块也提取到其自己的文件中，仅对 *src/front_of_house.rs* 包含 `hosting` 模块的声明进行修改：

<span class="filename">文件名: src/front_of_house.rs</span>

```rust
pub mod hosting;
```

接着我们创建一个 *src/front_of_house* 目录和一个包含 `hosting` 模块定义的 *src/front_of_house/hosting.rs* 文件：

<span class="filename">文件名: src/front_of_house/hosting.rs</span>

```
pub fn add_to_waitlist() {}
```

模块树依然保持相同，`eat_at_restaurant` 中的函数调用也无需修改继续保持有效，即便其定义存在于不同的文件中。这个技巧让你可以在模块代码增长时，将它们移动到新文件中。

注意，*src/lib.rs* 中的 `pub use crate::front_of_house::hosting` 语句是没有改变的，在文件作为 crate 的一部分而编译时，`use` 不会有任何影响。`mod` 关键字声明了模块，Rust 会在与模块同名的文件中查找模块的代码。

## 总结

Rust 提供了将包分成多个 crate，将 crate 分成模块，以及通过指定绝对或相对路径从一个模块引用另一个模块中定义的项的方式。你可以通过使用 `use` 语句将路径引入作用域，这样在多次使用时可以使用更短的路径。模块定义的代码默认是私有的，不过可以选择增加 `pub` 关键字使其定义变为公有。

接下来，让我们看看一些标准库提供的集合数据类型，你可以利用它们编写出漂亮整洁的代码。
