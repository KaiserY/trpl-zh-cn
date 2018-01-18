## 使用 `pub` 控制可见性

> [ch07-02-controlling-visibility-with-pub.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch07-02-controlling-visibility-with-pub.md)
> <br>
> commit 478fa6f92b6e7975f5e4da8a84a498fb873b937d

我们通过将 `network` 和 `network::server` 的代码分别移动到 *src/network/mod.rs* 和 *src/network/server.rs* 文件中解决了示例 7-5 中出现的错误信息。现在，`cargo build` 能够构建我们的项目，不过仍然有一些警告信息，表示 `client::connect`、`network::connect` 和`network::server::connect` 函数没有被使用：

```text
warning: function is never used: `connect`
 --> src/client.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
  |
  = note: #[warn(dead_code)] on by default

warning: function is never used: `connect`
 --> src/network/mod.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^

warning: function is never used: `connect`
 --> src/network/server.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
```

那么为什么会出现这些错误信息呢？毕竟我们构建的是一个库，它的函数的目的是被 **用户** 使用，而不一定要被项目自身使用，所以不应该担心这些 `connect` 函数是未使用的。创建它们的意义就在于被另一个项目而不是被我们自己使用。

为了理解为什么这个程序出现了这些警告，尝试在另一个项目中使用这个 `connect` 库，从外部调用它们。为此，通过创建一个包含这些代码的 *src/main.rs* 文件，在与库 crate 相同的目录创建一个二进制 crate：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
extern crate communicator;

fn main() {
    communicator::client::connect();
}
```

使用 `extern crate` 指令将 `communicator` 库 crate 引入到作用域。我们的包现在包含 **两个** crate。Cargo 认为 *src/main.rs* 是一个二进制 crate 的根文件，与现存的以 *src/lib.rs* 为根文件的库 crate 相区分。这个模式在可执行项目中非常常见：大部分功能位于库 crate 中，而二进制 crate 使用这个库 crate。通过这种方式，其他程序也可以使用这个库 crate，这是一个很好的关注分离（separation of concerns）。

从一个外部 crate 的视角观察 `communicator` 库的内部，我们创建的所有模块都位于一个与 crate 同名的模块内部，`communicator`。这个顶层的模块被称为 crate 的 **根模块**（*root module*）。

另外注意到即便在项目的子模块中使用外部 crate，`extern crate` 也应该位于根模块（也就是 *src/main.rs* 或 *src/lib.rs*）。接着，在子模块中，我们就可以像顶层模块那样引用外部 crate 中的项了。

我们的二进制 crate 如今正好调用了库中 `client` 模块的 `connect` 函数。然而，执行 `cargo build` 会在之前的警告之后出现一个错误：

```text
error[E0603]: module `client` is private
 --> src/main.rs:4:5
  |
4 |     communicator::client::connect();
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

啊哈！这告诉了我们 `client` 模块是私有的，这也正是那些警告的症结所在。这也是我们第一次在 Rust 上下文中涉及到 **公有**（*public*）和 **私有**（*private*）的概念。Rust 所有代码的默认状态是私有的：除了自己之外别人不允许使用这些代码。如果不在自己的项目中使用一个私有函数，因为程序自身是唯一允许使用这个函数的代码，Rust 会警告说函数未被使用。

一旦我们指定一个像 `client::connect` 的函数为公有，不光二进制 crate 中的函数调用是允许的，函数未被使用的警告也会消失。将其标记为公有让 Rust 知道了函数将会在程序的外部被使用。现在这个可能的理论上的外部可用性使得 Rust 认为这个函数 “已经被使用”。因此。当某项被标记为公有，Rust 不再要求它在程序自身被使用并停止警告函数未被使用。

### 标记函数为公有

为了告诉 Rust 将函数标记为公有，在声明的开头增加 `pub` 关键字。现在我们将致力于修复 `client::connect` 未被使用的警告，以及二进制 crate 中 “模块 `client` 是私有的” 的错误。像这样修改 *src/lib.rs* 使 `client` 模块公有：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
pub mod client;

mod network;
```

`pub` 写在 `mod` 之前。再次尝试构建：

```text
error[E0603]: function `connect` is private
 --> src/main.rs:4:5
  |
4 |     communicator::client::connect();
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

非常好！另一个不同的错误！好的，不同的错误信息也是值得庆祝的（可能是程序员被黑的最惨的一次）。新错误表明“函数 `connect` 是私有的”，那么让我们修改 *src/client.rs* 将 `client::connect` 也设为公有：

<span class="filename">文件名: src/client.rs</span>

```rust
pub fn connect() {
}
```

再一次运行 `cargo build`：

```text
warning: function is never used: `connect`
 --> src/network/mod.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
  |
  = note: #[warn(dead_code)] on by default

warning: function is never used: `connect`
 --> src/network/server.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
```

编译通过了，关于 `client::connect` 未被使用的警告消失了！

未被使用的代码并不总是意味着它们需要被设为公有的：如果你 **不** 希望这些函数成为公有 API 的一部分，未被使用的代码警告可能是在提醒你这些代码不再需要并可以安全的删除它们。这也可能是警告你出 bug 了，如果你刚刚不小心删除了库中所有这个函数的调用。

当然我们的情况是，**确实** 希望另外两个函数也作为 crate 公有 API 的一部分，所以让我们也将其标记为 `pub` 并去掉剩余的警告。修改 *src/network/mod.rs* 为：

<span class="filename">文件名: src/network/mod.rs</span>

```rust,ignore
pub fn connect() {
}

mod server;
```

并编译代码：

```text
warning: function is never used: `connect`
 --> src/network/mod.rs:1:1
  |
1 | / pub fn connect() {
2 | | }
  | |_^
  |
  = note: #[warn(dead_code)] on by default

warning: function is never used: `connect`
 --> src/network/server.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
```

虽然将 `network::connect` 设为 `pub` 了我们仍然得到了一个未被使用函数的警告。这是因为模块中的函数是公有的，不过函数所在的 `network` 模块却不是公有的。这回我们是自内向外修改库文件的，而 `client::connect` 的时候是自外向内修改的。我们需要修改 *src/lib.rs* 让 `network` 也是公有的，如下：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
pub mod client;

pub mod network;
```

现在编译的话，那个警告就消失了：

```text
warning: function is never used: `connect`
 --> src/network/server.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
  |
  = note: #[warn(dead_code)] on by default
```

只剩一个警告了！尝试自食其力修改它吧！

### 私有性规则

总的来说，有如下项的可见性规则：

1. 如果一个项是公有的，它能被任何父模块访问
2. 如果一个项是私有的，它能被其直接父模块及其任何子模块访问

### 私有性示例

让我们看看更多私有性的例子作为练习。创建一个新的库项目并在新项目的 *src/lib.rs* 输入示例 7-6 中的代码：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
mod outermost {
    pub fn middle_function() {}

    fn middle_secret_function() {}

    mod inside {
        pub fn inner_function() {}

        fn secret_function() {}
    }
}

fn try_me() {
    outermost::middle_function();
    outermost::middle_secret_function();
    outermost::inside::inner_function();
    outermost::inside::secret_function();
}
```

<span class="caption">示例 7-6：私有和公有函数的例子，其中部分是不正确的</span>

在尝试编译这些代码之前，猜测一下 `try_me` 函数的哪一行会出错。接着编译项目来看看是否猜对了，然后继续阅读后面关于错误的讨论！

#### 检查错误

`try_me` 函数位于项目的根模块。叫做 `outermost` 的模块是私有的，不过第二条私有性规则说明 `try_me` 函数允许访问 `outermost` 模块，因为 `outermost` 位于当前（根）模块，`try_me` 也是。

`outermost::middle_function` 的调用是正确的。因为 `middle_function` 是公有的，而 `try_me` 通过其父模块 `outermost` 访问 `middle_function`。根据上一段的规则我们可以确定这个模块是可访问的。

`outermost::middle_secret_function` 的调用会造成一个编译错误。`middle_secret_function` 是私有的，所以第二条（私有性）规则生效了。根模块既不是 `middle_secret_function` 的当前模块（`outermost` 是），也不是 `middle_secret_function` 当前模块的子模块。

叫做 `inside` 的模块是私有的且没有子模块，所以它只能被当前模块 `outermost` 访问。这意味着 `try_me` 函数不允许调用 `outermost::inside::inner_function` 或 `outermost::inside::secret_function` 中的任何一个。

#### 修改错误

这里有一些尝试修复错误的代码修改意见。在你尝试它们之前，猜测一下它们哪个能修复错误，接着编译查看你是否猜对了，并结合私有性规则理解为什么。

* 如果 `inside` 模块是公有的？
* 如果 `outermost` 是公有的而 `inside` 是私有的？
* 如果在 `inner_function` 函数体中调用 `::outermost::middle_secret_function()`？（开头的两个冒号意味着从根模块开始引用模块。）

请随意设计更多的实验并尝试理解它们！

接下来，让我们讨论一下使用 `use` 关键字将项引入作用域。
