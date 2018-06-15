## 面向对象设计模式的实现

> [ch17-03-oo-design-patterns.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-03-oo-design-patterns.md)
> <br>
> commit b18f90970ab7223ee8af18ef466a5ba6ff8482ef

**状态模式**（*state pattern*）是一个面向对象设计模式。该模式的关键在于一个值有某些内部状态，体现为一系列的 **状态对象**，同时值的行为随着其内部状态而改变。状态对象共享功能 —— 当然，在 Rust 中使用结构体和 trait 而不是对象和继承。每一个状态对象代表负责其自身的行为和当需要改变为另一个状态时的规则的状态。持有任何一个这种状态对象的值对于不同状态的行为以及何时状态转移毫不知情。

<!-- Below -- requirements for what, for what we need the value for? -->
<!-- I've clarified /Carol -->

使用状态模式意味着当程序的业务需求改变时，无需改变值持有状态或者使用值的代码。我们只需更新某个状态对象中的代码来改变其规则，或者是增加更多的状态对象。让我们看看一个有关状态模式和如何在 Rust 中使用它的例子。


让我们看看一个状态设计模式的例子以及如何在 Rust 中使用他们。**状态模式**（*state pattern*）是指一个值有某些内部状态，而它的行为随着其内部状态而改变。内部状态由一系列继承了共享功能的对象表现（我们使用结构体和 trait 因为 Rust 没有对象和继承）。每一个状态对象负责它自身的行为和当需要改变为另一个状态时的规则。持有任何一个这种状态对象的值对于不同状态的行为以及何时状态转移毫不知情。当将来需求改变时，无需改变值持有状态或者使用值的代码。我们只需更新某个状态对象中的代码来改变它的规则，或者是增加更多的状态对象。

为了探索这个概念，我们将实现一个增量式的发布博文的工作流。这个博客的最终功能看起来像这样：

1. 博文从空白的草案开始。
2. 一旦草案完成，请求审核博文。
3. 一旦博文过审，它将被发表。
4. 只有被发表的博文的内容会被打印，这样就不会意外打印出没有被审核的博文的文本。

任何其他对博文的修改尝试都是没有作用的。例如，如果尝试在请求审核之前通过一个草案博文，博文应该保持未发布的状态。

示例 17-11 展示这个工作流的代码形式。这是一个我们将要在一个叫做 `blog` 的库 crate 中实现的 API 的示例：

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

<span class="caption">示例 17-11: 展示了 `blog` crate 期望行为的代码</span>

我们希望允许用户使用 `Post::new` 创建一个新的博文草案。接着希望能在草案阶段为博文编写一些文本。如果尝试在审核之前立即打印出博文的内容，什么也不会发生因为博文仍然是草案。这里增加的 `assert_eq!` 出于演示目的。一个好的单元测试将是断言草案博文的 `content` 方法返回空字符串，不过我们并不准备为这个例子编写单元测试。

接下来，我们希望能够请求审核博文，而在等待审核的阶段 `content` 应该仍然返回空字符串。最后当博文审核通过，它应该被发表，这意味着当调用 `content` 时博文的文本将被返回。


<!-- Below -- so this is where we'll implement the state pattern? If so, can
you make that explicit, just to be clear! I've added some text to the second
line, not sure if that's accurate though -->
<!-- Yes, the state pattern will be implemented within the `Post` type. I've
tweaked the wording a bit but you've pretty much got it! /Carol-->

注意我们与 crate 交互的唯一的类型是 `Post`。这个类型会使用状态模式并会存放处于三种博文所可能的状态之一的值 —— 草案，等待审核和发布。状态上的改变由 `Post` 类型内部进行管理。状态依库用户对 `Post` 实例调用的方法而改变，但是不能直接管理状态变化。这也意味着用户不会在状态上犯错，比如在过审前发布博文。

### 定义 `Post` 并新建一个草案状态的实例

让我们开始实现这个库吧！我们知道需要一个公有 `Post` 结构体来存放一些文本，所以让我们从结构体的定义和一个创建 `Post` 实例的公有关联函数 `new` 开始，如示例 17-12 所示。还需定义一个私有 trait `State`。`Post` 将在私有字段 `state` 中存放一个 `Option` 类型的 trait 对象 `Box<State>`。稍后将会看到为何 `Option` 是必须的。

`State` trait 定义了所有不同状态的博文所共享的行为，同时 `Draft`、`PendingReview` 和 `Published` 状态都会实现 `State` 状态。现在这个 trait 并没有任何方法，同时开始将只定义 `Draft` 状态因为这是我们希望博文的初始状态：

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

<span class="caption">示例 17-12: `Post` 结构体的定义和新建 `Post` 实例的  `new` 函数，`State` trait 和结构体 `Draft`</span>

当创建新的 `Post` 时，我们将其 `state` 字段设置为一个存放了 `Box` 的 `Some` 值。这个 `Box` 指向一个 `Draft` 结构体新实例。这确保了无论何时新建一个 `Post` 实例，它都会从草案开始。因为 `Post` 的 `state` 字段是私有的，也就无法创建任何其他状态的 `Post` 了！。

### 存放博文内容的文本

在 `Post::new` 函数中，我们设置 `content` 字段为新的空 `String`。在示例 17-11 中，展示了我们希望能够调用一个叫做 `add_text` 的方法并向其传递一个 `&str` 来将文本增加到博文的内容中。选择实现为一个方法而不是将 `content` 字段暴露为 `pub` 。这意味着之后可以实现一个方法来控制 `content` 字段如何被读取。`add_text` 方法是非常直观的，让我们在示例 17-13 的 `impl Post` 块中增加一个实现：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String,
# }
#
impl Post {
    // --snip--
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

<span class="caption">示例 17-13: 实现方法 `add_text` 来向博文的 `content` 增加文本</span>

`add_text` 获取一个 `self` 的可变引用，因为需要改变调用 `add_text` 的 `Post` 实例。接着调用 `content` 中的 `String` 的 `push_str` 并传递 `text` 参数来保存到 `content` 中。这不是状态模式的一部分，因为它的行为并不依赖博文所处的状态。`add_text` 方法完全不与 `state` 状态交互，不过这是我们希望支持的行为的一部分。

### 博文草案的内容是空的

即使调用 `add_text` 并向博文增加一些内容之后，我们仍然希望 `content` 方法返回一个空字符串 slice，因为博文仍然处于草案状态，如示例 17-11 的第 8 行所示。现在让我们使用能满足要求的最简单的方式来实现 `content` 方法：总是返回一个空字符串 slice。当实现了将博文状态改为发布的能力之后将改变这一做法。但是目前博文只能是草案状态，这意味着其内容应该总是空的。示例 17-14 展示了这个占位符实现：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String,
# }
#
impl Post {
    // --snip--
    pub fn content(&self) -> &str {
        ""
    }
}
```

<span class="caption">列表 17-14: 增加一个 `Post` 的 `content` 方法的占位实现，它总是返回一个空字符串 slice</span>

通过增加这个 `content`方法，示例 17-11 中直到第 8 行的代码能如期运行。

### 请求审核博文来改变其状态

接下来需要增加请求审核博文的功能，这应当将其状态由 `Draft` 改为 `PendingReview`。我们希望为 `Post` 增加一个获取 `self` 可变引用的公有方法 `request_review`。接着将 `Post` 当前状态内部的 `request_review` 方法而这第二个 `request_review` 方法会消费当前的状态并返回一个新状态。示例 17-15 展示了这个代码：

<!-- NOTE TO DE/AU: We might want to move this explanation to after the code if
you want to add wingdings, we can see once we transfer it to Word -->
<!-- I decided to move some of this explanation after the code for this reason
and because we got some questions about this example that I wanted to expand
upon /Carol -->

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     state: Option<Box<State>>,
#     content: String,
# }
#
impl Post {
    // --snip--
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

<span class="caption">示例 17-15: 实现 `Post` 和 `State` trait 的 `request_review` 方法</span>

这里给 `State` trait 增加了 `request_review` 方法；所有实现了这个 trait 的类型现在都需要实现 `request_review` 方法。注意不同于使用 `self`、 `&self` 或者 `&mut self` 作为方法的第一个参数，这里使用了 `self: Box<Self>`。这个语法意味着这个方法调用只对这个类型的 `Box` 有效。这个语法获取了 `Box<Self>` 的所有权，使老状态无效化以便 `Post` 的状态值可以将自身转换为新状态。

<!-- Above -- so Post can transform, or so Draft can transform? -->
<!-- Technically it's so the Draft value can transform into another value,
which changes the state of Post-- I've tried to clarify. /Carol -->

为了消费老状态，`request_review` 方法需要获取状态值的所有权。这也就是 `Post` 的 `state` 字段中 `Option` 的来历：调用 `take` 方法将 `state` 字段中的 `Some` 值取出并留下一个 `None`，因为 Rust 不允许在结构体中存在空的字段。这使得我们将 `state` 值移动出 `Post` 而不是借用它。接着将博文的 `state` 值设置为这个操作的结果。

这里需要将 `state` 临时设置为 `None`，不同于像 `self.state = self.state.request_review();` 这样的代码直接设置 `state` 字段，来获取 `state` 值的所有权。这确保了当 `Post` 被转换为新状态后其不再能使用老的 `state` 值。

`Draft` 的方法 `request_review` 的实现返回一个新的，装箱的 `PendingReview` 结构体的实例，其用来代表博文处于等待审核状态。结构体 `PendingReview` 同样也实现了 `request_review` 方法，不过它不进行任何状态转换。相反它返回自身，因为请求审核已经处于 `PendingReview` 状态的博文应该保持 `PendingReview` 状态。

现在开始能够看出状态模式的优势了：`Post` 的 `request_review` 方法无论 `state` 是何值都是一样的。每个状态只负责它自己的规则。

我们将继续保持 `Post` 的 `content` 方法不变，返回一个空字符串 slice。现在可以拥有 `PendingReview` 状态而不仅仅是 `Draft` 状态的 `Post` 了，不过我们希望在 `PendingReview` 状态下其也有相同的行为。现在示例 17-11 中直到 11 行的代码是可以执行的！

### 增加改变 `content` 行为的 `approve` 方法

`approve` 方法将与 `request_review` 方法类似：它会将 `state` 设置为审核通过时应处于的状态，如示例 17-16 所示。

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     state: Option<Box<State>>,
#     content: String,
# }
#
impl Post {
    // --snip--
    pub fn approve(&mut self) {
        if let Some(s) = self.state.take() {
            self.state = Some(s.approve())
        }
    }
}

trait State {
    fn request_review(self: Box<Self>) -> Box<State>;
    fn approve(self: Box<Self>) -> Box<State>;
}

struct Draft {}

impl State for Draft {
#     fn request_review(self: Box<Self>) -> Box<State> {
#         Box::new(PendingReview {})
#     }
#
    // --snip--
    fn approve(self: Box<Self>) -> Box<State> {
        self
    }
}

struct PendingReview {}

impl State for PendingReview {
#     fn request_review(self: Box<Self>) -> Box<State> {
#         self
#     }
#
    // --snip--
    fn approve(self: Box<Self>) -> Box<State> {
        Box::new(Published {})
    }
}

struct Published {}

impl State for Published {
    fn request_review(self: Box<Self>) -> Box<State> {
        self
    }

    fn approve(self: Box<Self>) -> Box<State> {
        self
    }
}
```

<span class="caption">示例 17-16: 为 `Post` 和 `State` trait 实现 `approve` 方法</span>

这里为 `State` trait 增加了 `approve` 方法，并新增了一个实现了 `State` 的结构体，`Published` 状态。

类似于 `request_review`，如果对 `Draft` 调用 `approve` 方法，并没有任何效果，因为它会返回 `self`。当对 `PendingReview` 调用 `approve` 时，它返回一个新的、装箱的 `Published` 结构体的实例。`Published` 结构体实现了 `State` trait，同时对于 `request_review` 和 `approve` 两方法来说，它返回自身，因为在这两种情况博文应该保持 `Published` 状态。

现在更新 `Post` 的 `content` 方法：如果状态为 `Published` 希望返回博文 `content` 字段的值；否则希望返回空字符串 slice，如示例 17-17 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# trait State {
#     fn content<'a>(&self, post: &'a Post) -> &'a str;
# }
# pub struct Post {
#     state: Option<Box<State>>,
#     content: String,
# }
#
impl Post {
    // --snip--
    pub fn content(&self) -> &str {
        self.state.as_ref().unwrap().content(&self)
    }
    // --snip--
}
```

<span class="caption">示例 17-17: 更新 `Post` 的 `content` 方法来委托调用 `State` 的`content` 方法</span>

因为目标是将所有像这样的规则保持在实现了 `State` 的结构体中，我们将调用 `state` 中的值的 `content` 方法并传递博文实例（也就是 `self`）作为参数。接着返回 `state` 值的 `content` 方法的返回值。

这里调用 `Option` 的 `as_ref` 方法是因为需要 `Option` 中值的引用而不是获取其所有权。因为 `state` 是一个 `Option<Box<State>>`，调用 `as_ref` 会返回一个 `Option<&Box<State>>`。如果不调用 `as_ref`，怎会得到一个错误，因为不能将 `state` 移动出借用的 `&self` 函数参数。

接着调用 `unwrap` 方法，这里我们知道它永远也不会 panic，因为 `Post` 的所有方法都确保在他们返回时 `state` 会有一个 `Some` 值。这就是一个第十二章讨论过的我们知道 `None` 是不可能的而编译器却不能理解的情况。

接着我们就有了一个 `&Box<State>`，当调用其 `content` 时，解引用强制多态会作用于 `&` 和 `Box` 这样最终会调用实现了 `State` trait 的类型的 `content` 方法。

这意味着需要为 `State` trait 定义增加 `content`，这也是放置根据所处状态返回什么内容的逻辑的地方，如示例 17-18 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String
# }
trait State {
    // --snip--
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        ""
    }
}

// --snip--
struct Published {}

impl State for Published {
    // --snip--
    fn content<'a>(&self, post: &'a Post) -> &'a str {
        &post.content
    }
}
```

<span class="caption">示例 17-18: 为 `State` trait 增加 `content` 方法</span>

这里增加了一个 `content` 方法的默认实现来返回一个空字符串 slice。这意味着无需为 `Draft` 和 `PendingReview` 结构体实现 `content` 了。`Published` 结构体会覆盖 `content` 方法并会返回 `post.content` 的值。


注意这个方法需要生命周期注解，如第十章所讨论的。这里获取 `post` 的引用作为参数，并返回 `post` 一部分的引用，所以返回的引用的生命周期与 `post` 参数相关。

<!-- Is this it finished, without the touch up we make to get rid of the empty
string? That's pretty awesome coding, maybe give it some ceremony here. Does
all of 17-11 now work? -->
<!-- Yep! Good point, so added! /Carol -->

现在示例完成了 ———— 现在示例 17-11 中所有的代码都能工作！我们通过发布博文工作流的规则实现了状态模式。围绕这些规则的逻辑都存在于状态对象中而不是分散在 `Post` 之中。

### 状态模式的权衡取舍

我们展示了 Rust 是能够实现面向对象的状态模式的，以便能根据博文所处的状态来封装不同类型的行为。`Post` 的方法并不知道这些不同类型的行为。通过这种组织代码的方式，为了找到所有已发布的博文不同行为只需查看一处代码：`Published` 的 `State` trait 的实现。

如果要创建一个不使用状态模式的替代实现，则可能会在 `Post` 的方法中，或者甚至于在 `main` 代码中用到 `match` 语句，来检查博文状态并在这里改变其行为。这意味着需要查看很多位置来理解处于发布状态的博文的所有逻辑！这在增加更多状态时会变得更糟：每一个 `match` 语句都会需要另一个分支。

对于状态模式来说，`Post` 的方法和使用 `Post` 的位置无需 `match` 语句，同时增加新状态只涉及到增加一个新 `struct` 和为其实现 trait 的方法。

这个实现易于扩展增加更多功能。为了体会使用此模式维护代码的简洁性，请尝试如下一些建议：

- 只允许博文处于 `Draft` 状态时增加文本内容
- 增加 `reject` 方法将博文的状态从 `PendingReview` 变回 `Draft`
- 在将状态变为 `Published` 之前需要两次 `approve` 调用

状态模式的一个缺点是因为状态实现了状态之间的转换，一些状态会相互联系。如果在 `PendingReview` 和 `Published` 之间增加另一个状态，比如 `Scheduled`，则不得不修改 `PendingReview` 中的代码来转移到 `Scheduled`。如果 `PendingReview` 无需因为新增的状态而改变就更好了，不过这意味着切换到另一种设计模式。

另一个缺点是我们会发现一些重复的逻辑。为了消除他们，可以尝试为 `State` trait 中返回 `self` 的 `request_review` 和 `approve` 方法增加默认实现，不过这会违反对象安全性，因为 trait 不知道 `self` 具体是什么。我们希望能够将 `State` 作为一个 trait 对象，所以需要其方法是对象安全的。

另一个重复是 `Post` 中 `request_review` 和 `approve` 这两个类似的实现。他们都委托调用了 `state` 字段中 `Option` 值的同一方法，并在结果中为 `state` 字段设置了新值。如果 `Post` 中的很多方法都遵循这个模式，我们可能会考虑定义一个宏来消除重复（查看附录 D 以了解宏）。

完全按照面向对象语言的定义实现这个模式并没有没有尽可能的利用 Rust 的优势。让我们看看一些代码中可以做出的修改，来将无效的状态和状态转移变为编译时错误。

#### 将状态和行为编码为类型

我们将展示如何稍微反思状态模式来进行一系列不同的权衡取舍。不同于完全封装状态和状态转移使得外部代码对其毫不知情，我们将状态编码进不同的类型。如此，Rust 的类型检查就会将任何在只能使用发布博文的地方使用草案博文的尝试变为编译时错误。

让我们考虑一下示例 17-11 中 `main` 的第一部分：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");
    assert_eq!("", post.content());
}
```

我们仍然希望能够使用 `Post::new` 创建一个新的草案博文，并能够增加博文的内容。不过不同于存在一个草案博文时返回空字符串的 `content` 方法，我们将使草案博文完全没有 `content` 方法。这样如果尝试获取草案博文的内容，将会得到一个方法不存在的编译错误。这使得我们不可能在生产环境意外显示出草案博文的内容，因为这样的代码甚至就不能编译。示例 17-19 展示了 `Post` 结构体、`DraftPost` 结构体以及各自的方法的定义：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct Post {
    content: String,
}

pub struct DraftPost {
    content: String,
}

impl Post {
    pub fn new() -> DraftPost {
        DraftPost {
            content: String::new(),
        }
    }

    pub fn content(&self) -> &str {
       &self.content
    }
}

impl DraftPost {
    pub fn add_text(&mut self, text: &str) {
        self.content.push_str(text);
    }
}
```

<span class="caption">示例 17-19: 带有 `content` 方法的 `Post` 和没有 `content` 方法的 `DraftPost`</span>

`Post` 和 `DraftPost` 结构体都有一个私有的 `content` 字段来储存博文的文本。这些结构体不再有 `state` 字段因为我们将类型编码为结构体的类型。`Post` 将代表发布的博文，它有一个返回 `content` 的 `content` 方法。

仍然有一个 `Post::new` 函数，不过不同于返回 `Post` 实例，它返回 `DraftPost` 的实例。现在不可能创建一个 `Post` 实例，因为 `content` 是私有的同时没有任何函数返回 `Post`。

`DraftPost` 上定义了一个 `add_text` 方法，这样就可以像之前那样向 `content` 增加文本，不过注意 `DraftPost` 并没有定义 `content` 方法！如此现在程序确保了所有博文都从草案开始，同时草案博文没有任何可供展示的内容。任何绕过这些限制的尝试都会产生编译错误。

#### 实现状态转移为不同类型的转换

那么如何得到发布的博文呢？我们希望强制执行的规则是草案博文在可以发布之前必须被审核通过。等待审核状态的博文应该仍然不会显示任何内容。让我们通过增加另一个结构体 `PendingReviewPost` 来实现这个限制，在 `DraftPost` 上定义 `request_review` 方法来返回 `PendingReviewPost`，并在 `PendingReviewPost` 上定义 `approve` 方法来返回 `Post`，如示例 17-20 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Post {
#     content: String,
# }
#
# pub struct DraftPost {
#     content: String,
# }
#
impl DraftPost {
    // --snip--

    pub fn request_review(self) -> PendingReviewPost {
        PendingReviewPost {
            content: self.content,
        }
    }
}

pub struct PendingReviewPost {
    content: String,
}

impl PendingReviewPost {
    pub fn approve(self) -> Post {
        Post {
            content: self.content,
        }
    }
}
```

<span class="caption">列表 17-20: `PendingReviewPost` 通过调用 `DraftPost` 的 `request_review` 创建，`approve` 方法将 `PendingReviewPost` 变为发布的 `Post`</span>

`request_review` 和 `approve` 方法获取 `self` 的所有权，因此会消费 `DraftPost` 和 `PendingReviewPost` 实例，并分别转换为 `PendingReviewPost` 和发布的 `Post`。这样在调用 `request_review` 之后就不会遗留任何 `DraftPost` 实例，后者同理。`PendingReviewPost` 并没有定义 `content` 方法，所以尝试读取其内容会导致编译错误，`DraftPost` 同理。因为唯一得到定义了 `content` 方法的 `Post` 实例的途径是调用 `PendingReviewPost` 的 `approve` 方法，而得到 `PendingReviewPost` 的唯一办法是调用 `DraftPost` 的 `request_review` 方法，现在我们就将发博文的工作流编码进了类型系统。

这也意味着不得不对 `main` 做出一些小的修改。因为 `request_review` 和 `approve` 返回新实例而不是修改被调用的结构体，所以我们需要增加更多的 `let post = ` 覆盖赋值来保存返回的实例。也不再能断言草案和等待审核的博文的内容为空字符串了，我们也不再需要他们：不能编译尝试使用这些状态下博文内容的代码。更新后的 `main` 的代码如示例 17-21 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
extern crate blog;
use blog::Post;

fn main() {
    let mut post = Post::new();

    post.add_text("I ate a salad for lunch today");

    let post = post.request_review();

    let post = post.approve();

    assert_eq!("I ate a salad for lunch today", post.content());
}
```

<span class="caption">示例 17-21: `main` 中使用新的博文工作流实现的修改</span>

不得不修改 `main` 来重新赋值 `post` 使得这个实现不再完全遵守面向对象的状态模式：状态间的转换不再完全封装在 `Post` 实现中。然而，得益于类型系统和编译时类型检查我们得到了不可能拥有无效状态的属性！这确保了特定的 bug，比如显示未发布博文的内容，将在部署到生产环境之前被发现。

尝试在这一部分开始所建议的增加额外需求的任务来体会使用这个版本的代码是何感觉。

即便 Rust 能够实现面向对象设计模式，也有其他像将状态编码进类型这样的模式存在。这些模式有着不同的权衡取舍。虽然你可能非常熟悉面向对象模式，重新思考这些问题来利用 Rust 提供的像在编译时避免一些 bug 这样有益功能。在 Rust 中面向对象模式并不总是最好的解决方案，因为 Rust 拥有像所有权这样的面向对象语言所没有的功能。

## 总结

阅读本章后，不管你是否认为 Rust 是一个面向对象语言，现在你都见识了 trait 对象是一个 Rust 中获取部分面向对象功能的方法。动态分发可以通过牺牲少量运行时性能来为你的代码提供一些灵活性。这些灵活性可以用来实现有助于代码可维护性的面向对象模式。Rust 也有像所有权这样不同于面向对象语言的功能。面向对象模式并不总是利用 Rust 实力的最好方式，但也是可用的选项。

接下来，让我们看看另一个提供了多样灵活性的 Rust 功能：模式。贯穿全书的模式, 我们已经和它们打过照面了，但并没有见识过它们的全部本领。让我们开始探索吧！
