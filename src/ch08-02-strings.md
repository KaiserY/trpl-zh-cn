## 使用字符串存储 UTF-8 编码的文本

> [ch08-02-strings.md](https://github.com/rust-lang/book/blob/master/src/ch08-02-strings.md)
> <br>
> commit c084bdd9ee328e7e774df19882ccc139532e53d8

第四章已经讲过一些字符串的内容，不过现在让我们更深入地了解它。字符串是新晋 Rustacean 们通常会被困住的领域，这是由于三方面理由的结合：Rust 倾向于确保暴露出可能的错误，字符串是比很多程序员所想象的要更为复杂的数据结构，以及 UTF-8。所有这些要素结合起来对于来自其他语言背景的程序员就可能显得很困难了。

在集合章节中讨论字符串的原因是，字符串就是作为字节的集合外加一些方法实现的，当这些字节被解释为文本时，这些方法提供了实用的功能。在这一部分，我们会讲到 `String` 中那些任何集合类型都有的操作，比如创建、更新和读取。也会讨论 `String` 与其他集合不一样的地方，例如索引` String` 是很复杂的，由于人和计算机理解 `String` 数据方式的不同。

### 什么是字符串？

在开始深入这些方面之前，我们需要讨论一下术语 **字符串** 的具体意义。Rust 的核心语言中只有一种字符串类型：`str`，字符串 slice，它通常以被借用的形式出现，`&str`。第四章讲到了 **字符串 slice**：它们是一些储存在别处的 UTF-8 编码字符串数据的引用。比如字符串字面值被储存在程序的二进制输出中，字符串 slice 也是如此。

称作 `String` 的类型是由标准库提供的，而没有写进核心语言部分，它是可增长的、可变的、有所有权的、UTF-8 编码的字符串类型。当 Rustacean 们谈到 Rust 的 “字符串”时，它们通常指的是 `String` 和字符串 slice `&str` 类型，而不仅仅是其中之一。虽然本部分内容大多是关于 `String` 的，不过这两个类型在 Rust 标准库中都被广泛使用，`String` 和字符串 slice 都是 UTF-8 编码的。

Rust 标准库中还包含一系列其他字符串类型，比如 `OsString`、`OsStr`、`CString` 和 `CStr`。相关库 crate 甚至会提供更多储存字符串数据的选择。看到这些由 `String` 或是 `Str` 结尾的名字了吗？这对应着它们提供的所有权和可借用的字符串变体，就像是你之前看到的 `String` 和 `str`。举例而言，这些字符串类型能够以不同的编码或内存表现形式上以不同的形式存储文本内容。本章将不会讨论其他这些字符串类型，查看 API 文档来更多的了解如何使用它们以及各自适合的场景。

### 新建字符串

很多 `Vec` 可用的操作在 `String` 中同样可用，从以 `new` 函数创建字符串开始，如示例 8-11 所示。

```rust
let mut s = String::new();
```

<span class="caption">示例 8-11：新建一个空的 `String`</span>

这新建了一个叫做 `s` 的空的字符串，接着我们可以向其中装载数据。通常字符串会有初始数据，因为我们希望一开始就有这个字符串。为此，可以使用 `to_string` 方法，它能用于任何实现了 `Display` trait 的类型，字符串字面值也实现了它。示例 8-12 展示了两个例子。

```rust
let data = "initial contents";

let s = data.to_string();

// 该方法也可直接用于字符串字面值：
let s = "initial contents".to_string();
```

<span class="caption">示例 8-12：使用 `to_string` 方法从字符串字面值创建 `String`</span>

这些代码会创建包含 `initial contents` 的字符串。

也可以使用 `String::from` 函数来从字符串字面值创建 `String`。示例 8-13 中的代码代码等同于使用 `to_string`。

```rust
let s = String::from("initial contents");
```

<span class="caption">示例 8-13：使用 `String::from` 函数从字符串字面值创建 `String`</span>

因为字符串应用广泛，这里有很多不同的用于字符串的通用 API 可供选择。它们有些可能显得有些多余，不过都有其用武之地！在这个例子中，`String::from` 和 `.to_string` 最终做了完全相同的工作，所以如何选择就是风格问题了。

记住字符串是 UTF-8 编码的，所以可以包含任何可以正确编码的数据，如示例 8-14 所示。

```rust
let hello = String::from("السلام عليكم");
let hello = String::from("Dobrý den");
let hello = String::from("Hello");
let hello = String::from("שָׁלוֹם");
let hello = String::from("नमस्ते");
let hello = String::from("こんにちは");
let hello = String::from("안녕하세요");
let hello = String::from("你好");
let hello = String::from("Olá");
let hello = String::from("Здравствуйте");
let hello = String::from("Hola");
```

<span class="caption">示例 8-14：在字符串中储存不同语言的问候语</span>

所有这些都是有效的 `String` 值。

### 更新字符串

`String` 的大小可以增长其内容也可以改变，就像可以放入更多数据来改变 `Vec` 的内容一样。另外，可以方便的使用 `+` 运算符或 `format!` 宏来拼接 `String` 值。

#### 使用 `push_str` 和 `push` 附加字符串

可以通过 `push_str` 方法来附加字符串 slice，从而使 `String` 变长，如示例 8-15 所示。

```rust
let mut s = String::from("foo");
s.push_str("bar");
```

<span class="caption">示例 8-15：使用 `push_str` 方法向 `String` 附加字符串 slice</span>

执行这两行代码之后 `s` 将会包含 `foobar`。`push_str` 方法获取字符串 slice，因为我们并不需要获取参数的所有权。例如，示例 8-16 展示了如果将 `s2` 的内容附加到 `s1` 中后自身不能被使用就糟糕了。

```rust
let mut s1 = String::from("foo");
let s2 = "bar";
s1.push_str(s2);
println!("s2 is {}", s2);
```

<span class="caption">示例 8-16：将字符串 slice 的内容附加到 `String` 后使用它</span>

如果 `push_str` 方法获取了 `s2` 的所有权，就不能在最后一行打印出其值了。好在代码如我们期望那样工作！

`push` 方法被定义为获取一个单独的字符作为参数，并附加到 `String` 中。示例 8-17 展示了使用 `push` 方法将字母 *l* 加入 `String` 的代码。

```rust
let mut s = String::from("lo");
s.push('l');
```

<span class="caption">示例 8-17：使用 `push` 将一个字符加入 `String` 值中</span>

执行这些代码之后，`s` 将会包含 “lol”。

#### 使用 `+` 运算符或 `format!` 宏拼接字符串

通常你会希望将两个已知的字符串合并在一起。一种办法是像这样使用 `+` 运算符，如示例 8-18 所示。

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2; // 注意 s1 被移动了，不能继续使用
```

<span class="caption">示例 8-18：使用 `+` 运算符将两个 `String` 值合并到一个新的 `String` 值中</span>

执行完这些代码之后字符串 `s3` 将会包含 `Hello, world!`。`s1` 在相加后不再有效的原因，和使用 `s2` 的引用的原因与使用 `+` 运算符时调用的方法签名有关，这个函数签名看起来像这样：

```rust,ignore
fn add(self, s: &str) -> String {
```

这并不是标准库中实际的签名；标准库中的 `add` 使用泛型定义。这里我们看到的 `add` 的签名使用具体类型代替了泛型，这也正是当使用 `String` 值调用这个方法会发生的。第十章会讨论泛型。这个签名提供了理解 `+` 运算那微妙部分的线索。

首先，`s2` 使用了 `&`，意味着我们使用第二个字符串的 **引用** 与第一个字符串相加。这是因为 `add` 函数的 `s` 参数：只能将 `&str` 和 `String` 相加，不能将两个 `String` 值相加。不过等一下 —— 正如 `add` 的第二个参数所指定的，`&s2` 的类型是 `&String` 而不是 `&str`。那么为什么示例 8-18 还能编译呢？

之所以能够在 `add` 调用中使用 `&s2` 是因为 `&String` 可以被 **强转**（*coerced*）成 `&str`。当`add`函数被调用时，Rust 使用了一个被称为 **解引用强制多态**（*deref coercion*）的技术，你可以将其理解为它把 `&s2` 变成了 `&s2[..]`。第十五章会更深入的讨论解引用强制多态。因为 `add` 没有获取参数的所有权，所以 `s2` 在这个操作后仍然是有效的 `String`。

其次，可以发现签名中 `add` 获取了 `self` 的所有权，因为 `self` **没有** 使用 `&`。这意味着示例 8-18 中的 `s1` 的所有权将被移动到 `add` 调用中，之后就不再有效。所以虽然 `let s3 = s1 + &s2;` 看起来就像它会复制两个字符串并创建一个新的字符串，而实际上这个语句会获取 `s1` 的所有权，附加上从 `s2` 中拷贝的内容，并返回结果的所有权。换句话说，它看起来好像生成了很多拷贝不过实际上并没有：这个实现比拷贝要更高效。

如果想要级联多个字符串，`+` 的行为就显得笨重了：

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = s1 + "-" + &s2 + "-" + &s3;
```

这时 `s` 的内容会是 “tic-tac-toe”。在有这么多 `+` 和 `"` 字符的情况下，很难理解具体发生了什么。对于更为复杂的字符串链接，可以使用 `format!` 宏：

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = format!("{}-{}-{}", s1, s2, s3);
```

这些代码也会将 `s` 设置为 “tic-tac-toe”。`format!` 与 `println!` 的工作原理相同，不过不同于将输出打印到屏幕上，它返回一个带有结果内容的 `String`。这个版本就好理解的多，并且不会获取任何参数的所有权。

### 索引字符串

在很多语言中，通过索引来引用字符串中的单独字符是有效且常见的操作。然而在 Rust 中，如果你尝试使用索引语法访问 `String` 的一部分，会出现一个错误。考虑一下如示例 8-19 中所示的无效代码。

```rust,ignore,does_not_compile
let s1 = String::from("hello");
let h = s1[0];
```

<span class="caption">示例 8-19：尝试对字符串使用索引语法</span>

这段代码会导致如下错误：

```text
error[E0277]: the trait bound `std::string::String: std::ops::Index<{integer}>` is not satisfied
 -->
  |
3 |     let h = s1[0];
  |             ^^^^^ the type `std::string::String` cannot be indexed by `{integer}`
  |
  = help: the trait `std::ops::Index<{integer}>` is not implemented for `std::string::String`
```

错误和提示说明了全部问题：Rust 的字符串不支持索引。那么接下来的问题是，为什么不支持呢？为了回答这个问题，我们必须先聊一聊 Rust 是如何在内存中储存字符串的。

#### 内部表现

`String` 是一个 `Vec<u8>` 的封装。让我们看看示例 8-14 中一些正确编码的字符串的例子。首先是这一个：

```rust
let len = String::from("Hola").len();
```

在这里，`len` 的值是 4 ，这意味着储存字符串 “Hola” 的 `Vec` 的长度是四个字节：这里每一个字母的 UTF-8 编码都占用一个字节。那下面这个例子又如何呢？（注意这个字符串中的首字母是西里尔字母的 Ze 而不是阿拉伯数字 3 。）

```rust
let len = String::from("Здравствуйте").len();
```

当问及这个字符是多长的时候有人可能会说是 12。然而，Rust 的回答是 24。这是使用 UTF-8 编码 “Здравствуйте” 所需要的字节数，这是因为每个 Unicode 标量值需要两个字节存储。因此一个字符串字节值的索引并不总是对应一个有效的 Unicode 标量值。作为演示，考虑如下无效的 Rust 代码：

```rust,ignore,does_not_compile
let hello = "Здравствуйте";
let answer = &hello[0];
```

`answer` 的值应该是什么呢？它应该是第一个字符 `З` 吗？当使用 UTF-8 编码时，`З` 的第一个字节 `208`，第二个是 `151`，所以 `answer` 实际上应该是 `208`，不过 `208` 自身并不是一个有效的字母。返回 `208` 可不是一个请求字符串第一个字母的人所希望看到的，不过它是 Rust 在字节索引 0 位置所能提供的唯一数据。用户通常不会想要一个字节值被返回，即便这个字符串只有拉丁字母： 即便 `&"hello"[0]` 是返回字节值的有效代码，它也应当返回 `104` 而不是 `h`。为了避免返回意想不到值并造成不能立刻发现的 bug。Rust 根本不会编译这些代码并在开发过程中及早杜绝了误会的发生。

#### 字节、标量值和字形簇！天呐！

这引起了关于 UTF-8 的另外一个问题：从 Rust 的角度来讲，事实上有三种相关方式可以理解字符串：字节、标量值和字形簇（最接近人们眼中 **字母** 的概念）。

比如这个用梵文书写的印度语单词 “नमस्ते”，最终它储存在 vector 中的 `u8` 值看起来像这样：

```text
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164, 164, 224, 165, 135]
```

这里有 18 个字节，也就是计算机最终会储存的数据。如果从 Unicode 标量值的角度理解它们，也就像 Rust 的 `char` 类型那样，这些字节看起来像这样：

```text
['न', 'म', 'स', '्', 'त', 'े']
```

这里有六个 `char`，不过第四个和第六个都不是字母，它们是发音符号本身并没有任何意义。最后，如果以字形簇的角度理解，就会得到人们所说的构成这个单词的四个字母：

```text
["न", "म", "स्", "ते"]
```

Rust 提供了多种不同的方式来解释计算机储存的原始字符串数据，这样程序就可以选择它需要的表现方式，而无所谓是何种人类语言。

最后一个 Rust 不允许使用索引获取 `String` 字符的原因是索引操作预期总是需要常数时间 (O(1))。但是对于 `String` 不可能保证这样的性能，因为 Rust 不得不检查从字符串的开头到索引位置的内容来确定这里有多少有效的字符。

### 字符串 slice

索引字符串通常是一个坏点子，因为字符串索引应该返回的类型是不明确的：字节值、字符、字形簇或者字符串 slice。因此，如果你真的希望使用索引创建字符串 slice 时 Rust 会要求你更明确一些。为了更明确索引并表明你需要一个字符串 slice，相比使用 `[]` 和单个值的索引，可以使用 `[]` 和一个 range 来创建含特定字节的字符串 slice：

```rust
let hello = "Здравствуйте";

let s = &hello[0..4];
```

这里，`s` 会是一个 `&str`，它包含字符串的头四个字节。早些时候，我们提到了这些字母都是两个字节长的，所以这意味着 `s` 将会是 “Зд”。

如果获取 `&hello[0..1]` 会发生什么呢？答案是：Rust 在运行时会 panic，就跟访问 vector 中的无效索引时一样：

```text
thread 'main' panicked at 'byte index 1 is not a char boundary; it is inside 'З' (bytes 0..2) of `Здравствуйте`', src/libcore/str/mod.rs:2188:4
```

你应该小心谨慎的使用这个操作，因为这么做可能会使你的程序崩溃。

### 遍历字符串的方法

幸运的是，这里还有其他获取字符串元素的方式。

如果你需要操作单独的 Unicode 标量值，最好的选择是使用 `chars` 方法。对 “नमस्ते” 调用 `chars` 方法会将其分开并返回六个 `char` 类型的值，接着就可以遍历其结果来访问每一个元素了：

```rust
for c in "नमस्ते".chars() {
    println!("{}", c);
}
```

这些代码会打印出如下内容：

```text
न
म
स
्
त
े
```

`bytes` 方法返回每一个原始字节，这可能会适合你的使用场景：

```rust
for b in "नमस्ते".bytes() {
    println!("{}", b);
}
```

这些代码会打印出组成 `String` 的 18 个字节：

```text
224
164
// --snip--
165
135
```

不过请记住有效的 Unicode 标量值可能会由不止一个字节组成。

从字符串中获取字形簇是很复杂的，所以标准库并没有提供这个功能。[crates.io](https://crates.io) 上有些提供这样功能的 crate。

### 字符串并不简单

总而言之，字符串还是很复杂的。不同的语言选择了不同的向程序员展示其复杂性的方式。Rust 选择了以准确的方式处理 `String` 数据作为所有 Rust 程序的默认行为，这意味着程序员们必须更多的思考如何预先处理 UTF-8 数据。这种权衡取舍相比其他语言更多的暴露出了字符串的复杂性，不过也使你在开发生命周期后期免于处理涉及非 ASCII 字符的错误。

现在让我们转向一些不太复杂的集合：哈希 map！
