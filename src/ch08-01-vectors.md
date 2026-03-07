## 使用 Vector 储存列表

[ch08-01-vectors.md](https://github.com/rust-lang/book/blob/2581c23b669eff30c26e036a13475ec5cf70c1b8/src/ch08-01-vectors.md)

我们要讨论的第一种集合类型是 `Vec<T>`，也被称为 *vector*。vector 允许你在单个数据结构中存放多个值，并把这些值在内存中彼此相邻地排列起来。vector 只能存储相同类型的值。当你有一组项目要处理时，它就很有用，例如文件中的文本行，或者购物车中商品的价格。

### 新建 vector

要创建一个新的空 vector，可以调用 `Vec::new` 函数，如示例 8-1 所示。

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-01/src/main.rs:here}}
```

<span class="caption">示例 8-1：新建一个空的 vector 来储存 `i32` 类型的值</span>

注意，这里我们加了一个类型注解。因为还没有往这个 vector 里插入任何值，Rust 并不知道我们打算存储什么类型的元素。这一点很重要。vector 是使用泛型实现的；第十章会讲到如何在你自己的类型上使用泛型。现在你只需要知道，标准库提供的 `Vec<T>` 类型可以容纳任意类型。当我们创建一个用来存放特定类型的 vector 时，可以在尖括号中指定这个类型。在示例 8-1 中，我们告诉 Rust，`v` 中的 `Vec<T>` 将存放 `i32` 类型的元素。

更常见的情况是，我们会用初始值创建 `Vec<T>`，而 Rust 会推断出你想存储的值的类型，所以很少需要写这种类型注解。Rust 还很贴心地提供了 `vec!` 宏，它会创建一个新的 vector，并把你提供的值放进去。示例 8-2 创建了一个包含 `1`、`2` 和 `3` 的新 `Vec<i32>`。这里的整数类型之所以是 `i32`，是因为它是默认整数类型，正如我们在第三章的[“数据类型”][data-types]部分讨论过的那样：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-02/src/main.rs:here}}
```

<span class="caption">示例 8-2：新建一个包含初值的 vector</span>

因为我们给出了 `i32` 类型的初始值，Rust 可以推断出 `v` 的类型是 `Vec<i32>`，因此这里不需要类型注解。接下来看看如何修改 vector。

### 更新 vector

要先创建一个 vector 再向其中添加元素，可以使用 `push` 方法，如示例 8-3 所示：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-03/src/main.rs:here}}
```

<span class="caption">示例 8-3：使用 `push` 方法向 vector 增加值</span>

和任何变量一样，如果想修改它的值，就必须像第三章讲过的那样，使用 `mut` 关键字让它变成可变的。放进去的数字都是 `i32` 类型，Rust 会从数据中推断出这一点，因此也不需要写 `Vec<i32>` 注解。

### 读取 vector 的元素

有两种方式可以引用 vector 中存储的值：通过索引，或者使用 `get` 方法。在接下来的示例中，为了更清楚地说明这一点，我们给这些函数返回的值标注了类型。

示例 8-4 展示了访问 vector 中某个值的两种方式：索引语法和 `get` 方法。

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-04/src/main.rs:here}}
```

<span class="caption">示例 8-4：使用索引语法或 `get` 方法来访问 vector 中的项</span>

这里有几个细节需要注意。我们用索引值 `2` 获取第三个元素，因为 vector 的索引是从 0 开始的。使用 `&` 和 `[]` 会得到索引位置处元素的引用。当我们把索引作为参数传给 `get` 方法时，会得到一个可以与 `match` 一起使用的 `Option<&T>`。

Rust 提供这两种引用元素的方式，是为了让你可以选择：当尝试使用超出已有元素范围的索引值时，程序该如何表现。举个例子，假设我们有一个包含 5 个元素的 vector，然后尝试分别用这两种技术访问索引 100 处的元素，看看会发生什么，如示例 8-5 所示：

```rust,should_panic,panics
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-05/src/main.rs:here}}
```

<span class="caption">示例 8-5：尝试访问一个包含 5 个元素的 vector 的索引 100 处的元素</span>

运行这段代码时，第一种 `[]` 方法会让程序 panic，因为它引用了一个不存在的元素。当你希望程序在有人尝试访问 vector 末尾之外的元素时直接崩溃，这种方式就很合适。

当传给 `get` 方法的索引超出了 vector 的范围时，它不会 panic，而是返回 `None`。如果在正常情况下，访问超出 vector 范围的元素偶尔是可能发生的，那么你就会使用这种方法。此时你的代码可以像第六章讨论过的那样，处理 `Some(&element)` 和 `None` 两种情况。例如，索引可能来自用户输入的数字。如果用户不小心输入了一个过大的数字，程序就会得到 `None`，这时你可以告诉用户当前 vector 中有多少项，并给他们一次重新输入有效值的机会。这就比因为一个输入错误而让程序崩溃更友好。

当程序拿到了一个有效引用后，借用检查器会应用所有权和借用规则（第四章讲过），来确保这个对 vector 内容的引用以及其他任何引用都保持有效。回忆一下那条规则：在同一作用域中，不能同时拥有可变引用和不可变引用。这条规则就适用于示例 8-6：我们持有了 vector 第一个元素的不可变引用，然后又尝试在 vector 末尾添加一个元素。如果还想在函数后面继续使用那个元素，这个程序就无法通过编译：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-06/src/main.rs:here}}
```

<span class="caption">示例 8-6：尝试在拥有 vector 中项的引用的同时向其增加一个元素</span>

编译会给出这个错误：

```console
{{#include ../listings/ch08-common-collections/listing-08-06/output.txt}}
```

示例 8-6 中的代码看起来似乎应该能工作：为什么对第一个元素的引用，会在乎 vector 末尾发生的变化呢？这是由 vector 的工作方式决定的。因为 vector 会把值彼此相邻地存放在内存中，所以如果末尾追加一个新元素，而当前存放位置又没有足够空间容纳所有元素，程序就可能需要分配一块新内存，并把旧元素复制到新空间里去。在这种情况下，原来指向第一个元素的引用就会指向已释放的内存。借用规则正是为了防止程序陷入这种情况。

> 注意：如果想了解 `Vec<T>` 类型更多的实现细节，请参阅 [“The Rustonomicon”][nomicon]。

### 遍历 vector 中的元素

如果想依次访问 vector 中的每个元素，我们会遍历所有元素，而不是一次只通过索引访问一个。示例 8-7 展示了如何使用 `for` 循环，获取一个装有 `i32` 值的 vector 中每个元素的不可变引用，并把它们打印出来：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-07/src/main.rs:here}}
```

<span class="caption">示例 8-7：通过 `for` 循环遍历 vector 的元素并打印</span>

我们也可以遍历可变 vector 中每个元素的可变引用，从而修改所有元素。示例 8-8 中的 `for` 循环会给每个元素都加上 `50`：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-08/src/main.rs:here}}
```

<span class="caption">示例 8-8：遍历 vector 中元素的可变引用</span>

要修改可变引用所指向的值，在使用 `+=` 运算符前，必须先使用解引用运算符 `*` 取到 `i` 指向的值。第十五章的[“追踪引用的值”][deref]部分会更详细地讨论解引用运算符。

由于借用检查器的规则，不管是可变还是不可变地遍历 vector，都是安全的。如果我们尝试在示例 8-7 和示例 8-8 的 `for` 循环体内插入或删除项，就会得到一个和示例 8-6 类似的编译错误。`for` 循环持有的那个对 vector 的引用，会阻止对整个 vector 的同时修改。

### 使用枚举来储存多种类型

vector 只能存储相同类型的值。这可能会带来不便；确实有些场景需要存放一组不同类型的值。幸运的是，枚举的各个变体都定义在同一个枚举类型之下，所以当我们需要用一个类型来表示不同种类的元素时，就可以定义并使用枚举！

例如，假设我们想从电子表格的一行中读取值，而这一行中有些列包含整数，有些包含浮点数，还有些是字符串。我们可以定义一个枚举，让它的各个变体分别持有这些不同类型的值，而所有这些枚举变体都会被视为同一种类型，也就是该枚举本身的类型。然后，我们就可以创建一个存放这种枚举的 vector，从而最终在其中保存不同类型的值。示例 8-9 展示了这种做法：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-09/src/main.rs:here}}
```

<span class="caption">示例 8-9：定义一个枚举，以便能在 vector 中存放不同类型的数据</span>

Rust 必须在编译时知道 vector 中会有哪些类型，这样它才能准确知道在堆上存储每个元素需要多少内存。我们还必须明确指出这个 vector 允许哪些类型。如果 Rust 允许 vector 存放任意类型，那么在对 vector 元素执行操作时，就有可能因为某一种或多种类型而导致错误。使用枚举再配合 `match` 表达式，意味着 Rust 会像第六章所说的那样，在编译时确保每一种可能的情况都得到了处理。

如果在编写程序时，你并不知道运行时究竟会有哪些类型需要存进 vector，那么这种枚举技巧就不适用了。相反，你可以使用 trait 对象，第 18 章会讲到它。

现在我们已经讨论了一些最常见的 vector 用法，记得去看看标准库为 `Vec<T>` 定义的许多其他实用方法的 [API 文档][vec-api]。例如，除了 `push` 之外，还有一个 `pop` 方法会移除并返回 vector 的最后一个元素。

### 丢弃 vector 时也会丢弃其所有元素

和其他任何 `struct` 一样，vector 会在离开作用域时被释放，如示例 8-10 所标示的那样：

```rust
{{#rustdoc_include ../listings/ch08-common-collections/listing-08-10/src/main.rs:here}}
```

<span class="caption">示例 8-10：展示 vector 和其元素于何处被丢弃</span>

当 vector 被丢弃时，它包含的所有内容也都会被一并丢弃，这意味着它持有的整数会被清理掉。借用检查器会确保，对 vector 内容的任何引用都只会在 vector 本身有效时被使用。

让我们继续下一个集合类型：`String`！

[data-types]: ch03-02-data-types.html#数据类型
[nomicon]: https://doc.rust-lang.org/nomicon/vec/vec.html
[vec-api]: https://doc.rust-lang.org/std/vec/struct.Vec.html
[deref]: ch15-02-deref.html#追踪引用的值
