## 高级生命周期

回到第10章, 我们学习了如何用生命周期注解引用参数来帮助 Rust 理解不同的引用所关联的生命周期. 我们看到大多数时候, Rust 都会让你忽略生命周期, 但是每个引用都有一个生命周期. 还有三个关于生命周期的高级特性我们以前没有介绍, 它们是: *生命周期子类型(lifetime subtyping)*, *生命周期绑定(lifetime
bounds)*, 和 *trait 对象生命周期*.

### 生命周期子类型

想象一下我们想写一个解释器. 为此, 我们需要一个持有即将被解析的字符串的引用的结构, 我们把这个结构叫做`Context`. 我们将写一个能够解析这个字符串并返回成功或失败的解析器. 该解析器需要借用这个上下文(解析器中的`context`属性)来完成解析. 实现这个功能的代码如例 19-12, 但是这个代码不能被编译因为我们没有使用生命周期注解:

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

<span class="caption">例19-12: 定义持有一个字符串切片的`Context`结构, 一个持有某个`Context`实例引用的`Parser`结构, 和一个总是返回一个错误的`parse`方法, 这个被返回的错误引用了该字符串切片</span>

为了简单起见, 我们的`parse`函数返回一个`Result<(), &str>`. 也就是说, 我们在成功时不做任何事情, 在失败时我们返回部分没有解析正确的字符串切片. 一个真正的实现将会有更多的错误信息, 而且实际上在解析成功时会返回当时创建的内容, 但是我们将实现的这部分省略了因为它们与本例的生命周期无关. 我们也定义`parse`总在第一个字节后产生一个错误. 请注意如果第一个字节不在有效的字符边界内这可能会出现错误; 再说一下, 为了把注意力放在生命周期上, 我们简化了这个例子.

那么我们如何设置`Context`中的字符串切片的生命周期参数和`Parser`中的`Context`引用呢? 最直接的办法就是使用同样的生命周期, 如例19-13所示:

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

<span class="caption">例19-13: 限定`Context`和`Parser`中的所有引用具有同样的生命周期参数</span>

这样就能够编译了. 然后, 在例19-14中, 让我们写一个以`Context`实例为参数的函数, 该函数用一个`Parser`来解析那个`Context`实例并把`parse`方法的结果直接返回. 但是这个代码不能正常工作:

```rust,ignore
fn parse_context(context: Context) -> Result<(), &str> {
    Parser { context: &context }.parse()
}
```

<span class="caption">例19-14: 尝试添加有一个`parse_context`函数, 该函数有一个`Context`参数, 在函数中使用了`Parser`</span>

当我们试图用新添加的`parse_context`函数来编译代码时我们会得到两个相当详细的错误:

```text
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

这些错误表明不管是我们创建的`Parser`实例还是作用于从`Parser`被创建的行开始到`parse_context`函数结束的`context`参数, 都需要拥有整个函数的生命周期.

换句话说, `Parser`和`context`存活的时间要比整个函数更长, 为了让代码中的所有引用都有效它们也应该在函数被调用前后都有效. 不管是我们正创建的`Parser`还是在函数结束时就会结束作用域的`context`参数都是如此(因为`parse_context`函数会获得`context`的所有权).

让我们再看一下例19-13中的定义, 特别是`parse`方法的声明:

```rust,ignore
    fn parse(&self) -> Result<(), &str> {
```

还记得生命周期的省略规则吗? 如果我们注解引用的生命周期, 那么可以这样写:

```rust,ignore
    fn parse<'a>(&'a self) -> Result<(), &'a str> {
```

也就是说, `parse`函数返回值的错误中的部分是因为它有一个生命周期被绑定到了`Parser`实例的生命周期上面(也就是`parse`方法中的`&self`). 这就是了, 因为被返回的字符串切片引用了`Parser`持有的`Context`实例中的字符串切片, 并且我们已经在`Parser`结构的定义中指定了`Parser`中的`Context`的引用的生命周期和`Context`持有的字符串切片的生命周期是一样的.

问题是`parse_context`函数要返回`parse`方法的返回值, 这样`parse_context`的返回值的生命周期也就被绑定到了`Parser`的生命周期上了. 但是在`parse_context`函数中创建的`Parser`实例在函数结束后就不会存活了(它是临时的), 并且`context`在函数结束后也会越过作用域(`parse_context`拥有它的所有权).

我们不能返回只在函数作用域内才能存活的值的引用. Rust就认为我们在做这个事情, 因为我们把所有的生命周期参数都注解成一样的了. 这就告诉 Rust `Context`持有的字符串切片的生命周期和`Parser`持有的`Context`引用的生命周期是一样的.

`parse_context`函数看不到`parse`函数中的东西, 被返回的字符串切片的存活时间将比`Context`和`Parser`更长, 并且`parse_context`返回的是字符串切片的引用而不是`Context`和`Parser`的引用.

通过了解`parse`的实现, 我们明白了`parse`的返回值被绑定到`Parser`的唯一原因是因为它引用了`Prser`中的`Context`, 也就是对一个字符串切片的引用, 所以它的生命周期才是`parse_context`需要关心的字符串切片的真正的生命周期. 我们需要告诉 Rust 在`Context`中的字符串切片和对`Parser`中的`Context`的引用有不同的生命周期, 我们还要告诉 Rust `parse_context` 函数的返回值被绑定到了`Context`中的字符串切片的生命周期.

我们可以尝试像例 19-15 中显示的那样只给`Parser`和`Context`不同的生命周期参数. 我们选择了生命周期参数`'s`和`'c`, 这样可以很方便的区分哪个生命周期伴随`Context`中的字符串切片, 哪个生命周期伴随`Parser`中的`Context`引用. 注意这还不能完全修正问题, 但这是一个开始, 编译时我们就会明白为什么它还不够.

```rust,ignore
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

<span class="caption">例19-15: 给对字符串切片和对`Context`的引用指定不同的生命周期参数</span>

We've annotated the lifetimes of the references in all the same places that we
annotated them in Listing 19-13, but used different parameters depending on
whether the reference goes with the string slice or with `Context`. We've also
added an annotation to the string slice part of the return value of `parse` to
indicate that it goes with the lifetime of the string slice in `Context`.

Here's the error we get now:

```text
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

Rust doesn't know of any relationship between `'c` and `'s`. In order to be
valid, the referenced data in `Context` with lifetime `'s` needs to be
constrained to guarantee that it lives longer than the reference to `Context`
that has lifetime `'c`. If `'s` is not longer than `'c`, then the reference to
`Context` might not be valid.

Which gets us to the point of this section: Rust has a feature called *lifetime
subtyping*, which is a way to specify that one lifetime parameter lives at
least as long as another one. In the angle brackets where we declare lifetime
parameters, we can declare a lifetime `'a` as usual, and declare a lifetime
`'b` that lives at least as long as `'a` by declaring `'b` with the syntax `'b:
'a`.

In our definition of `Parser`, in order to say that `'s` (the lifetime of the
string slice) is guaranteed to live at least as long as `'c` (the lifetime of
the reference to `Context`), we change the lifetime declarations to look like
this:

```rust
# struct Context<'a>(&'a str);
#
struct Parser<'c, 's: 'c> {
    context: &'c Context<'s>,
}
```

Now, the reference to `Context` in the `Parser` and the reference to the string
slice in the `Context` have different lifetimes, and we've ensured that the
lifetime of the string slice is longer than the reference to the `Context`.

That was a very long-winded example, but as we mentioned at the start of this
chapter, these features are pretty niche. You won't often need this syntax, but
it can come up in situations like this one, where you need to refer to
something you have a reference to.

### Lifetime Bounds

In Chapter 10, we discussed how to use trait bounds on generic types. We can
also add lifetime parameters as constraints on generic types. For example,
let's say we wanted to make a wrapper over references. Remember `RefCell<T>`
from Chapter 15? This is how the `borrow` and `borrow_mut` methods work; they
return wrappers over references in order to keep track of the borrowing rules
at runtime. The struct definition, without lifetime parameters for now, would
look like Listing 19-16:

```rust,ignore
struct Ref<T>(&T);
```

<span class="caption">Listing 19-16: Defining a struct to wrap a reference to a
generic type; without lifetime parameters to start</span>

However, using no lifetime bounds at all gives an error because Rust doesn't
know how long the generic type `T` will live:

```text
error[E0309]: the parameter type `T` may not live long enough
 --> <anon>:2:19
  |
2 | struct Ref<'a, T>(&'a T);
  |                   ^^^^^^
  |
  = help: consider adding an explicit lifetime bound `T: 'a`...
note: ...so that the reference type `&'a T` does not outlive the data it points at
 --> <anon>:2:19
  |
2 | struct Ref<'a, T>(&'a T);
  |                   ^^^^^^
```

This is the same error that we'd get if we filled in `T` with a concrete type,
like `struct Ref(&i32)`; all references in struct definitions need a lifetime
parameter. However, because we have a generic type parameter, we can't add a
lifetime parameter in the same way. Defining `Ref` as `struct Ref<'a>(&'a T)`
will result in an error because Rust can't determine that `T` lives long
enough. Since `T` can be any type, `T` could itself be a reference or it could
be a type that holds one or more references, each of which have their own
lifetimes.

Rust helpfully gave us good advice on how to specify the lifetime parameter in
this case:

```text
consider adding an explicit lifetime bound `T: 'a` so that the reference type
`&'a T` does not outlive the data it points to.
```

The code in Listing 19-17 works because `T: 'a` syntax specifies that `T` can
be any type, but if it contains any references, `T` must live as long as `'a`:

```rust
struct Ref<'a, T: 'a>(&'a T);
```

<span class="caption">Listing 19-17: Adding lifetime bounds on `T` to specify
that any references in `T` live at least as long as `'a`</span>

We could choose to solve this in a different way as shown in Listing 19-18 by
bounding `T` on `'static`. This means if `T` contains any references, they must
have the `'static` lifetime:

```rust
struct StaticRef<T: 'static>(&'static T);
```

<span class="caption">Listing 19-18: Adding a `'static` lifetime bound to `T`
to constrain `T` to types that have only `'static` references or no
references</span>

Types with no references count as `T: 'static`. Because `'static` means the
reference must live as long as the entire program, a type that contains no
references meets the criteria of all references living as long as the entire
program (since there are no references). Think of it this way: if the borrow
checker is concerned about references living long enough, then there's no real
distinction between a type that has no references and a type that has
references that live forever; both of them are the same for the purpose of
determining whether or not a reference has a shorter lifetime than what it
refers to.

### Trait Object Lifetimes

In Chapter 17, we learned about trait objects that consist of putting a trait
behind a reference in order to use dynamic dispatch. However, we didn't discuss
what happens if the type implementing the trait used in the trait object has a
lifetime. Consider Listing 19-19, where we have a trait `Foo` and a struct
`Bar` that holds a reference (and thus has a lifetime parameter) that
implements trait `Foo`, and we want to use an instance of `Bar` as the trait
object `Box<Foo>`:

```rust
trait Foo { }

struct Bar<'a> {
    x: &'a i32,
}

impl<'a> Foo for Bar<'a> { }

let num = 5;

let obj = Box::new(Bar { x: &num }) as Box<Foo>;
```

<span class="caption">Listing 19-19: Using a type that has a lifetime parameter
with a trait object</span>

This code compiles without any errors, even though we haven't said anything
about the lifetimes involved in `obj`. This works because there are rules
having to do with lifetimes and trait objects:

* The default lifetime of a trait object is `'static`.
* If we have `&'a X` or `&'a mut X`, then the default is `'a`.
* If we have a single `T: 'a` clause, then the default is `'a`.
* If we have multiple `T: 'a`-like clauses, then there is no default; we must
  be explicit.

When we must be explicit, we can add a lifetime bound on a trait object like
`Box<Foo>` with the syntax `Box<Foo + 'a>` or `Box<Foo + 'static>`, depending
on what's needed. Just as with the other bounds, this means that any
implementer of the `Foo` trait that has any references inside must have the
lifetime specified in the trait object bounds as those references.

Next, let's take a look at some other advanced features dealing with traits!
