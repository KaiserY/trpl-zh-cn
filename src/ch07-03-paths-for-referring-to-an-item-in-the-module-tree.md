# 路径来引用模块树中的项

> [ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md](https://github.com/rust-lang/book/blob/master/src/ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)
> <br>
> commit cc6a1ef2614aa94003566027b285b249ccf961fa

来看一下Rust如何模块树中找到一个项的位置，我们使用路径的方式，就像在文件系统使用路径一样。如果我们想要调用一个函数，我们需要知道它的路径。

路径有两种形式：

* **绝对路径**（*absolute path*）从 crate 根开始，以 crate 名或者字面值 `crate` 开头。
* **相对路径**（*relative path*）从当前模块开始，以 `self`、`super` 或当前模块的标识符开头。

绝对路径和相对路径都后跟一个或多个由双冒号（`::`）分割的标识符。

让我们回到示例 7-1。我们如何调用`add_to_waitlist`函数？还是同样的问题，`add_to_waitlist`函数的路径是什么？在示例 7-3 中，我们通过删除一些模块和函数，稍微简化了一下我们的代码。我们在 crate 根定义了一个新函数`eat_at_restaurant`，并在其中展示调用`add_to_waitlist`函数的两种方法。`eat_at_restaurant`函数是我们 crate 库的一个公共API，所以我们使用`pub`关键字来标记它。在“[使用`pub`关键字暴露路径](https://github.com/rust-lang/book/blob/master/src/ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html#exposing-paths-with-the-pub-keyword)”一节，我们将详细介绍`pub`。注意，这个例子无法编译通过，我们稍后会解释原因。

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore,does_not_compile
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();

    // Relative path
    front_of_house::hosting::add_to_waitlist();
}
```

<span class="caption">示例 7-3: 使用绝对路径和相对路径来调用`add_to_waitlist`函数</span>

第一种方式，我们在`eat_at_restaurant`中调用`add_to_waitlist`函数，使用的是绝对路径。`add_to_waitlist`函数与`eat_at_restaurant`被定义在同一 crate 中，这意味着我们可以使用`crate`关键字为起始的绝对路径。

在`crate`后面，我们持续地嵌入模块，直到我们找到`add_to_waitlist`。你可以想象出一个相同结构的文件系统，我们通过指定路径`/front_of_house/hosting/add_to_waitlist`来执行`add_to_waitlist`程序。我们使用 `crate` 从 crate 根开始就类似于在 shell 中使用 `/` 从文件系统根开始。

第二种方式，我们在`eat_at_restaurant`中调用`add_to_waitlist`，使用的是相对路径。这个路径以`front_of_house`为起始，这个模块在模块树中，与`eat_at_restaurant`定义在同一层级。与之等价的文件系统路径就是`front_of_house/hosting/add_to_waitlist`。以名称为起始，意味着该路径是相对路径。

选择使用相对路径还是绝对路径，还是要取决于你的项目。取决于你是更倾向于将项的定义代码与使用该项的代码分来移动，还是一起移动。举一个例子，如果我们要将`front_of_house`模块和`eat_at_restaurant`函数一起移动到一个名为`customer_experience`的模块中，我们需要更新`add_to_waitlist`的绝对路径，但是相对路径还是可用的。然而，如果我们要将`eat_at_restaurant`函数单独移到一个名为`dining`的模块中，还是可以使用原本的绝对路径来调用`add_to_waitlist`，但是相对路径必须要更新。我们更倾向于使用绝对路径，因为它更适合移动代码定义和项调用的相互独立。

让我们试着编译一下示例 7-3，并查明为何不能编译！示例 7-4 展示了这个错误。

```text
$ cargo build
   Compiling restaurant v0.1.0 (file:///projects/restaurant)
error[E0603]: module `hosting` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^

error[E0603]: module `hosting` is private
  --> src/lib.rs:12:21
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                     ^^^^^^^
```

<span class="caption">示例 7-4: 构建示例 7-3 出现的编译器错误</span>

错误信息说`hosting`模块是私有的。换句话说，我们拥有`hosting`模块和`add_to_waitlist`函数的的正确路径，但是 Rust 不让我们使用，因为它不能访问私有片段。

模块不仅对于你组织代码很有用。他们还定义了 Rust 的*私有性边界*（*privacy boundary*）：这条界线不允许外部代码了解、调用和依赖被封装的实现细节。所以，如果你希望创建一个私有函数或结构体，你可以将其放入模块。

Rust中默认所有项（函数、方法、结构体、枚举、模块和常量）都是私有的。父模块中的项不能使用子模块中的私有项，但是子模块中的项可以使用他们父模块中的项。这是因为子模块封装并隐藏了他们的实现详情，但是子模块可以看到他们定义的上下文。继续拿餐馆作比喻，把私有性规则想象成餐馆的后台办公室：餐馆内的事务对餐厅顾客来说是不可知的，但办公室经理可以洞悉其经营的餐厅并在其中做任何事情。

Rust 选择以这种方式来实现模块系统功能，因此默认隐藏内部实现细节。这样一来，你您就知道可以更改内部代码的哪些部分而不会破坏外部代码。你还可以通过使用`pub`关键字来创建公共项，使子模块的内部部分暴露给上级模块。
