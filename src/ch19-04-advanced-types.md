## 高级类型

> [ch19-04-advanced-types.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-04-advanced-types.md)
> <br>
> commit e084e1773667c8eae28d9aab6d4939348eec0092

Rust 的类型系统有一些我们曾经提到或用到但没有讨论过的功能。我们从有关 trait 的 newtype 模式开始讨论；首先从一个关于为什么 newtype 与类型一样有用的更宽泛的讨论开始。接着会转向类型别名（type aliases），一个类似于 newtype 但有着稍微不同的语义的功能。我们还会讨论 `!` 类型和动态大小类型。

### 为了类型安全和抽象而使用 newtype 模式

在“高级 trait”部分最后开始的 newtype 模式的讨论中，我们以一个包含一个封装了某类型的字段的元组结构体创建了一个新类型，这对于静态的确保其值不被混淆也是有帮助的，并且它经常用来表示一个值的单元。实际上列表 19-26 中已有一个例子：`Millimeters` 和 `Meters` 结构体都将 `u32` 值封装进了新类型。如果编写了一个有 `Millimeters` 类型参数的函数，不小心使用 `Meters` 或普通的 `u32` 值来调用该函数的程序是不能编译的。

另一个使用 newtype 模式的原因是用来抽象掉一些类型的实现细节：例如，封装类型可以暴露出与直接使用其内部私有类型时所不同的 API，以便限制其功能。新类型也可以隐藏其内部的泛型类型。例如，可以提供一个封装了 `HashMap<i32, String>` 的 `People` 类型，用来储存人名以及相应的 ID。使用 `People` 的代码只需与提供的公有 API 交互即可，比如向 `People` 集合增加名字字符串的方法，这样这些代码就无需知道在内部我们将一个 `i32` ID 赋予了这个名字了。newtype 模式是一种实现第十七章所讨论的隐藏实现细节的封装的轻量级方法。

### 类型别名用来创建同义类型

newtype 模式涉及到创建新结构体来作为新的、单独的类型。Rust 还提供了声明**类型别名**（*type alias*）的能力，使用 `type` 关键字来给予现有类型另一个名字。例如，可以像这样创建 `i32` 的别名 `Kilometers`：

```rust
type Kilometers = i32;
```

这意味着 `Kilometers` 是 `i32` 的**同义词**（*synonym*）；不同于列表 19-26 中创建的 `Millimeters` 和 `Meters` 类型。`Kilometers` 不是一个新的、单独的类型。`Kilometers` 类型的值将被完全当作 `i32` 类型值来对待：

```rust
type Kilometers = i32;

let x: i32 = 5;
let y: Kilometers = 5;

println!("x + y = {}", x + y);
```

因为 `Kilometers` 是 `i32` 的别名，他们是同一类型。可以将 `i32` 与 `Kilometers` 相加，可以将 `Kilometers` 传递给获取 `i32` 参数的函数。但无法获得上一部分讨论的 newtype 模式所提供的类型检查的好处。

类型别名的主要用途是减少重复。例如，可能会有这样很长的类型：

```rust
Box<FnOnce() + Send + 'static>
```

在函数签名或类型注解中每次都书写这个类型将是枯燥且易于出错的。想象一下如列表 19-31 这样全是如此代码的项目：

```rust
let f: Box<FnOnce() + Send + 'static> = Box::new(|| println!("hi"));

fn takes_long_type(f: Box<FnOnce() + Send + 'static>) {
    // ...
}

fn returns_long_type() -> Box<FnOnce() + Send + 'static> {
    // ...
#     Box::new(|| ())
}
```

<span class="caption">列表 19-31：在大部分地方使用名称很长的类型</span>

类型别名通过减少项目中重复代码的数量来使其更加易于控制。这里我们为这个冗长的类型引入了一个叫做 `Thunk` 的别名，这样就可以如列表 19-32 所示将所有使用这个类型的地方替换为更短的 `Thunk`：

```rust
type Thunk = Box<FnOnce() + Send + 'static>;

let f: Thunk = Box::new(|| println!("hi"));

fn takes_long_type(f: Thunk) {
    // ...
}

fn returns_long_type() -> Thunk {
    // ...
#     Box::new(|| ())
}
```

<span class="caption">列表 19-32：引入类型别名 `Thunk` 来减少重复</span>

这样就读写起来就容易多了！为类型别名选择一个好名字也可以帮助你表达意图（单词 *thunk* 表示会在之后被计算的代码，所以这是一个存放闭包的合适的名字）。

类型别名的另一个常用用法是与 `Result<T, E>` 结合。考虑一下标准库中的 `std::io` 模块。I/O 操作通常会返回一个 `Result<T, E>`，因为这些操作可能会失败。`std::io::Error` 结构体代表了所有可能的 I/O 错误。`std::io` 中大部分函数会返回 `Result<T, E>`，其中 `E` 是 `std::io::Error`，比如 `Write` trait 中的这些函数：

```rust
use std::io::Error;
use std::fmt;

pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize, Error>;
    fn flush(&mut self) -> Result<(), Error>;

    fn write_all(&mut self, buf: &[u8]) -> Result<(), Error>;
    fn write_fmt(&mut self, fmt: fmt::Arguments) -> Result<(), Error>;
}
```

这里出现了很多的 `Result<..., Error>`。为此，`std::io` 有这个类型别名声明：

```rust
type Result<T> = Result<T, std::io::Error>;
```

因为这位于 `std::io` 中，可用的完全限定的别名是`std::io::Result<T>`；也就是说，`Result<T, E>` 中 `E` 放入了 `std::io::Error`。`Write` trait 中的函数最终看起来像这样：

```rust
pub trait Write {
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
    fn flush(&mut self) -> Result<()>;

    fn write_all(&mut self, buf: &[u8]) -> Result<()>;
    fn write_fmt(&mut self, fmt: Arguments) -> Result<()>;
}
```

类型别名在两个方面有帮助：易于编写**并**在整个 `std::io` 中提供了一致的接口。因为这是一个别名，它只是另一个 `Result<T, E>`，这意味着可以在其上使用 `Result<T, E>` 的任何方法，以及像 `?` 这样的特殊语法。

### 从不返回的 `!`，never type

Rust 有一个叫做 `!` 的特殊类型。在类型理论术语中，它被称为 *empty type*，因为它没有值。我们更倾向于称之为 *never type*。这个名字描述了它的作用：在函数从不返回的时候充当返回值。例如：

```rust
fn bar() -> ! {
```

这读作“函数 `bar` 从不返回”，而从不返回的函数被称为**发散函数**（*diverging functions*）。不能创建 `!` 类型的值，所以 `bar` 也不可能返回。一个不能创建值的类型有什么用呢？如果你回想一下第二章，曾经有一些看起来像这样的代码，如列表 19-33 所重现的：

```rust
# let guess = "3";
# loop {
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};
# break;
# }
```

<span class="caption">列表 19-33：`match` 语句和一个以 `continue` 结束的分支</span>

当时我们忽略了一些代码细节。在第六章中，我们学习了 `match` 的分支必须返回相同的类型。如下代码不能工作：

```rust
let guess = match guess.trim().parse()  {
    Ok(_) => 5,
    Err(_) => "hello",
}
```

这里的 `guess` 会是什么类型呢？它必须既是整型也是字符串，而 Rust 要求 `guess` 只能是一个类型。那么 `continue` 返回了什么呢？为什么列表 19-33 中会允许一个分支返回 `u32` 而另一个分支却以 `continue` 结束呢？

正如你可能猜到的，`continue` 的值是 `!`。也就是说，当 Rust 要计算 `guess` 的类型时，它查看这两个分支。前者是 `u32` 值，而后者是 `!` 值。因为 `!` 并没有一个值，Rust 认为这是可行的，并决定 `guess` 的类型是 `u32`。描述 `!` 的行为的正式方式是 never type 可以与其他任何类型联合。允许 `match` 的分支以 `continue` 结束是因为 `continue` 并不真正返回一个值；相反它把控制权交回上层循环，所以在 `Err` 的情况，事实上并未对 `guess` 赋值。

never type 的另一个用途是 `panic!`。还记得 `Option<T>` 上的 `unwrap` 函数吗？它产生一个值或 panic。这里是它的定义：

```rust
impl<T> Option<T> {
    pub fn unwrap(self) -> T {
        match self {
            Some(val) => val,
            None => panic!("called `Option::unwrap()` on a `None` value"),
        }
    }
}
```

这里与列表 19-33 中的 `match` 发生的相同的情况：我们知道 `val` 是 `T` 类型，`panic!` 是 `!` 类型，所以整个 `match` 表达式的结果是 `T` 类型。这能工作是因为 `panic!` 并不产生一个值：它终止程序。对于 `None` 的情况，`unwrap` 并不返回一个值，所以这些代码是有效。

最后的表达式在 `loop` 中使用了 `!` 类型：

```rust
print!("forever ");

loop {
    print!("and ever ");
}
```

这里，循环永远也不结束，所以此表达式的值是 `!`。但是如果引入 `break` 这就不为真了，因为循环在执行到 `break` 后就会终止。

### 动态大小类型和 `Sized` trait

因为 Rust 需要知道类似内存布局之类的信息，在其类型系统的一个特定的角落可能令人迷惑，这就是**动态大小类型**（*dynamically sized types*）的概念。这有时被称为“DST” 或 “unsized types”，这些类型允许我们处理只有在运行时才知道大小的类型。

让我们深入研究一个贯穿本书都在使用的动态大小类型的细节：`str`。没错，不是 `&str`，而是 `str` 本身。`str` 是一个 DST；直到运行时我们都不知道字符串有多长。因为不能知道大小，也就不能创建 `str` 类型的变量，也不能获取 `str` 类型的参数。考虑一下这些代码，他们不能工作：

```rust
let s1: str = "Hello there!";
let s2: str = "How's it going?";
```

这两个 `str` 值需要有完全一样的内存布局，不过他们却有不同的长度：`s1` 需要 12 字节来存储，而 `s2` 需要 15 字节。这样就是为为什么不可能创建一个存放动态大小类型的变量。

那么该怎么办呢？好吧，在这个例子中你已经知道了答案：`s1` 和 `s2` 的类型是 `&str` 而不是 `str`。如果你回想第四章，我们这样描述 `&str`：

> ... 这是一个字符串内部位置和其所引用的元素的数量的引用。

所以虽然 `&T` 是一个储存了 `T` 所在的内存位置的单个值，`&str` 则是**两个**值：`str` 的地址和其长度。这样，`&str` 就有了一个在编译时可以知道的大小：它是 `usize` 长度的两倍。也就是说，我们总是知道 `&str` 的大小，而无论其引用的字符串是多长。这里是 Rust 中动态大小类型的常规用法：他们有一些额外的元信息来储存动态信息的大小。这引出了动态大小类型的黄金规则：必须将动态大小类型的值置于某种指针之后。

<!-- Note for Carol: `Rc<str>` is only in an accepted RFC right now, check on
its progress and pull this out if it's not going to be stable by Oct -->

虽然我们总是说 `&str`，但是可以将 `str` 与所有类型的指针结合：比如 `Box<str>` 或 `Rc<str>`。事实上，之前已经见过了，不过是另一个动态大小类型：trait。每一个 trait 都是一个可以通过 trait 名称来引用的动态大小类型。在第十七章中，我们提到了为了将 trait 用于 trait 对象，必须将他们放入指针之后，比如 `&Trait` 或 `Box<Trait>`（`Rc<Trait>` 也可以）。

#### `Sized` trait

为了处理 DST，Rust 有一个 trait 来决定一个类型的大小是否在编译时可知，这就是 `Sized`。这个 trait 自动为编译器在编译时就知道大小的类型实现。另外，Rust 隐式的为每一个泛型函数增加了 `Sized` bound。也就是说，对于如下泛型函数定义：

```rust
fn generic<T>(t: T) {
```

实际上被当作如下处理：

```rust
fn generic<T: Sized>(t: T) {
```

泛型函数默认只能用于在编译时已知大小的类型。然而可以使用如下特殊语法来放松这个限制：

```rust
fn generic<T: ?Sized>(t: &T) {
```

`?Sized` trait bound 与 `Sized` 相对；也就是说，它可以读作“`T` 可能是也可能不是 `Sized` 的”。这个语法只能用于 `Sized` ，而不是其他 trait。

另外注意我们将 `t` 参数的类型从 `T` 变为了 `&T`：因为其类型可能不是 `Sized` 的，所以需要将其置于某种指针之后。在这个例子中选择了引用。

接下来，让我们讨论一下函数和闭包！