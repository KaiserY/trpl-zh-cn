## 闭包：可以捕获环境的匿名函数

> [ch13-01-closures.md](https://github.com/rust-lang/book/blob/main/src/ch13-01-closures.md)
> <br>
> commit 8acef6cfd40a36be60a3c62458d9f78e2427e190

Rust 的 **闭包**（*closures*）是可以保存在一个变量中或作为参数传递给其他函数的匿名函数。可以在一个地方创建闭包，然后在不同的上下文中执行闭包运算。不同于函数，闭包允许捕获被定义时所在作用域中的值。我们将展示闭包的这些功能如何复用代码和自定义行为。

### 闭包会捕获其环境

我们首先了解如何通过闭包捕获定义它的环境中的值以便之后使用。考虑如下场景：有时 T 恤公司会赠送限量版 T 恤给邮件列表中的成员作为促销。邮件列表中的成员可以选择将他们的喜爱的颜色添加到个人信息中。如果被选中的成员设置了喜爱的颜色，他们将获得那个颜色的 T 恤。如果他没有设置喜爱的颜色，他们会获赠公司现存最多的颜色的款式。

有很多种方式来实现这些。例如，使用有 `Red` 和 `Blue` 两个成员的 `ShirtColor` 枚举（出于简单考虑限定为两种颜色）。我们使用 `Inventory` 结构体来代表公司的库存，它有一个类型为 `Vec<ShirtColor>` 的 `shirts` 字段表示库存中的衬衫的颜色。`Inventory` 上定义的 `giveaway` 方法获取免费衬衫得主所喜爱的颜色（如有），并返回其获得的衬衫的颜色。初始代码如示例 13-1 所示：

<span class="filename">文件名： src/main.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-01/src/main.rs}}
```

<span class="caption">示例 13-1：衬衫公司赠送场景</span>

`main` 函数中定义的 `store` 还剩有两件蓝衬衫和一件红衬衫可在限量版促销活动中赠送。我们用一个期望获得红衬衫和一个没有期望的用户来调用 `giveaway` 方法。

这段代码也可以有多种实现方法。这里为了专注于闭包，我们会坚持使用已经学习过的概念，除了 `giveaway` 方法体中使用了闭包。`giveaway` 方法获取了 `Option<ShirtColor>` 类型作为用户的期望颜色并在 `user_preference` 上调用 `unwrap_or_else` 方法。 [`Option<T>` 上的方法 `unwrap_or_else`][unwrap-or-else] 由标准库定义，它获取一个没有参数、返回值类型为 `T` （与 `Option<T>` 的 `Some` 成员所存储的值的类型一样，这里是 `ShirtColor`）的闭包作为参数。如果 `Option<T>` 是 `Some` 成员，则 `unwrap_or_else`  返回 `Some` 中的值。 如果 `Option<T>` 是 `None`  成员, 则 `unwrap_or_else`  调用闭包并返回闭包的返回值。

我们将被闭包表达式 `|| self.most_stocked()`  用作 `unwrap_or_else` 的参数。这是一个本身不获取参数的闭包（如果闭包有参数，它们会出现在两道竖杠之间）。闭包体调用了 `self.most_stocked()`。我们在这里定义了闭包，而 `unwrap_or_else` 的实现会在之后需要其结果的时候执行闭包。

运行代码会打印出：

```console
{{#include ../listings/ch13-functional-features/listing-13-01/output.txt}}
```

这里一个有趣的地方是我们传递了一个会在当前 `Inventory` 实例上调用 `self.most_stocked()` 的闭包。标准库并不需要知道我们定义的 `Inventory` 或 `ShirtColor` 类型或是在这个场景下我们想要用的逻辑。闭包捕获了一个 `Inventory` 实例的不可变引用到 `self`，并连同其它代码传递给 `unwrap_or_else` 方法。相比之下，函数就不能以这种方式捕获其环境。

### 闭包类型推断和注解

函数与闭包还有更多区别。闭包并不总是要求像 `fn` 函数那样在参数和返回值上注明类型。函数中需要类型注解是因为他们是暴露给用户的显式接口的一部分。严格定义这些接口对保证所有人都对函数使用和返回值的类型理解一致是很重要的。与此相比，闭包并不用于这样暴露在外的接口：他们储存在变量中并被使用，不用命名他们或暴露给库的用户调用。

闭包通常很短，并只关联于小范围的上下文而非任意情境。在这些有限制的上下文中，编译器能可靠地推断参数和返回值的类型，类似于它是如何能够推断大部分变量的类型一样（同时也有编译器需要闭包类型注解的罕见情况）。

类似于变量，如果我们希望增加明确性和清晰度也可以添加类型标注，坏处是使代码变得更啰嗦（相对于严格必要的代码）。为示例 13-1 中定义的闭包标注类型看起来如示例 13-2 中的定义一样。这个例子中，我们定义了一个闭包并将它保存在变量中，而不是像示例 13-1 那样在传参的地方定义它：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-02/src/main.rs:here}}
```

<span class="caption">示例 13-2：为闭包的参数和返回值增加可选的类型注解</span>

有了类型注解闭包的语法就更类似函数了。如下是一个对其参数加一的函数的定义与拥有相同行为闭包语法的纵向对比。这里增加了一些空格来对齐相应部分。这展示了除了使用竖线以及一些可选语法外，闭包语法与函数语法有多么地相似：

```rust,ignore
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

第一行展示了一个函数定义，第二行展示了一个完整标注的闭包定义。第三行闭包定义中省略了类型注解，而第四行去掉了可选的大括号，因为闭包体只有一个表达式。这些都是有效的闭包定义，并在调用时产生相同的行为。调用闭包是 `add_one_v3` 和 `add_one_v4` 能够编译的必要条件，因为类型将从其用法中推断出来。这类似于 `let v = Vec::new();`，Rust 需要类型注解或是某种类型的值被插入到 `Vec` 才能推断其类型。

编译器会为闭包定义中的每个参数和返回值推断一个具体类型。例如，示例 13-3 中展示了仅仅将参数作为返回值的简短的闭包定义。除了作为示例的目的这个闭包并不是很实用。注意这个定义没有增加任何类型注解，所以我们可以用任意类型来调用这个闭包。但是如果尝试调用闭包两次，第一次使用 `String` 类型作为参数而第二次使用 `u32`，则会得到一个错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-03/src/main.rs:here}}
```

<span class="caption">示例 13-8：尝试调用一个被推断为两个不同类型的闭包</span>

编译器给出如下错误：

```console
{{#include ../listings/ch13-functional-features/listing-13-03/output.txt}}
```

第一次使用 `String` 值调用  `example_closure` 时，编译器推断这个闭包中 `x` 的类型以及返回值的类型是 `String`。接着这些类型被锁定进闭包 `example_closure` 中，如果尝试对同一闭包使用不同类型则就会得到类型错误。

### 捕获引用或者移动所有权

闭包可以通过三种方式捕获其环境，它们直接对应到函数获取参数的三种方式：不可变借用，可变借用和获取所有权。闭包会根据函数体中如何使用被捕获的值决定用哪种方式捕获。

在示例 13-4 中定义了一个捕获名为 `list` 的 vector 的不可变引用的闭包，因为只需不可变引用就能打印其值：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-04/src/main.rs}}
```

<span class="caption">示例 13-4：定义并调用一个捕获不可变引用的闭包</span>

这个示例也展示了变量可以绑定一个闭包定义，并且之后可以使用变量名和括号来调用闭包，就像变量名是函数名一样。

因为同时可以有多个 `list` 的不可变引用，所以在闭包定义之前，闭包定义之后调用之前，闭包调用之后代码仍然可以访问 `list`。代码可以编译、运行并打印：

```console
{{#include ../listings/ch13-functional-features/listing-13-04/output.txt}}
```

接下来在示例 13-5 中，我们修改闭包体以便向 `list` vector 增加一个元素。闭包现在捕获一个可变引用：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-05/src/main.rs}}
```

<span class="caption">示例 13-5：定义并调用一个捕获可变引用的闭包</span>

代码可以编译、运行并打印：

```console
{{#include ../listings/ch13-functional-features/listing-13-05/output.txt}}
```

注意在 `borrows_mutably` 闭包的定义和调用之间不再有 `println!`，当 `borrows_mutably` 定义时，它捕获了 `list` 的可变引用。闭包在被调用后就不再被使用，这时可变借用结束。因为当可变借用存在时不允许有其它的借用，所以在闭包定义和调用之间不能有不可变引用来进行打印。可以尝试在这里添加  `println!`  看看你会得到什么报错信息！

即使闭包体不严格需要所有权，如果希望强制闭包获取它用到的环境中值的所有权，可以在参数列表前使用  `move`  关键字。

在将闭包传递到一个新的线程时这个技巧很有用，它可以移动数据所有权给新线程。我们将在 16 章讨论并发时详细讨论线程以及为什么你想要使用它们。现在我们先简单探讨用需要 `move` 关键字的闭包来生成新的线程。示例 13-6 修改了示例 13-4 以便在一个新的线程而非主线程中打印 vector：

文件名：src/main.rs

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-06/src/main.rs}}
```

<span class="caption">示例 13-6：使用 `move` 来强制闭包为线程获取 `list` 的所有权</span>

我们生成了新的线程，给这个线程一个闭包作为参数运行，闭包体打印出列表。在示例 13-4 中，闭包通过不可变引用捕获 `list`，因为这是打印列表所需的最少的访问。这个例子中，尽管闭包体依然只需要不可变引用，我们还是在闭包定义前写上 `move` 关键字来指明 `list` 应当被移动到闭包中。新线程可能在主线程剩余部分执行完前执行完，或者也可能主线程先执行完。如果主线程维护了 `list` 的所有权但却在新线程之前结束并且丢弃了 `list`，则在线程中的不可变引用将失效。因此，编译器要求 `list` 被移动到在新线程中运行的闭包中，这样引用就是有效的。试着去掉 `move` 关键字或在闭包被定义后在主线程中使用 `list` 看看你会得到什么编译器报错！

### [](https://github.com/rust-lang/book/blob/main/src/ch13-01-closures.md#moving-captured-values-out-of-closures-and-the-fn-traits)将被捕获的值移出闭包和 `Fn`  trait

一旦闭包捕获了它被定义的环境中一个值的引用或者所有权（也就影响了什么会被移_进_闭包，如有)，闭包体中的代码定义了稍后在闭包计算时对引用或值如何操作（也就影响了什么会被移_出_闭包，如有）。闭包体可以做以下任何事：将一个捕获的值移出闭包，修改捕获的值，既不移动也不修改值，或者一开始就不从环境中捕获值。

闭包捕获和处理环境中的值的方式影响闭包实现的 trait。Trait 是函数和结构体指定它们能用的的闭包的类型的方式。取决于闭包体如何处理值，闭包自动、渐进地实现一个、两个或三个 `Fn` trait。

1. `FnOnce` 适用于能被调用一次的闭包，所有闭包都至少实现了这个 trait，因为所有闭包都能被调用。一个会将捕获的值移出闭包体的闭包只实现 `FnOnce` trait，这是因为它只能被调用一次。
2. `FnMut` 适用于不会将捕获的值移出闭包体的闭包，但它可能会修改被捕获的值。这类闭包可以被调用多次。
3. `Fn` 适用于既不将被捕获的值移出闭包体也不修改被捕获的值的闭包，当然也包括不从环境中捕获值的闭包。这类闭包可以被调用多次而不改变它们的环境，这在会多次并发调用闭包的场景中十分重要。

让我们来看示例 13-1 中使用的在 `Option<T>` 上的 `unwrap_or_else` 方法的定义：

impl<T> Option<T> {
    pub fn unwrap_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T
    {
        match self {
            Some(x) => x,
            None => f(),
        }
    }
}

回忆 `T` 是表示 `Option` 中 `Some`  成员中的值的类型的范型。类型 `T`  也是 `unwrap_or_else`  函数的返回值类型：举例来说，在 `Option<String>` 上调用 `unwrap_or_else` 会得到一个 `String`。

接着注意到 `unwrap_or_else`  函数有额外的范型参数 `F`。 `F` 是 `f` 参数（即调用 `unwrap_or_else` 时提供的闭包）的类型。

范型 `F` 的 trait bound 是 `FnOnce() -> T`，这意味着 `F` 必须能够被调用一次，没有参数并返回一个 `T`。在 trait bound 中使用 `FnOnce`  表示 `unwrap_or_else` 将最多调用  `f` 一次。 在 `unwrap_or_else` 的函数体中可以看到，如果 `Option` 是 `Some`，`f`  不会被调用。如果 `Option` 是 `None`，`f`  将会被调用一次。由于所有的闭包都实现了 `FnOnce`， `unwrap_or_else` 能接收绝大多数不同类型的闭包，十分灵活。

> 注意：函数也可以实现所有的三种 `Fn`  traits。 如果我们要做的事情不需要从环境中捕获值，则可以在需要某种实现了 `Fn`  trait 的东西时使用函数而不是闭包。举个例子，可以在 `Option<Vec<T>>`  的值上调用 `unwrap_or_else(Vec::new)` 以便在值为 `None` 时获取一个新的空的 vector。

现在让我们来看定义在 slice 上的标准库方法 `sort_by_key`，看看它与 `unwrap_or_else` 的区别以及为什么 `sort_by_key` 使用  `FnMut`  而不是 `FnOnce` trait bound。这个闭包以一个 slice 中当前被考虑的元素的引用作为参数，返回一个可以用来排序的 `K` 类型的值。当你想按照 slice 中元素的某个属性来进行排序时这个函数很有用。在示例 13-7 中有一个 `Rectangle` 实例的列表，我们使用 `sort_by_key`  按 `Rectangle` 的  `width`  属性对它们从低到高排序：

<span class="filename">文件名：src/main.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-07/src/main.rs}}
```

<span class="caption">示例 13-7：使用  `sort_by_key` 对长方形按宽度排序</span>

代码输出：

```console
{{#include ../listings/ch13-functional-features/listing-13-07/output.txt}}
```

`sort_by_key`  被定义为接收一个 `FnMut` 闭包的原因是它会多次调用这个闭包：每个 slice 中的元素调用一次。闭包 `|r| r.width` 不捕获、修改或将任何东西移出它的环境，所以它满足 trait bound 的要求。

作为对比，示例 13-8 展示了一个只实现了  `FnOnce`  trait 的闭包（因为它从环境中移出了一个值）的例子。编译器不允许我们在 `sort_by_key` 上使用这个闭包：

<span class="filename">文件名：src/main.rs</span>

{{#rustdoc_include ../listings/ch13-functional-features/listing-13-08/src/main.rs}}

<span class="caption">示例 13-8：尝试在 `sort_by_key` 上使用一个 `FnOnce`  闭包</span>

这是一个刻意构造的、繁琐的方式，它尝试统计 `sort_by_key` 在排序 `list` 时被调用的次数（并不能工作）。该代码尝试在闭包的环境中向 `sort_operations` vector 放入 `value`— 一个  `String`  来实现计数。闭包捕获了 `value` 然后通过转移 `value` 的所有权的方式将其移出闭包给到 `sort_operations` vector。这个闭包可以被调用一次；尝试调用它第二次将报错，因为这时  `value` 已经不在闭包的环境中，因而无法被再次放到 `sort_operations` 中！因而，这个闭包只实现了 `FnOnce`。由于要求闭包必须实现 `FnMut`，因此尝试编译这个代码将得到报错：`value`  不能被移出闭包：

```console
{{#include ../listings/ch13-functional-features/listing-13-08/output.txt}}
```

报错指向了闭包体中将 `value` 移出环境的那一行。要修复这里，我们需要改变闭包体让它不将值移出环境。在环境中保持一个计数器并在闭包体中增加它的值是计算 `sort_by_key` 被调用次数的一个更简单直接的方法。示例 13-9 中的闭包可以在 `sort_by_key` 中使用，因为它只捕获了 `num_sort_operations` 计数器的可变引用，这就可以被调用多次。

<span class="filename">文件名：src/main.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-09/src/main.rs}}
```

<span class="caption">示例 13-9：允许在 `sort_by_key` 上使用一个  `FnMut`  闭包</span>

当定义或使用用到闭包的函数或类型时，`Fn`  trait 十分重要。在下个小节中，我们将会讨论迭代器。许多迭代器方法都接收闭包参数，因而在继续前先下住这些闭包的细节！
 










在健身计划生成器的例子中，我们只将闭包作为内联匿名函数来使用。不过闭包还有另一个函数所没有的功能：他们可以捕获其环境并访问其被定义的作用域的变量。

示例 13-12 有一个储存在 `equal_to_x` 变量中闭包的例子，它使用了闭包环境中的变量 `x`：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-12/src/main.rs}}
```

<span class="caption">示例 13-12：一个引用了其周围作用域中变量的闭包示例</span>

这里，即便 `x` 并不是 `equal_to_x` 的一个参数，`equal_to_x` 闭包也被允许使用变量 `x`，因为它与 `equal_to_x` 定义于相同的作用域。

函数则不能做到同样的事，如果尝试如下例子，它并不能编译：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/no-listing-02-functions-cant-capture/src/main.rs}}
```

这会得到一个错误：

```console
{{#include ../listings/ch13-functional-features/no-listing-02-functions-cant-capture/output.txt}}
```

编译器甚至会提示我们这只能用于闭包！

当闭包从环境中捕获一个值，闭包会在闭包体中储存这个值以供使用。这会使用内存并产生额外的开销，在更一般的场景中，当我们不需要闭包来捕获环境时，我们不希望产生这些开销。因为函数从未允许捕获环境，定义和使用函数也就从不会有这些额外开销。

闭包可以通过三种方式捕获其环境，他们直接对应函数的三种获取参数的方式：获取所有权，可变借用和不可变借用。这三种捕获值的方式被编码为如下三个 `Fn` trait：

* `FnOnce` 消费从周围作用域捕获的变量，闭包周围的作用域被称为其 **环境**，*environment*。为了消费捕获到的变量，闭包必须获取其所有权并在定义闭包时将其移动进闭包。其名称的 `Once` 部分代表了闭包不能多次获取相同变量的所有权的事实，所以它只能被调用一次。
* `FnMut` 获取可变的借用值所以可以改变其环境
* `Fn` 从其环境获取不可变的借用值

当创建一个闭包时，Rust 根据其如何使用环境中变量来推断我们希望如何引用环境。由于所有闭包都可以被调用至少一次，所以所有闭包都实现了 `FnOnce` 。那些并没有移动被捕获变量的所有权到闭包内的闭包也实现了 `FnMut` ，而不需要对被捕获的变量进行可变访问的闭包则也实现了 `Fn` 。在示例 13-12 中，`equal_to_x` 闭包不可变的借用了 `x`（所以 `equal_to_x` 具有 `Fn` trait），因为闭包体只需要读取 `x` 的值。

如果你希望强制闭包获取其使用的环境值的所有权，可以在参数列表前使用 `move` 关键字。这个技巧在将闭包传递给新线程以便将数据移动到新线程中时最为实用。

> 注意：即使其捕获的值已经被移动了，`move` 闭包仍需要实现 `Fn` 或 `FnMut`。这是因为闭包所实现的 trait 是由闭包所捕获了什么值而不是如何捕获所决定的。而 `move` 关键字仅代表了后者。

第十六章讨论并发时会展示更多 `move` 闭包的例子，不过现在这里修改了示例 13-12 中的代码（作为演示），在闭包定义中增加 `move` 关键字并使用 vector 代替整型，因为整型可以被拷贝而不是移动；注意这些代码还不能编译：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/no-listing-03-move-closures/src/main.rs}}
```

这个例子并不能编译，会产生以下错误：

```console
{{#include ../listings/ch13-functional-features/no-listing-03-move-closures/output.txt}}
```

`x` 被移动进了闭包，因为闭包使用 `move` 关键字定义。接着闭包获取了 `x` 的所有权，同时 `main` 就不再允许在 `println!` 语句中使用 `x` 了。去掉 `println!` 即可修复问题。

大部分需要指定一个 `Fn` 系列 trait bound 的时候，可以从 `Fn` 开始，而编译器会根据闭包体中的情况告诉你是否需要 `FnMut` 或 `FnOnce`。

为了展示闭包作为函数参数时捕获其环境的作用，让我们继续下一个主题：迭代器。

### 使用闭包创建行为的抽象

让我们来看一个存储稍后要执行的闭包的示例。其间我们会讨论闭包的语法、类型推断和 trait。

考虑一下这个假定的场景：我们在一个通过 app 生成自定义健身计划的初创企业工作。其后端使用 Rust 编写，而生成健身计划的算法需要考虑很多不同的因素，比如用户的年龄、身体质量指数（Body Mass Index）、用户喜好、最近的健身活动和用户指定的强度系数。本例中实际的算法并不重要，重要的是这个计算只花费几秒钟。我们只希望在需要时调用算法，并且只希望调用一次，这样就不会让用户等得太久。

这里将通过调用 `simulated_expensive_calculation` 函数来模拟调用假定的算法，如示例 13-1 所示，它会打印出 `calculating slowly...`，等待两秒，并接着返回传递给它的数字：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-01/src/main.rs:here}}
```

<span class="caption">示例 13-1：一个用来代替假定计算的函数，它大约会执行两秒钟</span>

接下来，`main` 函数中将会包含本例的健身 app 中的重要部分。这代表当用户请求健身计划时 app 会调用的代码。因为与 app 前端的交互与闭包的使用并不相关，所以我们将硬编码代表程序输入的值并打印输出。

所需的输入有这些：

* 一个来自用户的 intensity 数字，请求健身计划时指定，它代表用户喜好低强度还是高强度健身。
* 一个随机数，其会在健身计划中生成变化。

程序的输出将会是建议的锻炼计划。示例 13-2 展示了我们将要使用的 `main` 函数：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-02/src/main.rs:here}}
```

<span class="caption">示例 13-2：`main` 函数包含了用于 `generate_workout` 函数的模拟用户输入和模拟随机数输入</span>

出于简单考虑这里硬编码了 `simulated_user_specified_value` 变量的值为 10 和 `simulated_random_number` 变量的值为 7；一个实际的程序会从 app 前端获取强度系数并使用 `rand` crate 来生成随机数，正如第二章的猜猜看游戏所做的那样。`main` 函数使用模拟的输入值调用 `generate_workout` 函数：

现在有了执行上下文，让我们编写算法。示例 13-3 中的 `generate_workout` 函数包含本例中我们最关心的 app 业务逻辑。本例中余下的代码修改都将在这个函数中进行：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-03/src/main.rs:here}}
```

<span class="caption">示例 13-3：程序的业务逻辑，它根据输入并调用 `simulated_expensive_calculation` 函数来打印出健身计划</span>

示例 13-3 中的代码有多处调用了慢计算函数 `simulated_expensive_calculation` 。第一个 `if` 块调用了 `simulated_expensive_calculation` 两次， `else` 中的 `if` 没有调用它，而第二个 `else` 中的代码调用了它一次。

`generate_workout` 函数的期望行为是首先检查用户需要低强度（由小于 25 的系数表示）锻炼还是高强度（25 或以上）锻炼。

低强度锻炼计划会根据由 `simulated_expensive_calculation` 函数所模拟的复杂算法建议一定数量的俯卧撑和仰卧起坐。

如果用户需要高强度锻炼，这里有一些额外的逻辑：如果 app 生成的随机数刚好是 3，app 相反会建议用户稍做休息并补充水分。如果不是，则用户会从复杂算法中得到数分钟跑步的高强度锻炼计划。

现在这份代码能够应对我们的需求了，但数据科学部门的同学告知我们将来会对调用 `simulated_expensive_calculation` 的方式做出一些改变。为了在要做这些改动的时候简化更新步骤，我们将重构代码来让它只调用 `simulated_expensive_calculation` 一次。同时还希望去掉目前多余的连续两次函数调用，并不希望在计算过程中增加任何其他此函数的调用。也就是说，我们不希望在完全无需其结果的情况调用函数，不过仍然希望只调用函数一次。

#### 使用函数重构

有多种方法可以重构此程序。我们首先尝试的是将重复的 `simulated_expensive_calculation` 函数调用提取到一个变量中，如示例 13-4 所示：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-04/src/main.rs:here}}
```

<span class="caption">示例 13-4：将 `simulated_expensive_calculation` 调用提取到一个位置，并将结果储存在变量 `expensive_result` 中</span>

这个修改统一了 `simulated_expensive_calculation` 调用并解决了第一个 `if` 块中不必要的两次调用函数的问题。不幸的是，现在所有的情况下都需要调用函数并等待结果，包括那个完全不需要这一结果的内部 `if` 块。

我们希望在 `generate_workout` 中只引用 `simulated_expensive_calculation` 一次，并推迟复杂计算的执行直到我们确实需要结果的时候。这正是闭包的用武之地！

#### 重构使用闭包储存代码

不同于总是在 `if` 块之前调用 `simulated_expensive_calculation` 函数并储存其结果，我们可以定义一个闭包并将其储存在变量中，如示例 13-5 所示。实际上可以选择将整个 `simulated_expensive_calculation` 函数体移动到这里引入的闭包中：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-05/src/main.rs:here}}
```

<span class="caption">示例 13-5：定义一个闭包并储存到变量 `expensive_closure` 中</span>

闭包定义是 `expensive_closure` 赋值的 `=` 之后的部分。闭包的定义以一对竖线（`|`）开始，在竖线中指定闭包的参数；之所以选择这个语法是因为它与 Smalltalk 和 Ruby 的闭包定义类似。这个闭包有一个参数 `num`；如果有多于一个参数，可以使用逗号分隔，比如 `|param1, param2|`。

参数之后是存放闭包体的大括号 —— 如果闭包体只有一行则大括号是可以省略的。大括号之后闭包的结尾，需要用于 `let` 语句的分号。因为闭包体的最后一行没有分号（正如函数体一样），所以闭包体（`num`）最后一行的返回值作为调用闭包时的返回值。

注意这个 `let` 语句意味着 `expensive_closure` 包含一个匿名函数的 **定义**，不是调用匿名函数的 **返回值**。回忆一下使用闭包的原因是我们需要在一个位置定义代码，储存代码，并在之后的位置实际调用它；期望调用的代码现在储存在 `expensive_closure` 中。

定义了闭包之后，可以改变 `if` 块中的代码来调用闭包以执行代码并获取结果值。调用闭包类似于调用函数；指定存放闭包定义的变量名并后跟包含期望使用的参数的括号，如示例 13-6 所示：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-06/src/main.rs:here}}
```

<span class="caption">示例 13-6：调用定义的 `expensive_closure`</span>

现在如何执行复杂计算只被定义了一次，并只会在需要结果的时候执行该代码。

然而，我们又重新引入了示例 13-3 中的问题：仍然在第一个 `if` 块中调用了闭包两次，这调用了慢计算代码两次而使得用户需要多等待一倍的时间。可以通过在 `if` 块中创建一个本地变量存放闭包调用的结果来解决这个问题，不过闭包可以提供另外一种解决方案。我们稍后会讨论这个方案，不过目前让我们首先讨论一下为何闭包定义中和所涉及的 trait 中没有类型注解。

### 闭包类型推断和注解

闭包不总是要求像 `fn` 函数那样在参数和返回值上注明类型。函数中需要类型注解是因为他们是暴露给用户的显式接口的一部分。严格的定义这些接口对于保证所有人都认同函数使用和返回值的类型来说是很重要的。但是闭包并不用于这样暴露在外的接口：他们储存在变量中并被使用，不用命名他们或暴露给库的用户调用。

闭包通常很短，并只关联于小范围的上下文而非任意情境。在这些有限制的上下文中，编译器能可靠的推断参数和返回值的类型，类似于它是如何能够推断大部分变量的类型一样。

强制在这些小的匿名函数中注明类型是很恼人的，并且与编译器已知的信息存在大量的重复。

类似于变量，如果相比严格的必要性你更希望增加明确性并变得更啰嗦，可以选择增加类型注解；为示例 13-5 中定义的闭包标注类型将看起来像示例 13-7 中的定义：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-07/src/main.rs:here}}
```

<span class="caption">示例 13-7：为闭包的参数和返回值增加可选的类型注解</span>

有了类型注解闭包的语法就更类似函数了。如下是一个对其参数加一的函数的定义与拥有相同行为闭包语法的纵向对比。这里增加了一些空格来对齐相应部分。这展示了闭包语法如何类似于函数语法，除了使用竖线而不是括号以及几个可选的语法之外：

```rust,ignore
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

第一行展示了一个函数定义，而第二行展示了一个完整标注的闭包定义。第三行闭包定义中省略了类型注解，而第四行去掉了可选的大括号，因为闭包体只有一行。这些都是有效的闭包定义，并在调用时产生相同的行为。调用闭包是 `add_one_v3` 和 `add_one_v4` 能够编译的必要条件，因为类型将从其用法中推断出来。

闭包定义会为每个参数和返回值推断一个具体类型。例如，示例 13-8 中展示了仅仅将参数作为返回值的简短的闭包定义。除了作为示例的目的这个闭包并不是很实用。注意其定义并没有增加任何类型注解：如果尝试调用闭包两次，第一次使用 `String` 类型作为参数而第二次使用 `u32`，则会得到一个错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-08/src/main.rs:here}}
```

<span class="caption">示例 13-8：尝试调用一个被推断为两个不同类型的闭包</span>

编译器给出如下错误：

```console
{{#include ../listings/ch13-functional-features/listing-13-08/output.txt}}
```

第一次使用 `String` 值调用 `example_closure` 时，编译器推断 `x` 和此闭包返回值的类型为 `String`。接着这些类型被锁定进闭包 `example_closure` 中，如果尝试对同一闭包使用不同类型则会得到类型错误。

### 使用带有泛型和 `Fn` trait 的闭包

回到我们的健身计划生成 app，在示例 13-6 中的代码仍然把慢计算闭包调用了比所需更多的次数。解决这个问题的一个方法是在全部代码中的每一个需要多个慢计算闭包结果的地方，可以将结果保存进变量以供复用，这样就可以使用变量而不是再次调用闭包。但是这样就会有很多重复的保存结果变量的地方。

幸运的是，还有另一个可用的方案。可以创建一个存放闭包和调用闭包结果的结构体。该结构体只会在需要结果时执行闭包，并会缓存结果值，这样余下的代码就不必再负责保存结果并可以复用该值。你可能见过这种模式被称 *memoization* 或 *lazy evaluation* *（惰性求值）*。

为了让结构体存放闭包，我们需要指定闭包的类型，因为结构体定义需要知道其每一个字段的类型。每一个闭包实例有其自己独有的匿名类型：也就是说，即便两个闭包有着相同的签名，他们的类型仍然可以被认为是不同。为了定义使用闭包的结构体、枚举或函数参数，需要像第十章讨论的那样使用泛型和 trait bound。

`Fn` 系列 trait 由标准库提供。所有的闭包都实现了 trait `Fn`、`FnMut` 或 `FnOnce` 中的一个。在 [“闭包会捕获其环境”](#闭包会捕获其环境) 部分我们会讨论这些 trait 的区别；在这个例子中可以使用 `Fn` trait。

为了满足 `Fn` trait bound 我们增加了代表闭包所必须的参数和返回值类型的类型。在这个例子中，闭包有一个 `u32` 的参数并返回一个 `u32`，这样所指定的 trait bound 就是 `Fn(u32) -> u32`。

示例 13-9 展示了存放了闭包和一个 Option 结果值的 `Cacher` 结构体的定义：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-09/src/main.rs:here}}
```

<span class="caption">示例 13-9：定义一个 `Cacher` 结构体来在 `calculation` 中存放闭包并在 `value` 中存放 Option 值</span>

结构体 `Cacher` 有一个泛型 `T` 的字段 `calculation`。`T` 的 trait bound 指定了 `T` 是一个使用 `Fn` 的闭包。任何我们希望储存到 `Cacher` 实例的 `calculation` 字段的闭包必须有一个 `u32` 参数（由 `Fn` 之后的括号的内容指定）并必须返回一个 `u32`（由 `->` 之后的内容）。

> 注意：函数也都实现了这三个 `Fn` trait。如果不需要捕获环境中的值，则可以使用实现了 `Fn` trait 的函数而不是闭包。

字段 `value` 是 `Option<u32>` 类型的。在执行闭包之前，`value` 将是 `None`。如果使用 `Cacher` 的代码请求闭包的结果，这时会执行闭包并将结果储存在 `value` 字段的 `Some` 成员中。接着如果代码再次请求闭包的结果，这时不再执行闭包，而是会返回存放在 `Some` 成员中的结果。

刚才讨论的有关 `value` 字段逻辑定义于示例 13-10：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-10/src/main.rs:here}}
```

<span class="caption">示例 13-10：`Cacher` 的缓存逻辑</span>

`Cacher` 结构体的字段是私有的，因为我们希望 `Cacher` 管理这些值而不是任由调用代码潜在的直接改变他们。

`Cacher::new` 函数获取一个泛型参数 `T`，它定义于 `impl` 块上下文中并与 `Cacher` 结构体有着相同的 trait bound。`Cacher::new` 返回一个在 `calculation` 字段中存放了指定闭包和在 `value` 字段中存放了 `None` 值的 `Cacher` 实例，因为我们还未执行闭包。

当调用代码需要闭包的执行结果时，不同于直接调用闭包，它会调用 `value` 方法。这个方法会检查 `self.value` 是否已经有了一个 `Some` 的结果值；如果有，它返回 `Some` 中的值并不会再次执行闭包。

如果 `self.value` 是 `None`，则会调用 `self.calculation` 中储存的闭包，将结果保存到 `self.value` 以便将来使用，并同时返回结果值。

示例 13-11 展示了如何在示例 13-6 的 `generate_workout` 函数中利用 `Cacher` 结构体：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-11/src/main.rs:here}}
```

<span class="caption">示例 13-11：在 `generate_workout` 函数中利用 `Cacher` 结构体来抽象出缓存逻辑</span>

不同于直接将闭包保存进一个变量，我们保存一个新的 `Cacher` 实例来存放闭包。接着，在每一个需要结果的地方，调用 `Cacher` 实例的 `value` 方法。可以调用 `value` 方法任意多次，或者一次也不调用，而慢计算最多只会运行一次。

尝试使用示例 13-2 中的 `main` 函数来运行这段程序，并改变 `simulated_user_specified_value` 和 `simulated_random_number` 变量中的值来验证在所有情况下在多个 `if` 和 `else` 块中，闭包打印的 `calculating slowly...` 只会在需要时出现并只会出现一次。`Cacher` 负责确保不会调用超过所需的慢计算所需的逻辑，这样 `generate_workout` 就可以专注业务逻辑了。

### `Cacher` 实现的限制

值缓存是一种更加广泛的实用行为，我们可能希望在代码中的其他闭包中也使用他们。然而，目前 `Cacher` 的实现存在两个小问题，这使得在不同上下文中复用变得很困难。

第一个问题是 `Cacher` 实例假设对于 `value` 方法的任何 `arg` 参数值总是会返回相同的值。也就是说，这个 `Cacher` 的测试会失败：

```rust,ignore,panics
{{#rustdoc_include ../listings/ch13-functional-features/no-listing-01-failing-cacher-test/src/lib.rs:here}}
```

这个测试使用返回传递给它的值的闭包创建了一个新的 `Cacher` 实例。使用为 1 的 `arg` 和为 2 的 `arg` 调用 `Cacher` 实例的 `value` 方法，同时我们期望使用为 2 的 `arg` 调用 `value` 会返回 2。

使用示例 13-9 和示例 13-10 的 `Cacher` 实现运行测试，它会在 `assert_eq!` 失败并显示如下信息：

```console
{{#include ../listings/ch13-functional-features/no-listing-01-failing-cacher-test/output.txt}}
```

这里的问题是第一次使用 1 调用 `c.value`，`Cacher` 实例将 `Some(1)` 保存进 `self.value`。在这之后，无论传递什么值调用 `value`，它总是会返回 1。

尝试修改 `Cacher` 存放一个哈希 map 而不是单独一个值。哈希 map 的 key 将是传递进来的 `arg` 值，而 value 则是对应 key 调用闭包的结果值。相比之前检查 `self.value` 直接是 `Some` 还是 `None` 值，现在 `value` 函数会在哈希 map 中寻找 `arg`，如果找到的话就返回其对应的值。如果不存在，`Cacher` 会调用闭包并将结果值保存在哈希 map 对应 `arg` 值的位置。

当前 `Cacher` 实现的第二个问题是它的应用被限制为只接受获取一个 `u32` 值并返回一个 `u32` 值的闭包。比如说，我们可能需要能够缓存一个获取字符串 slice 并返回 `usize` 值的闭包的结果。请尝试引入更多泛型参数来增加 `Cacher` 功能的灵活性。

### 闭包会捕获其环境

在健身计划生成器的例子中，我们只将闭包作为内联匿名函数来使用。不过闭包还有另一个函数所没有的功能：他们可以捕获其环境并访问其被定义的作用域的变量。

示例 13-12 有一个储存在 `equal_to_x` 变量中闭包的例子，它使用了闭包环境中的变量 `x`：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-12/src/main.rs}}
```

<span class="caption">示例 13-12：一个引用了其周围作用域中变量的闭包示例</span>

这里，即便 `x` 并不是 `equal_to_x` 的一个参数，`equal_to_x` 闭包也被允许使用变量 `x`，因为它与 `equal_to_x` 定义于相同的作用域。

函数则不能做到同样的事，如果尝试如下例子，它并不能编译：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/no-listing-02-functions-cant-capture/src/main.rs}}
```

这会得到一个错误：

```console
{{#include ../listings/ch13-functional-features/no-listing-02-functions-cant-capture/output.txt}}
```

编译器甚至会提示我们这只能用于闭包！

当闭包从环境中捕获一个值，闭包会在闭包体中储存这个值以供使用。这会使用内存并产生额外的开销，在更一般的场景中，当我们不需要闭包来捕获环境时，我们不希望产生这些开销。因为函数从未允许捕获环境，定义和使用函数也就从不会有这些额外开销。

闭包可以通过三种方式捕获其环境，他们直接对应函数的三种获取参数的方式：获取所有权，可变借用和不可变借用。这三种捕获值的方式被编码为如下三个 `Fn` trait：

* `FnOnce` 消费从周围作用域捕获的变量，闭包周围的作用域被称为其 **环境**，*environment*。为了消费捕获到的变量，闭包必须获取其所有权并在定义闭包时将其移动进闭包。其名称的 `Once` 部分代表了闭包不能多次获取相同变量的所有权的事实，所以它只能被调用一次。
* `FnMut` 获取可变的借用值所以可以改变其环境
* `Fn` 从其环境获取不可变的借用值

当创建一个闭包时，Rust 根据其如何使用环境中变量来推断我们希望如何引用环境。由于所有闭包都可以被调用至少一次，所以所有闭包都实现了 `FnOnce` 。那些并没有移动被捕获变量的所有权到闭包内的闭包也实现了 `FnMut` ，而不需要对被捕获的变量进行可变访问的闭包则也实现了 `Fn` 。在示例 13-12 中，`equal_to_x` 闭包不可变的借用了 `x`（所以 `equal_to_x` 具有 `Fn` trait），因为闭包体只需要读取 `x` 的值。

如果你希望强制闭包获取其使用的环境值的所有权，可以在参数列表前使用 `move` 关键字。这个技巧在将闭包传递给新线程以便将数据移动到新线程中时最为实用。

> 注意：即使其捕获的值已经被移动了，`move` 闭包仍需要实现 `Fn` 或 `FnMut`。这是因为闭包所实现的 trait 是由闭包所捕获了什么值而不是如何捕获所决定的。而 `move` 关键字仅代表了后者。

第十六章讨论并发时会展示更多 `move` 闭包的例子，不过现在这里修改了示例 13-12 中的代码（作为演示），在闭包定义中增加 `move` 关键字并使用 vector 代替整型，因为整型可以被拷贝而不是移动；注意这些代码还不能编译：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/no-listing-03-move-closures/src/main.rs}}
```

这个例子并不能编译，会产生以下错误：

```console
{{#include ../listings/ch13-functional-features/no-listing-03-move-closures/output.txt}}
```

`x` 被移动进了闭包，因为闭包使用 `move` 关键字定义。接着闭包获取了 `x` 的所有权，同时 `main` 就不再允许在 `println!` 语句中使用 `x` 了。去掉 `println!` 即可修复问题。

大部分需要指定一个 `Fn` 系列 trait bound 的时候，可以从 `Fn` 开始，而编译器会根据闭包体中的情况告诉你是否需要 `FnMut` 或 `FnOnce`。

为了展示闭包作为函数参数时捕获其环境的作用，让我们继续下一个主题：迭代器。
