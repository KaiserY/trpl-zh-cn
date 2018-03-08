## `mod` 和文件系统

> [ch07-01-mod-and-the-filesystem.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch07-01-mod-and-the-filesystem.md)
> <br>
> commit 478fa6f92b6e7975f5e4da8a84a498fb873b937d

我们将通过使用 Cargo 创建一个新项目来开始我们的模块之旅，不过这次不再创建一个二进制 crate，而是创建一个库 crate：一个其他人可以作为依赖导入的项目。第二章猜猜看游戏中作为依赖使用的 `rand` 就是这样的 crate。

我们将创建一个提供一些通用网络功能的项目的骨架结构；我们将专注于模块和函数的组织，而不担心函数体中的具体代码。这个项目叫做 `communicator`。Cargo 默认会创建一个库 crate 除非指定其他项目类型，所以如果不像一直以来那样加入 `--bin` 参数则项目将会是一个库：

```text
$ cargo new communicator
$ cd communicator
```

注意 Cargo 生成了 *src/lib.rs* 而不是 *src/main.rs*。在 *src/lib.rs* 中我们会找到这些：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

Cargo 创建了一个空的测试来帮助我们开始库项目，不像使用 `--bin` 参数那样创建一个 “Hello, world!” 二进制项目。在本章之后的 “使用 `super` 访问父模块” 部分会介绍 `#[]` 和 `mod tests` 语法，目前只需确保它们位于 *src/lib.rs* 底部即可。

因为没有 *src/main.rs* 文件，所以没有可供 Cargo 的 `cargo run` 执行的东西。因此，我们将使用 `cargo build` 命令只是编译库 crate 的代码。

我们将学习根据编写代码的意图来以不同方法组织库项目代码以适应多种情况。

### 模块定义

对于 `communicator` 网络库，首先要定义一个叫做 `network` 的模块，它包含一个叫做 `connect` 的函数定义。Rust 中所有模块的定义都以关键字 `mod` 开始。在 *src/lib.rs* 文件的开头在测试代码的上面增加这些代码：

<span class="filename">文件名: src/lib.rs</span>

```rust
mod network {
    fn connect() {
    }
}
```

`mod` 关键字的后面是模块的名字，`network`，接着是位于大括号中的代码块。代码块中的一切都位于 `network` 命名空间中。在这个例子中，只有一个函数，`connect`。如果想要在 `network` 模块外面的代码中调用这个函数，需要指定模块名并使用命名空间语法 `::`，像这样：`network::connect()`，而不是只是 `connect()`。

也可以在 *src/lib.rs* 文件中同时存在多个模块。例如，再拥有一个 `client` 模块，它也有一个叫做 `connect` 的函数，如示例 7-1 中所示那样增加这个模块：

<span class="filename">文件名: src/lib.rs</span>

```rust
mod network {
    fn connect() {
    }
}

mod client {
    fn connect() {
    }
}
```

<span class="caption">示例 7-1：`network` 模块和 `client` 一同定义于 *src/lib.rs*</span>

现在我们有了 `network::connect` 函数和 `client::connect` 函数。它们可能有着完全不同的功能，同时它们也不会彼此冲突，因为它们位于不同的模块。

在这个例子中，因为我们构建的是一个库，作为库入口点的文件是 *src/lib.rs*。然而，对于创建模块来说，*src/lib.rs* 并没有什么特殊意义。也可以在二进制 crate 的 *src/main.rs* 中创建模块，正如在库 crate 的 *src/lib.rs* 创建模块一样。事实上，也可以将模块放入其他模块中。这有助于随着模块的增长，将相关的功能组织在一起并又保持各自独立。如何选择组织代码依赖于如何考虑代码不同部分之间的关系。例如，对于库的用户来说，`client` 模块和它的函数 `connect` 可能放在 `network` 命名空间里显得更有道理，如示例 7-2 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
mod network {
    fn connect() {
    }

    mod client {
        fn connect() {
        }
    }
}
```

<span class="caption">示例 7-2：将 `client` 模块移动到 `network` 模块中</span>

在 *src/lib.rs* 文件中，将现有的 `mod network` 和 `mod client` 的定义替换为示例 7-2 中的定义，这里将 `client` 模块作为 `network` 的一个内部模块。现在我们有了 `network::connect` 和 `network::client::connect` 函数：同样的，这两个 `connect` 函数也不相冲突，因为它们在不同的命名空间中。

这样，模块之间形成了一个层次结构。*src/lib.rs* 的内容位于最顶层，而其子模块位于较低的层次。如下是示例 7-1 中的例子以层次的方式考虑的结构：

```text
communicator
 ├── network
 └── client
```

而这是示例 7-2 中例子的层次结构：

```text
communicator
 └── network
     └── client
```

可以看到示例 7-2 中，`client` 是 `network` 的子模块，而不是它的同级模块。更为复杂的项目可以有很多的模块，所以它们需要符合逻辑地组合在一起以便记录它们。在项目中 “符合逻辑” 的意义全凭你的理解和库的用户对你项目领域的认识。利用我们这里讲到的技术来创建同级模块和嵌套的模块，总有一个会是你会喜欢的结构。

### 将模块移动到其他文件

位于层级结构中的模块，非常类似计算机领域的另一个我们非常熟悉的结构：文件系统！我们可以利用 Rust 的模块系统连同多个文件一起分解 Rust 项目，这样就不会是所有的内容都落到 *src/lib.rs* 或 *src/main.rs* 中了。为了举例，我们将从示例 7-3 中的代码开始：

<span class="filename">文件名: src/lib.rs</span>

```rust
mod client {
    fn connect() {
    }
}

mod network {
    fn connect() {
    }

    mod server {
        fn connect() {
        }
    }
}
```

<span class="caption">示例 7-3：三个模块，`client`、`network` 和 `network::server`，它们都定义于 *src/lib.rs*</span>

*src/lib.rs* 文件有如下层次结构：

```text
communicator
 ├── client
 └── network
     └── server
```

如果这些模块有很多函数，而这些函数又很长，将难以在文件中寻找我们需要的代码。因为这些函数被嵌套进一个或多个 `mod` 块中，同时函数中的代码也会开始变长。这就有充分的理由将 `client`、`network` 和 `server` 每一个模块从 *src/lib.rs* 抽出并放入它们自己的文件中。

首先，将 `client` 模块的代码替换为只有 `client` 模块声明，这样 *src/lib.rs* 看起来应该像如示例 7-4 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
mod client;

mod network {
    fn connect() {
    }

    mod server {
        fn connect() {
        }
    }
}
```

<span class="caption">示例 7-4：提取出 `client` 模块的内容但仍将其声明留在 *src/lib.rs*</span>

这里我们仍然 **声明** 了 `client` 模块，不过将代码块替换为了分号，这告诉了 Rust 在 `client` 模块的作用域中寻找另一个定义代码的位置。换句话说，`mod client;` 行意味着：

```rust,ignore
mod client {
    // contents of client.rs
}
```

那么现在需要创建对应模块名的外部文件。在 *src/* 目录创建一个 *client.rs* 文件，接着打开它并输入如下内容，它是上一步被去掉的 `client` 模块中的 `connect` 函数：

<span class="filename">文件名: src/client.rs</span>

```rust
fn connect() {
}
```

注意这个文件中并不需要一个 `mod` 声明；因为已经在 *src/lib.rs* 中已经使用 `mod` 声明了 `client` 模块。这个文件仅仅提供 `client` 模块的 **内容**。如果在这里加上一个 `mod client`，那么就等于给 `client` 模块增加了一个叫做 `client` 的子模块了！

Rust 默认只知道 *src/lib.rs* 中的内容。如果想要对项目加入更多文件，我们需要在 *src/lib.rs* 中告诉 Rust 去寻找其他文件；这就是为什么 `mod client` 需要被定义在 *src/lib.rs* 而不能在 *src/client.rs* 的原因。

现在，一切应该能成功编译，虽然会有一些警告。记住使用 `cargo build` 而不是 `cargo run` 因为这是一个库 crate 而不是二进制 crate：

```text
$ cargo build
   Compiling communicator v0.1.0 (file:///projects/communicator)
warning: function is never used: `connect`
 --> src/client.rs:1:1
  |
1 | / fn connect() {
2 | | }
  | |_^
  |
  = note: #[warn(dead_code)] on by default

warning: function is never used: `connect`
 --> src/lib.rs:4:5
  |
4 | /     fn connect() {
5 | |     }
  | |_____^

warning: function is never used: `connect`
 --> src/lib.rs:8:9
  |
8 | /         fn connect() {
9 | |         }
  | |_________^
```

这些警告提醒我们有从未被使用的函数。目前不用担心这些警告，在本章后面的 “使用 `pub` 控制可见性” 部分会解决它们。好消息是，它们仅仅是警告，我们的项目能够成功编译。

下面使用相同的模式将 `network` 模块提取到自己的文件中。删除 *src/lib.rs* 中 `network` 模块的内容并在声明后加上一个分号，像这样：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
mod client;

mod network;
```

接着新建 *src/network.rs* 文件并输入如下内容：

<span class="filename">文件名: src/network.rs</span>

```rust
fn connect() {
}

mod server {
    fn connect() {
    }
}
```

注意这个模块文件中我们也使用了一个 `mod` 声明；这是因为我们希望 `server` 成为 `network` 的一个子模块。

现在再次运行 `cargo build`。成功！不过我们还需要再提取出另一个模块：`server`。因为这是一个子模块——也就是模块中的模块——目前的将模块提取到对应名字的文件中的策略就不管用了。如果我们仍这么尝试则会出现错误。对 *src/network.rs* 的第一个修改是用 `mod server;` 替换 `server` 模块的内容：

<span class="filename">文件名: src/network.rs</span>

```rust,ignore
fn connect() {
}

mod server;
```

接着创建 *src/server.rs* 文件并输入需要提取的 `server` 模块的内容：

<span class="filename">文件名: src/server.rs</span>

```rust
fn connect() {
}
```

当尝试运行 `cargo build` 时，会出现如示例 7-5 中所示的错误：

```text
$ cargo build
   Compiling communicator v0.1.0 (file:///projects/communicator)
error: cannot declare a new module at this location
 --> src/network.rs:4:5
  |
4 | mod server;
  |     ^^^^^^
  |
note: maybe move this module `src/network.rs` to its own directory via `src/network/mod.rs`
 --> src/network.rs:4:5
  |
4 | mod server;
  |     ^^^^^^
note: ... or maybe `use` the module `server` instead of possibly redeclaring it
 --> src/network.rs:4:5
  |
4 | mod server;
  |     ^^^^^^
```

<span class="caption">示例 7-5：尝试将 `server` 子模块提取到 *src/server.rs* 时出现的错误</span>

这个错误说明 “不能在这个位置新声明一个模块” 并指出 *src/network.rs* 中的 `mod server;` 这一行。看来 *src/network.rs* 与 *src/lib.rs* 在某些方面是不同的；继续阅读以理解这是为什么。

示例 7-5 中间的 note 事实上是非常有帮助的，因为它指出了一些我们还未讲到的操作：

```text
note: maybe move this module `network` to its own directory via
`network/mod.rs`
```

我们可以按照记录所建议的去操作，而不是继续使用之前的与模块同名文件的模式：

1. 新建一个叫做 *network* 的 **目录**，这是父模块的名字
2. 将 *src/network.rs* 移动到新建的 *network* 目录中并重命名为 *src/network/mod.rs*
3. 将子模块文件 *src/server.rs* 移动到 *network* 目录中

如下是执行这些步骤的命令：

```text
$ mkdir src/network
$ mv src/network.rs src/network/mod.rs
$ mv src/server.rs src/network
```

现在如果运行 `cargo build` 的话将顺利编译（虽然仍有警告）。现在模块的布局看起来仍然与示例 7-3 中所有代码都在 *src/lib.rs* 中时完全一样：

```text
communicator
 ├── client
 └── network
     └── server
```

对应的文件布局现在看起来像这样：

```text
├── src
│   ├── client.rs
│   ├── lib.rs
│   └── network
│       ├── mod.rs
│       └── server.rs
```

那么，当我们想要提取 `network::server` 模块时，为什么也必须将 *src/network.rs* 文件改名成 *src/network/mod.rs* 文件呢，还有为什么要将 `network::server` 的代码放入 *network* 目录的 *src/network/server.rs* 文件中，而不能将 `network::server` 模块提取到 *src/server.rs* 中呢？原因是如果 *server.rs* 文件在 *src* 目录中那么 Rust 就不能知道 `server` 应当是 `network` 的子模块。为了阐明这里 Rust 的行为，让我们考虑一下有着如下层级的另一个例子，其所有定义都位于 *src/lib.rs* 中：

```text
communicator
 ├── client
 └── network
     └── client
```

在这个例子中，仍然有这三个模块，`client`、`network` 和 `network::client`。如果按照与上面最开始将模块提取到文件中相同的步骤来操作，对于 `client` 模块会创建 *src/client.rs*。对于 `network` 模块，会创建 *src/network.rs*。但是接下来不能将 `network::client` 模块提取到 *src/client.rs* 文件中，因为它已经存在了，对应顶层的 `client` 模块！如果将 `client` 和 `network::client` 的代码都放入 *src/client.rs* 文件，Rust 将无从可知这些代码是属于 `client` 还是 `network::client` 的。

因此，为了将 `network` 模块的子模块 `network::client` 提取到一个文件中，需要为 `network` 模块新建一个目录替代 *src/network.rs* 文件。接着 `network` 模块的代码将进入 *src/network/mod.rs* 文件，而子模块 `network::client` 将拥有其自己的文件 *src/network/client.rs*。现在顶层的 *src/client.rs* 中的代码毫无疑问的都属于 `client` 模块。

### 模块文件系统的规则

让我们总结一下与文件有关的模块规则：

* 如果一个叫做 `foo` 的模块没有子模块，应该将 `foo` 的声明放入叫做 *foo.rs* 的文件中。
* 如果一个叫做 `foo` 的模块有子模块，应该将 `foo` 的声明放入叫做 *foo/mod.rs* 的文件中。

这些规则适用于递归（嵌套），所以如果 `foo` 模块有一个子模块 `bar` 而 `bar` 没有子模块，则 *src* 目录中应该有如下文件：

```text
├── foo
│   ├── bar.rs (contains the declarations in `foo::bar`)
│   └── mod.rs (contains the declarations in `foo`, including `mod bar`)
```

模块自身则应该使用 `mod` 关键字定义于父模块的文件中。

接下来，我们讨论一下 `pub` 关键字，并除掉那些警告！
