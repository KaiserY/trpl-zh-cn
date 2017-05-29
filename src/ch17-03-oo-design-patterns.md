## 面向对象设计模式的实现

> [ch17-03-oo-design-patterns.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-03-oo-design-patterns.md)
> <br>
> commit 67737ff868e3347588cc832eceb8fc237afc5895

让我们看看一个状态设计模式的例子以及如何在 Rust 中使用他们。**状态模式**（*state pattern*）是指一个值有某些内部状态，而它的行为随着其内部状态而改变。内部状态由一系列继承了共享功能的对象表现（我们使用结构体和 trait 因为 Rust 没有对象和继承）。每一个状态对象负责它自身的行为和当需要改变为另一个状态时的规则。持有任何一个这种状态对象的值对于不同状态的行为以及何时状态转移毫不知情。当将来需求改变时，无需改变值持有状态或者使用值的代码。我们只需更新某个状态对象中的代码来改变它的规则，或者是增加更多的状态对象。

为了探索这个概念，我们将实现一个增量式的发布博文的工作流。这个我们希望发布博文时所应遵守的工作流，一旦完成了它的实现，将为如下：

1. 博文从空白的草案开始。
2. 一旦草案完成，请求审核博文。
3. 一旦博文过审，它将被发表。
4. 只有被发表的博文的内容会被打印，这样就不会意外打印出没有被审核的博文的文本。

任何其他对博文的修改尝试都是没有作用的。例如，如果尝试在请求审核之前通过一个草案博文，博文应该保持未发布的状态。

列表 17-11 展示这个工作流的代码形式。这是一个我们将要在一个叫做 `blog` 的库 crate 中实现的 API 的使用示例：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
extern crate blog;
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());

    post.request_review();
    assert_eq!("", post.content());

    post.approve();
    assert_eq!("I ate a salad for lunch today", post.content());
}
```

<span class="caption">列表 17-11: 展示了 `blog` crate 期望行为的代码</span>

我们希望能够使用 `Post::new` 创建一个新的博文草案。接着希望能在草案阶段为博文编写一些文本。如果尝试立即打印出博文的内容，将不会得到任何文本，因为博文仍然是草案。这里增加的 `assert_eq!` 用于展示目的。断言草案博文的 `content` 方法返回空字符串将能作为库的一个非常好的单元测试，不过我们并不准备为这个例子编写单元测试。

接下来，我们希望能够请求审核博文，而在等待审核的阶段 `content` 应该仍然返回空字符串，当博文审核通过，它应该被发表，这意味着当调用 `content` 时我们编写的文本将被返回。

注意我们与 crate 交互的唯一的类型是 `Post`。博文可能处于的多种状态（草案，等待审核和发布）由 `Post` 内部管理。博文状态依我们在`Post`调用的方法而改变，但不必直接管理状态改变。这也意味着不会在状态上犯错，比如忘记了在发布前请求审核。

### 定义 `Post` 并新建一个草案状态的实例

让我们开始实现这个库吧！我们知道需要一个公有 `Post` 结构体来存放一些文本，所以让我们从结构体的定义和一个创建 `Post` 实例的公有关联函数 `new` 开始，如列表 17-12 所示。我们还需定义一个私有 trait `State`。`Post` 将在私有字段 `state` 中存放一个 `Option` 中的 trait 对象 `Box<State>`。稍后将会看到为何 `Option` 是必须的。`State` trait 定义了所有不同状态的博文所共享的行为，同时 `Draft`、`PendingReview` 和 `Published` 状态都会实现`State` 状态。现在这个 trait 并没有任何方法，同时开始将只定义`Draft`状态因为这是我们希望开始的状态：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct Post {
    state: Option<Box<State>>,
    content: String,
}

impl Post {
    pub fn new() -> Post {
        Post {
            state: Some(Box::new(Draft {})),
            content: String::new(),
        }
    }
}

trait State {}

struct Draft {}

impl State for Draft {}
```

<span class="caption">列表 17-12: `Post`结构体的定义和新建 `Post` 实例的 `new`函数，`State` trait 和实现了 `State` 的结构体 `Draft`</span>

当创建新的 `Post` 时，我们将其 `state` 字段设置为一个 `Some` 值，它存放了指向一个 `Draft` 结构体新实例的 `Box`。这确保了无论何时新建一个 `Post` 实例，它会从草案开始。因为 `Post` 的 `state` 字段是私有的，也就无法创建任何其他状态的 `Post` 了！。

### 存放博文内容的文本

在 `Post::new` 函数中，我们设置 `content` 字段为新的空 `String`。在列表 17-11 中，展示了我们希望能够调用一个叫做 `add_text` 的方法并向其传递一个 `&str` 来将文本增加到博文的内容中。选择实现为一个方法而不是将 `content` 字段暴露为 `pub` 是因为我们希望能够通过之后实现的一个方法来控制 `content` 字段如何被读取。`add_text` 方法是非常直观的，让我们在列表 17-13 的 `impl Post` 块中增加一个实现：


<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String,
# }
#
impl Post {
    // ...snip...
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

<span class="caption">列表 17-13: 实现方法 `add_text` 来向博文的 `content` 增加文本</span>

`add_text` 获取一个 `self` 的可变引用，因为需要改变调用 `add_text` 的 `Post`。接着调用 `content` 中的 `String` 的 `push_str` 并传递 `text` 参数来保存到 `content` 中。这不是状态模式的一部分，因为它的行为并不依赖博文所处的状态。`add_text` 方法完全不与 `state` 状态交互，不过这是我们希望支持的行为的一部分。

### 博文草案的内容是空的

调用 `add_text` 并像博文增加一些内容之后，我们仍然希望 `content` 方法返回一个空字符串 slice，因为博文仍然处于草案状态，如列表 17-11 的第 8 行所示。现在让我们使用能满足要求的最简单的方式来实现 `content` 方法 总是返回一个空字符 slice。当实现了将博文状态改为发布的能力之后将改变这一做法。但是现在博文只能是草案状态，这意味着其内容总是空的。列表 17-14 展示了这个占位符实现：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String,
# }
#
impl Post {
    // ...snip...
    pub fn content(&self) -> &str {
        ""
    }
}
```

<span class="caption">列表 17-14: 增加一个 `Post` 的 `content` 方法的占位实现，它总是返回一个空字符串 slice</span>

通过增加这个 `content`方法，列表 17-11 中直到第 8 行的代码能如期运行。

### 请求审核博文来改变其状态

接下来是请求审核博文，这应当将其状态由 `Draft` 改为 `PendingReview`。我们希望 `post` 有一个获取 `self` 可变引用的公有方法 `request_review`。接着将调用内部存放的状态的 `request_review` 方法，而这第二个 `request_review` 方法会消费当前的状态并返回要一个状态。为了能够消费旧状态，第二个 `request_review` 方法需要能够获取状态值的所有权。这就是 `Option` 的作用：我们将 `take` 字段 `state` 中的 `Some` 值并留下一个 `None` 值，因为 Rust 并不允许结构体中有空字段。接着将博文的 `state` 设置为这个操作的结果。列表 17-15 展示了这些代码：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     state: Option<Box<State>>,
#     content: String,
# }
#
impl Post {
    // ...snip...
    pub fn request_review(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.request_review())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<State>;
}

struct Draft {}

impl State for Draft {
    fn request_review(self: Box<Self>) -> Box<State> {
        Box::new(PendingReview {})
    }
}

struct PendingReview {}

impl State for PendingReview {
    fn request_review(self: Box<Self>) -> Box<State> {
        self
    }
}
```

<span class="caption">列表 17-15: 实现 `Post` 和 `State` trait 的 `request_review` 方法</span>

这里给 `State` trait 增加了 `request_review` 方法；所有实现了这个 trait 的类型现在都需要实现 `request_review` 方法。注意不用于使用`self`、 `&self` 或者 `&mut self` 作为方法的第一个参数，这里使用了 `self: Box<Self>`。这个语法意味着