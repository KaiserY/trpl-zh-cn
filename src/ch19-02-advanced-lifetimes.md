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

不允许一个在函数结尾离开作用域的值的引用。Rust 认为这是我们想要做的，因为我们将所有生命周期用相同的生命周期参数标记。这告诉了 Rust `Context` 中存放的字符串 slice 的生命周期与 `Parser` 中存放的 `Context` 引用的生命周期一致。

`parse_context` 函数并不知道 `parse` 函数里面是什么，返回的字符串 slice 将比 `Context` 和 `Parser` 都存活的更久，因此 `parse_context` 返回的引用指向字符串 slice，而不是 `Context` 或 `Parser`。

通过了解 `parse` 实现所做的工作，可以知道 `parse` 的返回值（的生命周期）与 `Parser` 相联系的唯一理由是它引用了 `Parser` 的 `Context`，也就是引用了这个字符串 slice，这正是 `parse_context` 所需要关心的生命周期。需要一个方法来告诉 Rust `Context` 中的字符串 slice 与 `Parser` 中 `Context` 的引用有着不同的生命周期，而且 `parse_context` 返回值与 `Context` 中字符串 slice 的生命周期相联系。

我们只能尝试像列表 19-15 那样给予 `Parser` 和 `Context` 不同的生命周期参数。这里选择了生命周期参数名 `'s` 和 `'c` 是为了使得 `Context` 中字符串 slice 与 `Parser` 中 `Context` 引用的生命周期显得更明了（英文首字母）。注意这并不能完全解决问题，不过这是一个开始，我们将看看为什么这还不足以能够编译代码。

```rust
struct Context<'s>(&'s str);

struct Parser<'c, 's> {
    context: &'c Context<'s>,
}

impl<'c, 's> Parser<'c, 's> {
    fn parse(&self) -> Result<(), &'s str> {
        Err(&self.context.0[1..])
    }
}

fn parse_context(context: Context) -> Result<(), &str> {
    Parser { context: &context }.parse()
}
```

<span class="caption">列表 19-15：为字符串 slice 和 `Context` 的引用指定不同的生命周期参数</span>

这里在与列表 19-13 完全相同的地方标注了引用的生命周期，不过根据引用是字符串 slice 或 `Context` 与否使用了不同的参数。另外还在 `parse` 返回值的字符串 slice 部分增加了注解来表明它与 `Context` 中字符串 slice 的生命周期相关联。

这里是现在得到的错误：

```
error[E0491]: in type `&'c Context<'s>`, reference has a longer lifetime than the data it references
 --> src/main.rs:4:5
  |
4 |     context: &'c Context<'s>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^
  |
note: the pointer is valid for the lifetime 'c as defined on the struct at 3:0
 --> src/main.rs:3:1
  |
3 | / struct Parser<'c, 's> {
4 | |     context: &'c Context<'s>,
5 | | }
  | |_^
note: but the referenced data is only valid for the lifetime 's as defined on the struct at 3:0
 --> src/main.rs:3:1
  |
3 | / struct Parser<'c, 's> {
4 | |     context: &'c Context<'s>,
5 | | }
  | |_^
```

Rust 并不知道 `'c` 与 `'s` 之间的任何联系。为了保证有效性，`Context`中引用的带有生命周期 `'s` 的数据需要遵守它比带有生命周期 `'c` 的 `Context` 的引用存活得更久的保证。如果 `'s` 不比 `'c` 更长久，那么 `Context` 的引用可能不再有效。

这就引出了本部分的要点：Rust 有一个叫做**生命周期子类型**的功能，这是一个指定一个生命周期不会短于另一个的方法。在声明生命周期参数的尖括号中，可以照常声明一个生命周期 `'a`，并通过语法 `'b: 'a` 声明一个不短于 `'a` 的生命周期 `'b`。

在 `Parser` 的定义中，为了表明 `'s`（字符串 slice 的生命周期）保证至少与 `'c`（`Context` 引用的生命周期）一样长，需将生命周期声明改为如此：

```rust
# struct Context<'a>(&'a str);
#
struct Parser<'c, 's: 'c> {
    context: &'c Context<'s>,
}
```

现在 `Parser` 中 `Context` 的引用与 `Context` 中字符串 slice 就有了不同的生命周期，并且保证了字符串 slice 的生命周期比 `Context` 引用的要长。

这是一个非常冗长的例子，不过正如本章的开头所提到的，这类功能是很小众的。你并不会经常需要这个语法，不过当出现类似这样的情形时，却还是有地方可以参考的。

### 生命周期 bound

在第十章，我们讨论了如何在泛型类型上使用 trait bound。也可以像泛型那样为生命周期参数增加限制，这被称为**生命周期 bound**。例如，考虑一下一个封装了引用的类型。回忆一下第十五章的 `RefCell<T>` 类型：其 `borrow` 和 `borrow_mut` 方法分别返回 `Ref` 和 `RefMut` 类型。这些类型是引用的封装，他们在运行时记录检查借用规则。`Ref` 结构体的定义如列表 19-16 所示，现在还不带有生命周期 bound：

```rust
struct Ref<'a, T>(&'a T);
```

<span class="caption">列表 19-16：定义结构体来封装泛型的引用；开始时没有生命周期 bound</span>

若不限制生命周期 `'a` 为与泛型参数 `T` 有关，会得到一个错误因为 Rust 不知道泛型 `T` 会存活多久：

```
error[E0309]: the parameter type `T` may not live long enough
 --> <anon>:1:19
  |
1 | struct Ref<'a, T>(&'a T);
  |                   ^^^^^^
  |
  = help: consider adding an explicit lifetime bound `T: 'a`...
note: ...so that the reference type `&'a T` does not outlive the data it points at
 --> <anon>:1:19
  |
1 | struct Ref<'a, T>(&'a T);
  |                   ^^^^^^
```

因为 `T` 可以是任意类型，`T` 自身也可能是一个引用，或者是一个存放了一个或多个引用的类型，而他们各自可能有着不同的生命周期。Rust 不能确认 `T` 会与 `'a` 存活的一样久。

幸运的是，Rust 提供了这个情况下如何指定生命周期 bound 的有用建议：

```
consider adding an explicit lifetime bound `T: 'a` so that the reference type
`&'a T` does not outlive the data it points at.
```

列表 19-17 展示了按照这个建议，在声明泛型 `T` 时指定生命周期 bound。现在代码可以编译了，因为 `T: 'a` 指定了 `T` 可以为任意类型，不过如果它包含任何引用的话，其生命周期必须至少与 `'a` 一样长：

```rust
struct Ref<'a, T: 'a>(&'a T);
```

<span class="caption">列表19-17：为 `T` 增加生命周期 bound 来指定 `T` 中的任何引用需至少与 `'a` 存活的一样久</span>

我们可以选择不同的方法来解决这个问题，如列表 19-18 中展示的 `StaticRef` 结构体定义所示，通过在 `T` 上增加 `'static` 生命周期 bound。这意味着如果 `T` 包含任何引用，他们必须有 `'static` 生命周期：

```rust
struct StaticRef<T: 'static>(&'static T);
```

<span class="caption">列表 19-18：在 `T` 上增加 `'static` 生命周期 bound 来限制 `T` 为只拥有 `'static` 引用或没有引用的类型</span>

没有任何引用的类型被算作 `T: 'static`。因为 `'static` 意味着引用必须同整个程序存活的一样长，一个不包含引用的类型满足所有引用都与程序存活的一样长的标准（因为他们没有引用）。可以这样理解：如果借用检查器关心的是引用是否存活的够久，那么没有引用的类型与有永远存在的引用的类型并没有真正的区别；对于确定引用是否比其所引用的值存活得较短的目的来说两者是一样的。

### trait 对象生命周期

在第十七章，我们学习了 trait 对象，其中介绍了可以把一个 trait 放在一个引用后面来进行动态分发。然而，我们并没有讨论如果 trait 对象中实现 trait 的类型带有生命周期时会发生什么。考虑一下 19-19，这里有 trait `Foo`，和带有一个实现了 trait `Foo` 的引用（因此还有其生命周期参数）的结构体 `Bar`，我们希望使用 `Bar` 的实例作为 trait 对象 `Box<Foo>`：

```rust
trait Foo { }

struct Bar<'a> {
    x: &'a i32,
}

impl<'a> Foo for Bar<'a> { }

let num = 5;

let obj = Box::new(Bar { x: &num }) as Box<Foo>;
```

<span class="caption">列表 19-19：使用一个带有生命周期的类型作为 trait 对象</span>

这些代码能没有任何错误的编译，即便并没有明确指出 `obj` 中涉及的任何生命周期。这是因为有如下生命周期与 trait 对象必须遵守的规则：

* trait 对象的默认生命周期是 `'static`。
* 如果有 `&'a X` 或 `&'a mut X`，则默认（生命周期）是 `'a`。
* 如果只有 `T: 'a`， 则默认是 `'a`。
* 如果有多个类似 `T: 'a` 的从句，则没有默认值；必须明确指定。

当必须明确指定时，可以为像 `Box<Foo>` 这样的 trait 对象增加生命周期 bound，根据需要使用语法 `Box<Foo + 'a>` 或 `Box<Foo + 'static>`。正如其他的 bound，这意味着任何 `Foo` trait 的实现如果在内部包含有引用, 就必须在 trait 对象 bounds 中为那些引用指定生命周期。

接下来，让我们看看一些其他处理 trait 的功能吧！
