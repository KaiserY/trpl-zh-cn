## Slices

> [ch04-03-slices.md](https://github.com/rust-lang/book/blob/master/src/ch04-03-slices.md)
> <br>
> commit c9fd8eb1da7a79deee97020e8ad49af8ded78f9c

另一个没有所有权的数据类型是 *slice*。slice 允许你引用集合中一段连续的元素序列，而不用引用整个集合。

这里有一个小的编程问题：编写一个获取一个字符串并返回它在其中找到的第一个单词的函数。如果函数没有在字符串中找到一个空格，就意味着整个字符串是一个单词，所以整个字符串都应该返回。

让我们看看这个函数的签名：

```rust,ignore
fn first_word(s: &String) -> ?
```

`first_word`这个函数有一个参数`&String`。因为我们不需要所有权，所以这没有问题。不过应该返回什么呢？我们并没有一个真正获取**部分**字符串的办法。不过，我们可以返回单词结尾的索引。让我们试试如列表 4-10 所示的代码：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }

    s.len()
}
```

<figcaption>

Listing 4-10: The `first_word` function that returns a byte index value into
the `String` parameter

</figcaption>
</figure>

让我们将代码分解成小块。因为需要一个元素一个元素的检查`String`中的值是否是空格，需要用`as_bytes`方法将`String`转化为字节数组：

```rust,ignore
let bytes = s.as_bytes();
```

Next, we create an iterator over the array of bytes using the `iter` method :

```rust,ignore
for (i, &item) in bytes.iter().enumerate() {
```

第十六章将讨论迭代器的更多细节。现在，只需知道`iter`方法返回集合中的每一个元素，而`enumerate`包装`iter`的结果并返回一个元组，其中每一个元素是元组的一部分。返回元组的第一个元素是索引，第二个元素是集合中元素的引用。这比我们自己计算索引要方便一些。

因为`enumerate`方法返回一个元组，我们可以使用模式来解构它，就像 Rust 中其他地方一样。所以在`for`循环中，我们指定了一个模式，其中`i`是元组中的索引而`&item`是单个字节。因为从`.iter().enumerate()`中获取了集合元素的引用，我们在模式中使用了`&`。

我们通过字节的字面值来寻找代表空格的字节。如果找到了，返回它的位置。否则，使用`s.len()`返回字符串的长度：

```rust,ignore
    if item == b' ' {
        return i;
    }
}
s.len()
```

现在有了一个找到字符串中第一个单词结尾索引的方法了，不过这有一个问题。我们返回了单单一个`usize`，不过它只在`&String`的上下文中才是一个有意义的数字。换句话说，因为它是一个与`String`像分离的值，无法保证将来它仍然有效。考虑一下列表 4-11 中使用了列表 4-10 `first_word`函数的程序：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# fn first_word(s: &String) -> usize {
#     let bytes = s.as_bytes();
#
#     for (i, &item) in bytes.iter().enumerate() {
#         if item == b' ' {
#             return i;
#         }
#     }
#
#     s.len()
# }
#
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s); // word will get the value 5.

    s.clear(); // This empties the String, making it equal to "".

    // word still has the value 5 here, but there's no more string that
    // we could meaningfully use the value 5 with. word is now totally invalid!
}
```

<figcaption>

Listing 4-11: Storing the result from calling the `first_word` function then
changing the `String` contents

</figcaption>
</figure>

这个程序编译时没有任何错误，而且在调用`s.clear()`之后使用`word`也不会出错。这时`word`与`s`状态就没有联系了，所以`word`仍然包含值`5`。可以尝试用值`5`来提取变量`s`的第一个单词，不过这是有 bug 的，因为在我们将`5`保存到`word`之后`s`的内容已经改变。

不得不担心`word`的索引与`s`中的数据不再同步是乏味且容易出错的！如果编写一个`second_word`函数的话管理索引将更加容易出问题。它的签名看起来像这样：

```rust,ignore
fn second_word(s: &String) -> (usize, usize) {
```

现在我们跟踪了一个开始索引**和**一个结尾索引，同时有了更多从数据的某个特定状态计算而来的值，他们也完全没有与这个状态相关联。现在有了三个飘忽不定的不相关变量都需要被同步。

幸运的是，Rust 为这个问题提供了一个解决方案：字符串 slice。

### 字符串 slice

**字符串 slice**（*string slice*）是`String`中一部分值的引用，它看起来像这样：

```rust
let s = String::from("hello world");

let hello = &s[0..5];
let world = &s[6..11];
```

这类似于获取整个`String`的引用不过带有额外的`[0..5]`部分。不同于整个`String`的引用，这是一个包含`String`内部的一个位置和所需元素数量的引用。

我们使用一个 range `[starting_index..ending_index]`来创建 slice，不过 slice 的数据结构实际上储存了开始位置和 slice 的长度。所以就`let world = &s[6..11];`来说，`world`将是一个包含指向`s`第 6 个字节的指针和长度值 5 的 slice。

图 4-12 展示了一个图例


<figure>
<img alt="world containing a pointer to the 6th byte of String s and a length 5" src="img/trpl04-06.svg" class="center" style="width: 50%;" />

<figcaption>

Figure 4-12: String slice referring to part of a `String`

</figcaption>
</figure>

对于 Rust 的`..` range 语法，如果想要从第一个索引（0）开始，可以不写两个点号之前的值。换句话说，如下两个语句是相同的：

```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];
```

由此类推，如果 slice 包含`String`的最后一个字节，也可以舍弃尾部的数字。这意味着如下也是相同的：

```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
```

在记住所有这些知识后，让我们重写`first_word`来返回一个 slice。“字符串 slice”的签名写作`&str`：

<span class="filename">Filename: src/main.rs</span>

```rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

我们使用跟列表 4-10 相同的方式获取单词结尾的索引，通过寻找第一个出现的空格。当我们找到一个空格，我们返回一个索引，它使用字符串的开始和空格的索引来作为开始和结束的索引。

现在当调用`first_word`时，会返回一个单独的与底层数据相联系的值。这个值由一个 slice 开始位置的引用和 slice 中元素的数量组成。

`second_word`函数也可以改为返回一个 slice：

```rust,ignore
fn second_word(s: &String) -> &str {
```

现在我们有了一个不易混杂的直观的 API 了，因为编译器会确保指向`String`的引用保持有效。还记得列表 4-11 程序中，那个当我们获取第一个单词结尾的索引不过接着就清除了字符串所以索引就无效了的 bug 吗？那些代码逻辑上时不正确的，不过却没有任何直观的错误。问题会在之后尝试对空字符串使用第一个单词的索引时出现。slice 就不可能出现这种 bug 并让我们更早的知道出问题了。使用 slice 版本的`first_word`会抛出一个编译时错误：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s);

    s.clear(); // Error!
}
```

这里是编译错误：

```
17:6 error: cannot borrow `s` as mutable because it is also borrowed as
            immutable [E0502]
    s.clear(); // Error!
    ^
15:29 note: previous borrow of `s` occurs here; the immutable borrow prevents
            subsequent moves or mutable borrows of `s` until the borrow ends
    let word = first_word(&s);
                           ^
18:2 note: previous borrow ends here
fn main() {

}
^
```

回忆一下借用规则，当拥有某值的不可变引用时。不能再获取一个可变引用。因为`clear`需要清空`String`，它尝试获取一个可变引用，它失败了。Rust 不仅使得我们的 API 简单易用，也在编译时就消除了一整个错误类型！

#### 字符串字面值就是 slice

还记得我们讲到过字符串字面值被储存在二进制文件中吗。现在知道 slice 了，我们就可以正确的理解字符串字面值了：

```rust
let s = "Hello, world!";
```

这里`s`的类型是`&str`：它是一个指向二进制程序特定位置的 slice。这也就是为什么字符串字面值是不可变的；`&str`是一个不可变引用。

#### 字符串 slice 作为参数

在知道了能够获取字面值和`String`的 slice 后引起了另一个对`first_word`的改进，这是它的签名：

```rust,ignore
fn first_word(s: &String) -> &str {
```

相反一个更有经验的 Rustacean 会写下如下这一行，因为它使得可以对`String`和`&str`使用相同的函数：

```rust,ignore
fn first_word(s: &str) -> &str {
```

如果有一个字符串 slice，可以直接传递它。如果有一个`String`，则可以传递整个`String`的 slice。定义一个获取字符串 slice 而不是字符串引用的函数使得我们的 API 更加通用并且不会丢失任何功能：

<span class="filename">Filename: src/main.rs</span>

```rust
# fn first_word(s: &str) -> &str {
#     let bytes = s.as_bytes();
#
#     for (i, &item) in bytes.iter().enumerate() {
#         if item == b' ' {
#             return &s[0..i];
#         }
#     }
#
#     &s[..]
# }
fn main() {
    let my_string = String::from("hello world");

    // first_word works on slices of `String`s
    let word = first_word(&my_string[..]);

    let my_string_literal = "hello world";

    // first_word works on slices of string literals
    let word = first_word(&my_string_literal[..]);

    // since string literals *are* string slices already,
    // this works too, without the slice syntax!
    let word = first_word(my_string_literal);
}
```

### 其他 slice

字符串 slice，正如你想象的那样，是针对字符串的。不过也有更通用的 slice 类型。考虑一下这个数组：

```rust
let a = [1, 2, 3, 4, 5];
```

就跟我们想要获取字符串的一部分那样，我们也会想要引用数组的一部分，而我们可以这样做：

```rust
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];
```

这个 slice 的类型是`&[i32]`。它跟以跟字符串 slice 一样的方式工作，通过储存第一个元素的引用和一个长度。你可以对其他所有类型的集合使用这类 slice。第八章讲到 vector 时会详细讨论这些集合。

## 总结

所有权、借用和 slice 这些概念是 Rust 何以在编译时保障内存安全的关键所在。Rust 像其他系统编程语言那样给予你对内存使用的控制，但拥有数据所有者在离开作用域后自动清除其数据的功能意味着你无须额外编写和调试相关的控制代码。

所有权系统影响了 Rust 中其他很多部分如何工作，所以我们会继续讲到这些概念，贯穿本书的余下内容。让我们开始下一个章节，来看看如何将多份数据组合进一个`struct`中。