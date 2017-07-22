## 高级生命周期

> [ch19-02-advanced-lifetimes.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-02-advanced-lifetimes.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

回顾第十章，我们学习了怎样使用生命周期参数来注解引用来帮助 Rust 理解不同引用的生命周期如何相互联系。见识到了大部分情况 Rust 允许我们省略生命周期，不过每一个引用都有一个生命周期。这里有三个生命周期的高级特征我们还未讲到：**生命周期子类型**（*lifetime subtyping*），**生命周期 bound**（*lifetime bounds*），以及**trait 对象生命周期**（*trait object lifetimes*）。

### 生命周期子类型

想象一下我们想要编写一个解析器。为此，会有一个储存了需要解析的字符串的引用的结构体，我们称之为结构体 `Context`。解析器将会解析字符串并返回成功或失败。解析器需要借用 `Context` 来进行解析。其实现看起来像列表 19-12 中的代码，它还不能编译，因为目前我们去掉了生命周期注解：

```rust,ignore
struct Context(&str);

struct Parser {
    context: &Context,
}

impl Parser {
    fn parse(&self) -> Result<(), &str> {
        Err(&self.context.0[1..])
    }
}
```

<span class="caption">列表 19-12：定义结构体 `Context` 来存放一个字符串 slice，结构体 `Parser` 包含一个 `Context` 实例和一个 `parse` 方法，它总是返回一个引用了字符串 slice 的错误</span>

为了简单起见，`parse` 方法返回 `Result<(), &str>`。也就是说，成功时不做任何操作，失败时则返回字符串 slice 没有正确解析的部分。真实的实现将会包含比这更多的错误信息，也将会在解析成功时返回创建的结果，不过我们将去掉这些部分的实现，因为他们与这个例子的生命周期部分并不相关。我们还定义了 `parse` 总是在第一个字节之后返回错误。注意如果第一个字节并不位于一个有效的字符范围内（比如 Unicode）将会 panic；我们有一次简化了例子以专注于涉及到的生命周期。

那么我们如何为 `Context` 中的字符串 slice 和 `Parser` 中 `Context` 的引用放入生命周期参数呢？最直接的方法是在每处都使用相同的生命周期，如列表 19-13 所示：

```rust
struct Context<'a>(&'a str);

struct Parser<'a> {
    context: &'a Context<'a>,
}

impl<'a> Parser<'a> {
    fn parse(&self) -> Result<(), &str> {
        Err(&self.context.0[1..])
    }
}
```

<span class="caption">列表 19-13：将所有 `Context` 和 `Parser` 的引用标注为相同的生命周期参数</span>

这次可以编译了。接下来，在列表 19-14 中，让我们编写一个获取 `Context` 的实例，使用 `Parser` 来解析其内容，并返回 `parse` 的返回值的函数。这还不能运行：

```rust
fn parse_context(context: Context) -> Result<(), &str> {
    Parser { context: &context }.parse()
}
```

<span class="caption">列表 19-14：一个增加获取 `Context` 并使用 `Parser` 的函数 `parse_context` 的尝试</span>

当尝试编译这段额外带有 `parse_context` 函数的代码时会得到两个相当冗长的错误：

```
error: borrowed value does not live long enough
  --> <anon>:16:5
   |
16 |     Parser { context: &context }.parse()
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ does not live long enough
17 | }
   | - temporary value only lives until here
   |
note: borrowed value must be valid for the anonymous lifetime #1 defined on the
body at 15:55...
  --> <anon>:15:56
   |
15 |   fn parse_context(context: Context) -> Result<(), &str> {
   |  ________________________________________________________^
16 | |     Parser { context: &context }.parse()
17 | | }
   | |_^

error: `context` does not live long enough
  --> <anon>:16:24
   |
16 |     Parser { context: &context }.parse()
   |                        ^^^^^^^ does not live long enough
17 | }
   | - borrowed value only lives until here
   |
note: borrowed value must be valid for the anonymous lifetime #1 defined on the
body at 15:55...
  --> <anon>:15:56
   |
15 |   fn parse_context(context: Context) -> Result<(), &str> {
   |  ________________________________________________________^
16 | |     Parser { context: &context }.parse()
17 | | }
   | |_^
```

这些错误表明我们创建的两个 `Parser` 实例和 `context` 参数从 `Parser` 被创建开始一直存活到 `parse_context` 函数结束，不过他们都需要在整个函数的生命周期中都有效。

换句话说，`Parser` 和 `context` 需要比整个函数**长寿**（*outlive*）并在函数开始之前和结束之后都有效以确保代码中的所有引用始终是有效的。虽然两个我们创建的 `Parser` 和 `context` 参数在函数的结尾就离开了作用域（因为 `parse_context` 获取了 `context` 的所有权）。

让我们再次看看列表 19-13 中的定义，特别是 `parse` 方法的签名：

```rust
    fn parse(&self) -> Result<(), &str> {
```

还记得（生命周期）省略规则吗？如果标注了引用生命周期，签名看起来应该是这样：

```rust
    fn parse<'a>(&'a self) -> Result<(), &'a str> {
```

正是如此，`parse` 返回值的错误部分的生命周期与 `Parser` 实例的生命周期（`parse` 方法签名中的 `&self`）相绑定。这就可以理解了，因为返回的字符串 slice 引用了 `Parser` 存放的 `Context` 实例中的字符串 slice，同时在 `Parser` 结构体的定义中我们指定了 `Parser` 中存放的 `Context` 引用的生命周期和 `Context` 中存放的字符串 slice 的生命周期应该一致。

问题是 `parse_context` 函数返回 `parse` 返回值，所以 `parse_context` 返回值的生命周期也与 `Parser` 的生命周期相联系。不过 `parse_context` 函数中创建的 `Parser` 实例并不能存活到函数结束之后（它是临时的），同时 `context` 将会在函数的结尾离开作用域（`parse_context` 获取了它的所有权）。

