## Slice 类型

[ch04-03-slices.md](https://github.com/rust-lang/book/blob/8a6130451b0817ead5c2522ce641dcb0f11a8571/src/ch04-03-slices.md)

**切片**（*slice*）允许你引用集合中一段连续的元素序列，而不用引用整个集合。slice 是一种引用，所以它不拥有所有权。

这里有一个编程小习题：编写一个函数，接收一个由空格分隔单词的字符串，并返回它在该字符串中找到的第一个单词。如果函数在该字符串中没有找到空格，那么整个字符串就是一个单词，因此应该返回整个字符串。

> 注意：为了介绍字符串 slice，本小节假设只处理 ASCII；关于 UTF-8 处理的更完整讨论，请见第八章的[“使用字符串储存 UTF-8 编码的文本”][strings]一节。

让我们先想想，如果不用 slice，该怎样写这个函数的签名，从而理解 slice 解决了什么问题：

```rust,ignore
fn first_word(s: &String) -> ?
```

`first_word` 函数有一个 `&String` 类型的参数。因为我们不需要所有权，所以这没有问题。不过应该返回什么呢？我们其实没有办法真正表示字符串的**一部分**。不过，我们可以返回单词结尾的索引，也就是空格所在的位置。试试示例 4-7 中的代码。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-07/src/main.rs:here}}
```

<span class="caption">示例 4-7：`first_word` 函数返回 `String` 参数的一个字节索引值</span>

因为我们需要逐个检查 `String` 中的元素是否为空格，所以要用 `as_bytes` 方法把 `String` 转换成字节数组。

```rust,ignore
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-07/src/main.rs:as_bytes}}
```

接下来，使用 `iter` 方法在字节数组上创建一个迭代器：

```rust,ignore
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-07/src/main.rs:iter}}
```

我们会在[第十三章][ch13]更详细地讨论迭代器。现在只需要知道，`iter` 方法会返回集合中的每个元素，而 `enumerate` 会包装 `iter` 的结果，把每个元素作为元组的一部分返回。`enumerate` 返回的元组中，第一个元素是索引，第二个元素是该元素的引用。这比我们自己手动计算索引更方便一些。

因为 `enumerate` 方法返回的是元组，所以我们可以用模式来解构它；我们会在[第六章][ch6]进一步讨论模式。因此，在 `for` 循环中，我们指定了一个模式，其中元组里的 `i` 是索引，元组里的 `&item` 是单个字节。因为我们从 `.iter().enumerate()` 拿到的是元素的引用，所以模式中用了 `&`。

在 `for` 循环中，我们通过字节的字面值语法来寻找代表空格的字节。如果找到了一个空格，返回它的位置。否则，使用 `s.len()` 返回字符串的长度。

```rust,ignore
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-07/src/main.rs:inside_for}}
```

现在有了一个找到字符串中第一个单词结尾索引的方法，不过这有一个问题。我们返回了一个独立的 `usize`，不过它只在 `&String` 的上下文中才是一个有意义的数字。换句话说，因为它是一个与 `String` 相分离的值，无法保证将来它仍然有效。考虑一下示例 4-8 中使用了示例 4-7 中 `first_word` 函数的程序。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-08/src/main.rs:here}}
```

<span class="caption">示例 4-8：存储 `first_word` 函数调用的返回值并接着改变 `String` 的内容</span>

这个程序编译时不会报任何错误，而且即使在调用 `s.clear()` 之后再使用 `word`，也同样不会报错。因为 `word` 和 `s` 的状态完全没有关联，所以 `word` 仍然包含值 `5`。我们可以尝试用这个值 `5` 从变量 `s` 中提取第一个单词，但这会出 bug，因为在把 `5` 保存进 `word` 之后，`s` 的内容已经变了。

我们不得不时刻担心 `word` 的索引与 `s` 中的数据不再同步，这既繁琐又易出错！如果编写这么一个 `second_word` 函数的话，管理索引这件事将更加容易出问题。它的签名看起来像这样：

```rust,ignore
fn second_word(s: &String) -> (usize, usize) {
```

现在我们要跟踪一个开始索引**和**一个结束索引，同时有了更多从数据的某个特定状态计算而来的值，但都完全没有与这个状态相关联。现在有三个飘忽不定的不相关变量需要保持同步。

幸运的是，Rust 为这个问题提供了一个解决方法：字符串 slice。

### 字符串 slice

**字符串 slice**（*string slice*）是 `String` 中一部分值的引用，它看起来像这样：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-17-slice/src/main.rs:here}}
```

不同于整个 `String` 的引用，`hello` 是一个部分 `String` 的引用，由一个额外的 `[0..5]` 部分指定。可以使用一个由中括号中的 `[starting_index..ending_index]` 指定的 range 创建一个 slice，其中 `starting_index` 是 slice 的第一个位置，`ending_index` 则是 slice 最后一个位置的后一个值。在其内部，slice 的数据结构存储了 slice 的开始位置和长度，长度对应于 `ending_index` 减去 `starting_index` 的值。所以对于 `let world = &s[6..11];` 的情况，`world` 将是一个包含指向 `s` 索引 6 的指针和长度值 5 的 slice。

图 4-7 给出了示意图。

<img alt="Three tables: a table representing the stack data of s, which points
to the byte at index 0 in a table of the string data &quot;hello world&quot; on
the heap. The third table rep-resents the stack data of the slice world, which
has a length value of 5 and points to byte 6 of the heap data table."
src="img/trpl04-07.svg" class="center" style="width: 50%;" />

<span class="caption">图 4-7：引用了部分 `String` 的字符串 slice</span>

对于 Rust 的 `..` range 语法，如果想要从索引 0 开始，可以不写两个点号之前的值。换句话说，如下两个语句是相同的：

```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];
```

依此类推，如果 slice 包含 `String` 的最后一个字节，也可以舍弃尾部的数字。这意味着如下也是相同的：

```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[3..len];
let slice = &s[3..];
```

也可以同时舍弃这两个值来获取整个字符串的 slice。所以如下亦是相同的：

```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
```

> 注意：字符串 slice range 的索引必须位于有效的 UTF-8 字符边界内，如果尝试从一个多字节字符的中间位置创建字符串 slice，则程序将会因错误而退出。

有了这些知识之后，让我们重写 `first_word`，让它返回一个 slice。“字符串 slice” 的类型写作 `&str`：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-18-first-word-slice/src/main.rs:here}}
```

我们使用跟示例 4-7 相同的方式获取单词结尾的索引，通过寻找第一个出现的空格。当找到一个空格，我们返回一个字符串 slice，它使用字符串的开始和空格的索引作为开始和结束的索引。

现在调用 `first_word` 时，它会返回一个与底层数据绑定在一起的值。这个值由一个指向 slice 起始位置的引用和 slice 中元素的数量组成。

`second_word` 函数也可以改为返回一个 slice：

```rust,ignore
fn second_word(s: &String) -> &str {
```

现在我们有了一个更直观、也更不容易出错的 API，因为编译器会确保指向 `String` 的引用始终有效。还记得示例 4-8 里的那个 bug 吗？我们先拿到了第一个单词结尾的索引，然后又清空了字符串，于是索引失效了。那段代码在逻辑上是错的，但当时却不会直接报错。问题会在之后你尝试对一个已被清空的字符串继续使用那个索引时才暴露出来。slice 让这种 bug 不再可能发生，并且会更早告诉我们代码出了问题。使用 slice 版本的 `first_word` 会得到一个编译时错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-19-slice-error/src/main.rs:here}}
```

这里是编译错误：

```console
{{#include ../listings/ch04-understanding-ownership/no-listing-19-slice-error/output.txt}}
```

回忆一下借用规则，当拥有某值的不可变引用时，就不能再获取一个可变引用。因为 `clear` 需要清空 `String`，它尝试获取一个可变引用。在调用 `clear` 之后的 `println!` 使用了 `word` 中的引用，所以这个不可变的引用在此时必须仍然有效。Rust 不允许 `clear` 中的可变引用和 `word` 中的不可变引用同时存在，因此编译失败。Rust 不仅使得我们的 API 简单易用，也在编译时就消除了一整类的错误！

#### 字符串字面值就是 slice

还记得我们讲到过字符串字面值被储存在二进制文件中吗？现在知道 slice 了，我们就可以正确地理解字符串字面值了：

```rust
let s = "Hello, world!";
```

这里 `s` 的类型是 `&str`：它是一个指向二进制程序特定位置的 slice。这也就是为什么字符串字面值是不可变的；`&str` 是一个不可变引用。

#### 字符串 slice 作为参数

在知道了能够获取字面值和 `String` 的 slice 后，我们对 `first_word` 做了改进，这是它的签名：

```rust,ignore
fn first_word(s: &String) -> &str {
```

而更有经验的 Rustacean 会编写出示例 4-9 中的签名，因为它使得可以对 `&String` 值和 `&str` 值使用相同的函数：

```rust,ignore
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-09/src/main.rs:here}}
```

<span class="caption">示例 4-9: 通过将 `s` 参数的类型改为字符串 slice 来改进 `first_word` 函数</span>

如果我们有一个字符串 slice，就可以直接把它传进去。如果我们有一个 `String`，也可以传入整个 `String` 的 slice，或者传入对 `String` 的引用。这种灵活性利用了 *deref coercions*，也就是我们会在[“在函数和方法中使用 Deref 强制转换”][deref-coercions]一节中讲到的特性。把函数参数定义为字符串 slice，而不是 `String` 的引用，会让我们的 API 更通用、更有用，而且不会损失任何功能：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-09/src/main.rs:usage}}
```

### 其他类型的 slice

字符串 slice，正如你想象的那样，是针对字符串的。不过也有更通用的 slice 类型。考虑一下这个数组：

```rust
let a = [1, 2, 3, 4, 5];
```

就跟我们想要获取字符串的一部分那样，我们也会想要引用数组的一部分。我们可以这样做：

```rust
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);
```

这个 slice 的类型是 `&[i32]`。它跟字符串 slice 的工作方式一样，通过存储第一个集合元素的引用和一个集合总长度。你可以对其他所有集合使用这类 slice。第八章讲到 vector 时会详细讨论这些集合。

## 总结

所有权、借用和 slice 这些概念让 Rust 程序在编译时确保内存安全。Rust 语言提供了跟其他系统编程语言相同的方式来控制你使用的内存，但拥有数据所有者在离开作用域后自动清除其数据的功能意味着你无须额外编写和调试相关的控制代码。

所有权系统影响了 Rust 中很多其他部分的工作方式，所以我们还会继续讲到这些概念，这将贯穿本书的余下内容。让我们开始第五章，来看看如何将多份数据组合进一个 `struct` 中。

[ch13]: ch13-02-iterators.html
[ch6]: ch06-02-match.html#绑定值的模式
[strings]: ch08-02-strings.html#使用字符串储存-utf-8-编码的文本
[deref-coercions]: ch15-02-deref.html#在函数和方法中使用-deref-强制转换
