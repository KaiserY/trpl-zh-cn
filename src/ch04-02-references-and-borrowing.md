## 引用与借用

> [ch04-02-references-and-borrowing.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch04-02-references-and-borrowing.md)
> <br>
> commit aa493fef8630e3eee865167892666569afbbc2aa

上一部分结尾的元组代码有这样一个问题：我们不得不将 `String` 返回给调用函数，以便仍能在调用 `calculate_length` 后使用 `String`，因为 `String` 被移动到了 `calculate_length` 内。

下面是如何定义并使用一个（新的）`calculate_length` 函数，它以一个对象的 **引用** 作为参数而不是获取值的所有权：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

首先，注意变量声明和函数返回值中的所有元组代码都消失了。其次，注意我们传递 `&s1` 给 `calculate_length`，同时在函数定义中，我们获取 `&String` 而不是 `String`。

这些 & 符号就是 **引用**，他们允许你使用值但不获取其所有权。图 4-5 展示了一个图解。

<img alt="&String s pointing at String s1" src="img/trpl04-05.svg" class="center" />

<span class="caption">图 4-8：`&String s` 指向 `String s1`</span>

> 注意：与使用 `&` 引用相对的操作是 **解引用**（*dereferencing*），它使用解引用运算符，`*`。我们将会在第八章遇到一些解引用运算符，并在第十五章详细讨论解引用。

仔细看看这个函数调用：

```rust
# fn calculate_length(s: &String) -> usize {
#     s.len()
# }
let s1 = String::from("hello");

let len = calculate_length(&s1);
```

`&s1` 语法允许我们创建一个 **指向** 值 `s1` 的引用，但是并不拥有它。因为并不拥有这个值，当引用离开作用域时其指向的值也不会被丢弃。

同理，函数签名使用了 `&` 来表明参数 `s` 的类型是一个引用。让我们增加一些解释性的注解：

```rust
fn calculate_length(s: &String) -> usize { // s is a reference to a String
    s.len()
} // Here, s goes out of scope. But because it does not have ownership of what
  // it refers to, nothing happens.
```

变量 `s` 有效的作用域与函数参数的作用域一样，不过当引用离开作用域后并不丢弃它指向的数据，因为我们没有所有权。函数使用引用而不是实际值作为参数意味着无需返回值来交还所有权，因为就不曾拥有所有权。

我们将获取引用作为函数参数称为 **借用**（*borrowing*）。正如现实生活中，如果一个人拥有某样东西，你可以从他那里借来。当你使用完毕，必须还回去。

如果我们尝试修改借用的变量呢？尝试示例 4-4 中的代码。剧透：这行不通！

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let s = String::from("hello");

    change(&s);
}

fn change(some_string: &String) {
    some_string.push_str(", world");
}
```

<span class="caption">示例 4-9：尝试修改借用的值</span>

这里是错误：

```text
error[E0596]: cannot borrow immutable borrowed content `*some_string` as mutable
 --> error.rs:8:5
  |
7 | fn change(some_string: &String) {
  |                        ------- use `&mut String` here to make mutable
8 |     some_string.push_str(", world");
  |     ^^^^^^^^^^^ cannot borrow as mutable
```

正如变量默认是不可变的，引用也一样。（默认）不允许修改引用的值。

### 可变引用

可以通过一个小调整来修复在示例 4-4 代码中的错误：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let mut s = String::from("hello");

    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

首先，必须将 `s` 改为 `mut`。然后必须创建一个可变引用 `&mut s` 和接受一个可变引用，`some_string: &mut String`。

不过可变引用有一个很大的限制：在特定作用域中的特定数据有且只有一个可变引用。这些代码会失败：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
let mut s = String::from("hello");

let r1 = &mut s;
let r2 = &mut s;
```

错误如下：

```text
error[E0499]: cannot borrow `s` as mutable more than once at a time
 --> borrow_twice.rs:5:19
  |
4 |     let r1 = &mut s;
  |                   - first mutable borrow occurs here
5 |     let r2 = &mut s;
  |                   ^ second mutable borrow occurs here
6 | }
  | - first borrow ends here
```

这个限制允许可变性，不过是以一种受限制的方式允许。新 Rustacean 们经常与此作斗争，因为大部分语言中变量任何时候都是可变的。这个限制的好处是 Rust 可以在编译时就避免数据竞争。

**数据竞争**（*data race*）是一种特定类型的竞争状态，它可由这三个行为造成：

1. 两个或更多指针同时访问同一数据。
2. 至少有一个这样的指针被用来写入数据。
3. 不存在同步数据访问的机制。

数据竞争会导致未定义行为，难以在运行时追踪，并且难以诊断和修复；Rust 避免了这种情况的发生，因为它甚至不会编译存在数据竞争的代码！

一如既往，可以使用大括号来创建一个新的作用域来允许拥有多个可变引用，只是不能 **同时** 拥有：

```rust
let mut s = String::from("hello");

{
    let r1 = &mut s;

} // r1 goes out of scope here, so we can make a new reference with no problems.

let r2 = &mut s;
```

当结合可变和不可变引用时有一个类似的规则存在。这些代码会导致一个错误：

```rust,ignore
let mut s = String::from("hello");

let r1 = &s; // no problem
let r2 = &s; // no problem
let r3 = &mut s; // BIG PROBLEM
```

错误如下：

```text
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as
immutable
 --> borrow_thrice.rs:6:19
  |
4 |     let r1 = &s; // no problem
  |               - immutable borrow occurs here
5 |     let r2 = &s; // no problem
6 |     let r3 = &mut s; // BIG PROBLEM
  |                   ^ mutable borrow occurs here
7 | }
  | - immutable borrow ends here
```

哇哦！我们 **也** 不能在拥有不可变引用的同时拥有可变引用。不可变引用的用户可不希望在它的眼皮底下值突然就被改变了！然而，多个不可变引用是没有问题的因为没有哪个只能读取数据的人有能力影响其他人读取到的数据。

尽管这些错误有时使人沮丧，但请牢记这是 Rust 编译器在提早指出一个潜在的 bug（在编译时而不是运行时）并明确告诉你问题在哪，而不是任由你去追踪为何有时数据并不是你想象中的那样。

### 悬垂引用（Dangling References）

在存在指针的语言中，容易通过释放内存时保留指向它的指针而错误地生成一个 **悬垂指针**（*dangling pointer*），所谓悬垂指针是其指向的内存可能已经被分配给其它持有者。相比之下，在 Rust 中编译器确保引用永远也不会变成悬垂状态：当我们拥有一些数据的引用，编译器确保数据不会在其引用之前离开作用域。

让我们尝试创建一个悬垂引用，Rust 会通过一个编译时错误来避免：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");

    &s
}
```

这里是错误：

```text
error[E0106]: missing lifetime specifier
 --> dangle.rs:5:16
  |
5 | fn dangle() -> &String {
  |                ^ expected lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is
  no value for it to be borrowed from
  = help: consider giving it a 'static lifetime
```

错误信息引用了一个我们还未涉及到的功能：**生命周期**（*lifetimes*）。第十章会详细介绍生命周期。不过，如果你不理会生命周期的部分，错误信息确实包含了为什么代码是有问题的关键：

```text
this function's return type contains a borrowed value, but there is no value
for it to be borrowed from.
```

让我们仔细看看我们的 `dangle` 代码的每一步到底发生了什么：

```rust,ignore
fn dangle() -> &String { // dangle returns a reference to a String

    let s = String::from("hello"); // s is a new String

    &s // we return a reference to the String, s
} // Here, s goes out of scope, and is dropped. Its memory goes away.
  // Danger!
```

因为 `s` 是在 `dangle` 函数内创建的，当 `dangle` 的代码执行完毕后，`s` 将被释放。不过我们尝试返回一个它的引用。这意味着这个引用会指向一个无效的 `String`！这可不对。Rust 不会允许我们这么做的。

这里的解决方法是直接返回 `String`：

```rust
fn no_dangle() -> String {
    let s = String::from("hello");

    s
}
```

这样就可以没有任何错误的运行了。所有权被移动出去，所以没有值被释放。

### 引用的规则

让我们简要的概括一下之前对引用的讨论：

1. 在任意给定时间，**只能** 拥有如下中的一个：
  * 一个可变引用。
  * 任意数量的不可变引用。
2. 引用必须总是有效的。

接下来，我们来看看另一种不同类型的引用：slice。
