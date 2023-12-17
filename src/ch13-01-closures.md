## 闭包：可以捕获环境的匿名函数

> [ch13-01-closures.md](https://github.com/rust-lang/book/blob/main/src/ch13-01-closures.md)
> <br>
> commit a2cb72d3ad7584cc1ae3b85f715c877872f5e3ab

Rust 的 **闭包**（*closures*）是可以保存在一个变量中或作为参数传递给其他函数的匿名函数。可以在一个地方创建闭包，然后在不同的上下文中执行闭包运算。不同于函数，闭包允许捕获被定义时所在作用域中的值。我们将展示闭包的这些功能如何复用代码和自定义行为。

### 闭包会捕获其环境

我们首先了解如何通过闭包捕获定义它的环境中的值以便之后使用。考虑如下场景：有时 T 恤公司会赠送限量版 T 恤给邮件列表中的成员作为促销。邮件列表中的成员可以选择将他们的喜爱的颜色添加到个人信息中。如果被选中的成员设置了喜爱的颜色，他们将获得那个颜色的 T 恤。如果他没有设置喜爱的颜色，他们会获赠公司现存最多的颜色的款式。

有很多种方式来实现这些。例如，使用有 `Red` 和 `Blue` 两个成员的 `ShirtColor` 枚举（出于简单考虑限定为两种颜色）。我们使用 `Inventory` 结构体来代表公司的库存，它有一个类型为 `Vec<ShirtColor>` 的 `shirts` 字段表示库存中的衬衫的颜色。`Inventory` 上定义的 `giveaway` 方法获取免费衬衫得主所喜爱的颜色（如有），并返回其获得的衬衫的颜色。初始代码如示例 13-1 所示：

<span class="filename">文件名：src/main.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-01/src/main.rs}}
```

<span class="caption">示例 13-1：衬衫公司赠送场景</span>

`main` 函数中定义的 `store` 还剩有两件蓝衬衫和一件红衬衫可在限量版促销活动中赠送。我们用一个期望获得红衬衫和一个没有期望的用户来调用 `giveaway` 方法。

再次强调，这段代码可以有多种实现方式。这里为了专注于闭包，我们会继续使用已经学习过的概念，除了 `giveaway` 方法体中使用了闭包。`giveaway` 方法获取了 `Option<ShirtColor>` 类型作为用户的期望颜色并在 `user_preference` 上调用 `unwrap_or_else` 方法。 [`Option<T>` 上的方法 `unwrap_or_else`][unwrap-or-else] 由标准库定义，它获取一个没有参数、返回值类型为 `T` （与 `Option<T>` 的 `Some` 成员所存储的值的类型一样，这里是 `ShirtColor`）的闭包作为参数。如果 `Option<T>` 是 `Some` 成员，则 `unwrap_or_else`  返回 `Some` 中的值。如果 `Option<T>` 是 `None`  成员，则 `unwrap_or_else`  调用闭包并返回闭包的返回值。

我们将被闭包表达式 `|| self.most_stocked()`  用作 `unwrap_or_else` 的参数。这是一个本身不获取参数的闭包（如果闭包有参数，它们会出现在两道竖杠之间）。闭包体调用了 `self.most_stocked()`。我们在这里定义了闭包，而 `unwrap_or_else` 的实现会在之后需要其结果的时候执行闭包。

运行代码会打印出：

```console
{{#include ../listings/ch13-functional-features/listing-13-01/output.txt}}
```

这里一个有趣的地方是我们传递了一个会在当前 `Inventory` 实例上调用 `self.most_stocked()` 的闭包。标准库并不需要知道我们定义的 `Inventory` 或 `ShirtColor` 类型或是在这个场景下我们想要用的逻辑。闭包捕获了一个 `Inventory` 实例的不可变引用到 `self`，并连同其它代码传递给 `unwrap_or_else` 方法。相比之下，函数就不能以这种方式捕获其环境。

### 闭包类型推断和注解

函数与闭包还有更多区别。闭包并不总是要求像 `fn` 函数那样在参数和返回值上注明类型。函数中需要类型注解是因为它们是暴露给用户的显式接口的一部分。严格定义这些接口对保证所有人都对函数使用和返回值的类型理解一致是很重要的。与此相比，闭包并不用于这样暴露在外的接口：它们储存在变量中并被使用，不用命名它们或暴露给库的用户调用。

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

<span class="caption">示例 13-3：尝试调用一个被推断为两个不同类型的闭包</span>

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

接下来在示例 13-5 中，我们修改闭包体让它向 `list` vector 增加一个元素。闭包现在捕获一个可变引用：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-05/src/main.rs}}
```

<span class="caption">示例 13-5：定义并调用一个捕获可变引用的闭包</span>

代码可以编译、运行并打印：

```console
{{#include ../listings/ch13-functional-features/listing-13-05/output.txt}}
```

注意在 `borrows_mutably` 闭包的定义和调用之间不再有 `println!`，当 `borrows_mutably` 定义时，它捕获了 `list` 的可变引用。闭包在被调用后就不再被使用，这时可变借用结束。因为当可变借用存在时不允许有其它的借用，所以在闭包定义和调用之间不能有不可变引用来进行打印。可以尝试在这里添加 `println!` 看看你会得到什么报错信息！

即使闭包体不严格需要所有权，如果希望强制闭包获取它用到的环境中值的所有权，可以在参数列表前使用 `move` 关键字。

在将闭包传递到一个新的线程时这个技巧很有用，它可以移动数据所有权给新线程。我们将在 16 章讨论并发时详细讨论线程以及为什么你想要使用它们。现在我们先简单探讨用 `move` 关键字的闭包来生成新的线程。示例 13-6 修改了示例 13-4 以便在一个新的线程而非主线程中打印 vector：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-06/src/main.rs}}
```

<span class="caption">示例 13-6：使用 `move` 来强制闭包为线程获取 `list` 的所有权</span>

我们生成了新的线程，给这个线程一个闭包作为参数运行，闭包体打印出列表。在示例 13-4 中，闭包通过不可变引用捕获 `list`，因为这是打印列表所需的最少的访问。这个例子中，尽管闭包体依然只需要不可变引用，我们还是在闭包定义前写上 `move` 关键字来指明 `list` 应当被移动到闭包中。新线程可能在主线程剩余部分执行完前执行完，或者也可能主线程先执行完。如果主线程维护了 `list` 的所有权但却在新线程之前结束并且丢弃了 `list`，则在线程中的不可变引用将失效。因此，编译器要求 `list` 被移动到在新线程中运行的闭包中，这样引用就是有效的。试着去掉 `move` 关键字或在闭包被定义后在主线程中使用 `list` 看看你会得到什么编译器报错！

<a id="storing-closures-using-generic-parameters-and-the-fn-traits"></a>
<a id="limitations-of-the-cacher-implementation"></a>
<a id="moving-captured-values-out-of-the-closure-and-the-fn-traits"></a>

### 将被捕获的值移出闭包和 `Fn` trait

一旦闭包捕获了定义它的环境中一个值的引用或者所有权（也就影响了什么会被移 _进_ 闭包，如有)，闭包体中的代码定义了稍后在闭包计算时对引用或值如何操作（也就影响了什么会被移 _出_ 闭包，如有）。闭包体可以做以下任何事：将一个捕获的值移出闭包，修改捕获的值，既不移动也不修改值，或者一开始就不从环境中捕获值。

闭包捕获和处理环境中的值的方式影响闭包实现的 trait。Trait 是函数和结构体指定它们能用的闭包的类型的方式。取决于闭包体如何处理值，闭包自动、渐进地实现一个、两个或三个 `Fn` trait。

1. `FnOnce` 适用于能被调用一次的闭包，所有闭包都至少实现了这个 trait，因为所有闭包都能被调用。一个会将捕获的值移出闭包体的闭包只实现 `FnOnce` trait，这是因为它只能被调用一次。
2. `FnMut` 适用于不会将捕获的值移出闭包体的闭包，但它可能会修改被捕获的值。这类闭包可以被调用多次。
3. `Fn` 适用于既不将被捕获的值移出闭包体也不修改被捕获的值的闭包，当然也包括不从环境中捕获值的闭包。这类闭包可以被调用多次而不改变它们的环境，这在会多次并发调用闭包的场景中十分重要。

让我们来看示例 13-1 中使用的在 `Option<T>` 上的 `unwrap_or_else` 方法的定义：

```rust,ignore
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
```

回忆 `T` 是表示 `Option` 中 `Some`  成员中的值的类型的泛型。类型 `T` 也是 `unwrap_or_else` 函数的返回值类型：举例来说，在 `Option<String>` 上调用 `unwrap_or_else` 会得到一个 `String`。

接着注意到 `unwrap_or_else`  函数有额外的泛型参数 `F`。 `F` 是 `f` 参数（即调用 `unwrap_or_else` 时提供的闭包）的类型。

泛型 `F` 的 trait bound 是 `FnOnce() -> T`，这意味着 `F` 必须能够被调用一次，没有参数并返回一个 `T`。在 trait bound 中使用 `FnOnce`  表示 `unwrap_or_else` 将最多调用  `f` 一次。在 `unwrap_or_else` 的函数体中可以看到，如果 `Option` 是 `Some`，`f` 不会被调用。如果 `Option` 是 `None`，`f` 将会被调用一次。由于所有的闭包都实现了 `FnOnce`，`unwrap_or_else` 能接收绝大多数不同类型的闭包，十分灵活。

> 注意：函数也可以实现所有的三种 `Fn`  traits。如果我们要做的事情不需要从环境中捕获值，则可以在需要某种实现了 `Fn`  trait 的东西时使用函数而不是闭包。举个例子，可以在 `Option<Vec<T>>`  的值上调用 `unwrap_or_else(Vec::new)` 以便在值为 `None` 时获取一个新的空的 vector。

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

`sort_by_key` 被定义为接收一个 `FnMut` 闭包的原因是它会多次调用这个闭包：每个 slice 中的元素调用一次。闭包 `|r| r.width` 不捕获、修改或将任何东西移出它的环境，所以它满足 trait bound 的要求。

作为对比，示例 13-8 展示了一个只实现了  `FnOnce`  trait 的闭包（因为它从环境中移出了一个值）的例子。编译器不允许我们在 `sort_by_key` 上使用这个闭包：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-08/src/main.rs}}
```

<span class="caption">示例 13-8：尝试在 `sort_by_key` 上使用一个 `FnOnce`  闭包</span>

这是一个刻意构造的、繁琐的方式，它尝试统计排序 `list` 时 `sort_by_key` 被调用的次数（并不能工作）。该代码尝试在闭包的环境中向 `sort_operations` vector 放入 `value`— 一个  `String`  来实现计数。闭包捕获了 `value` 然后通过转移 `value` 的所有权的方式将其移出闭包给到 `sort_operations` vector。这个闭包可以被调用一次，尝试再次调用它将报错。因为这时  `value` 已经不在闭包的环境中，无法被再次放到 `sort_operations` 中！因而，这个闭包只实现了 `FnOnce`。由于要求闭包必须实现 `FnMut`，因此尝试编译这个代码将得到报错：`value` 不能被移出闭包：

```console
{{#include ../listings/ch13-functional-features/listing-13-08/output.txt}}
```

报错指向了闭包体中将 `value` 移出环境的那一行。要修复这里，我们需要改变闭包体让它不将值移出环境。在环境中保持一个计数器并在闭包体中增加它的值是计算 `sort_by_key` 被调用次数的一个更简单直接的方法。示例 13-9 中的闭包可以在 `sort_by_key` 中使用，因为它只捕获了 `num_sort_operations` 计数器的可变引用，这就可以被调用多次。

<span class="filename">文件名：src/main.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-09/src/main.rs}}
```

<span class="caption">示例 13-9：允许在 `sort_by_key` 上使用一个  `FnMut`  闭包</span>

当定义或使用用到闭包的函数或类型时，`Fn`  trait 十分重要。在下个小节中，我们将会讨论迭代器。许多迭代器方法都接收闭包参数，因而在继续前先记住这些闭包的细节！

[unwrap-or-else]: https://doc.rust-lang.org/std/option/enum.Option.html#method.unwrap_or_else
