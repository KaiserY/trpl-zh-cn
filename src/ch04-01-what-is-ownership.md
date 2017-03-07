## 什么是所有权

> [ch04-01-what-is-ownership.md](https://github.com/rust-lang/book/blob/master/src/ch04-01-what-is-ownership.md)
> <br>
> commit cc053d91f41793e54d5321abe027b0c163d735b8

Rust 的核心功能（之一）是**所有权**（*ownership*）。虽然这个功能理解起来很直观，不过它对语言的其余部分有着更深层的含义。

所有程序都必须管理他们运行时使用计算机内存的方式。一些语言中使用垃圾回收在程序运行过程中来时刻寻找不再被使用的内存；在另一些语言中，程序员必须亲自分配和释放内存。Rust 则选择了第三种方式：内存被一个所有权系统管理，它拥有一系列的规则使编译器在编译时进行检查。任何所有权系统的功能都不会导致运行时开销。

因为所有权对很多程序员都是一个新概念，需要一些时间来适应。好消息是随着你对 Rust 和所有权系统的规则越来越有经验，你就越能自然地编写出安全和高效的代码。持之以恒！

当你理解了所有权系统，你就会对这个使 Rust 如此独特的功能有一个坚实的基础。在本章中，你将会通过一些例子来学习所有权，他们关注一个非常常见的数据结构：字符串。

<!-- PROD: START BOX -->

> ### 栈（Stack）与堆（Heap）
>
> 在很多语言中并不经常需要考虑到栈与堆。不过在像 Rust 这样的系统编程语言中，值是位于栈上还是堆上在更大程度上影响了语言的行为以及为何必须做出特定的选择。我们会在本章的稍后部分描述所有权与堆与栈相关的部分，所以这里只是一个用来预热的简要解释。
>
> 栈和堆都是代码在运行时可供使用的内存部分，不过他们以不同的结构组成。栈以放入值的顺序存储并以相反顺序取出值。这也被称作**后进先出**（*last in, first out*）。想象一下一叠盘子：当增加更多盘子时，把他们放在盘子堆的顶部，当需要盘子时，也从顶部拿走。不能从中间也不能从底部增加或拿走盘子！增加数据叫做**进栈**（*pushing onto the stack*），而移出数据叫做**出栈**（*popping off the stack*）。
>
> 操作栈是非常快的，因为它访问数据的方式：永远也不需要寻找一个位置放入新数据或者取出数据因为这个位置总是在栈顶。另一个使得栈快速的性质是栈中的所有数据都必须是一个已知的固定的大小。
>
> 相反对于在编译时未知大小或大小可能变化的数据，可以把他们储存在堆上。堆是缺乏组织的：当向堆放入数据时，我们请求一定大小的空间。操作系统在堆的某处找到一块足够大的空位，把它标记为已使用，并返回给我们一个它位置的指针。这个过程称作**在堆上分配内存**（*allocating on the heap*），并且有时这个过程就简称为“分配”（allocating）。向栈中放入数据并不被认为是分配。因为指针是已知的固定大小的，我们可以将指针储存在栈上，不过当需要实际数据时，必须访问指针。
>
> 想象一下去餐馆就坐吃饭。当进入时，你说明有几个人，餐馆员工会找到一个够大的空桌子并领你们过去。如果有人来迟了，他们也可以通过询问来找到你们坐在哪。
> 
> 访问堆上的数据要比访问栈上的数据要慢因为必须通过指针来访问。现代的处理器在内存中跳转越少就越快。继续类比，假设有一台服务器来处理来自多个桌子的订单。它在处理完一个桌子的所有订单后再移动到下一个桌子是最有效率的。从桌子 A 获取一个订单，接着再从桌子 B 获取一个订单，然后再从桌子 A，然后再从桌子 B 这样的流程会更加缓慢。出于同样原因，处理器在处理的数据之间彼此较近的时候（比如在栈上）比较远的时候（比如可能在堆上）能更好的工作。在堆上分配大量的空间也可能消耗时间。
>
> 当调用一个函数，传递给函数的值（包括可能指向堆上数据的指针）和函数的局部变量被压入栈中。当函数结束时，这些值被移出栈。
> 
> 记录何处的代码在使用堆上的什么数据，最小化堆上的冗余数据的数量以及清理堆上不再使用的数据以致不至于用完空间，这些所有的问题正是所有权系统要处理的。一旦理解了所有权，你就不需要经常考虑栈和堆了，不过理解如何管理堆内存可以帮助我们理解所有权为什么存在以及为什么以它的方式工作。

<!-- PROD: END BOX -->

### 所有权规则

首先，让我们看一下所有权的规则。记住这些规则正如我们将完成一些说明这些规则的例子：

> 1. Rust 中的每一个值都有一个叫做它的**所有者**（*owner*）的变量。
> 2. 同时一次只能有一个所有者
> 3. 当所有者变量离开作用域，这个值将被丢弃。

### 变量作用域

我们在第二章已经完成过一个 Rust 程序的例子了。现在我们已经掌握了基本语法，所以不会在所有的例子中包含`fn main() {`代码了，所以如果你是一路跟过来的，必须手动将之后例子的代码放入一个`main`函数中。为此，例子将显得更加具体，使我们可以关注具体细节而不是样板代码。

作为所有权的第一个例子，我们看看一些变量的**作用域**（*scope*）。作用域是一个 item 在程序中有效的范围。假如有一个这样的变量：

```rust
let s = "hello";
```

变量`s`绑定到了一个字符串字面值，这个字符串值是硬编码进我们程序代码中的。这个变量从声明的点开始直到当前*作用域*结束时都是有效的。列表 4-1 的注释标明了变量`s`在哪里是有效的：

<figure>

```rust
{                      // s is not valid here, it’s not yet declared
    let s = "hello";   // s is valid from this point forward

    // do stuff with s
}                      // this scope is now over, and s is no longer valid
```

<figcaption>

Listing 4-1: A variable and the scope in which it is valid

</figcaption>
</figure>

换句话说，这里有两个重要的点：

1. 当`s`**进入作用域**，它就是有效的。
2. 这一直持续到它**离开作用域**为止。

目前为止，变量是否有效与作用域的关系跟其他变成语言是类似的。现在我们要在此基础上介绍`String`类型。

### `String`类型

为了演示所有权的规则，我们需要一个比第三章讲到的任何一个都要复杂的数据类型。之前出现的数据类型都是储存在栈上的并且当离开作用域时被移出栈，不过我们需要寻找一个储存在堆上的数据来探索 Rust 如何知道该在何时清理数据。

这里使用`String`作为例子并专注于`String`与所有权相关的部分。这些方面也同样适用于其他标准库提供的或你创建的复杂数据类型。在第八章会更深入地讲解`String`。

我们已经见过字符串字面值了，它被硬编码进程序里。字符串字面值是很方便，不过他们并不总是适合所有需要使用文本的场景。原因之一就是他们是不可变的。另一个原因是不是所有字符串的值都能在编写代码时就知道：例如，如果想要获取用户输入并储存该怎么办呢？为此，Rust 有第二个字符串类型，`String`。这个类型储存在堆上所以储存在编译时未知大小的文本。可以用`from`从字符串字面值来创建`String`，如下：

```rust
let s = String::from("hello");
```

这两个冒号（`::`）运算符允许将特定的`from`函数置于`String`类型的命名空间（namespace）下而不需要使用类似`string_from`这样的名字。在第五章的“方法语法”（“Method Syntax”）部分会着重讲解这个语法而且在第七章会讲到模块的命名空间。

这类字符串*可以*被修改：

```rust
let mut s = String::from("hello");

s.push_str(", world!"); // push_str() appends a literal to a String

println!("{}", s); // This will print `hello, world!`
```

那么这里有什么区别呢？为什么`String`可变而字面值却不行呢？区别在于两个类型对内存的处理上。

### 内存与分配

字符串字面值的情况，我们在编译时就知道内容所以它直接被硬编码进最终的可执行文件中，这使得字符串字面值快速和高效。不过这些属性都只来源于它的不可变形。不幸的是，我们不能为了每一个在编译时未知大小的文本而将一块内存放入二进制文件中而它的大小还可能随着程序运行而改变。

对于`String`类型，为了支持一个可变，可增长的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容。这意味着：

1. 内存必须在运行时向操作系统请求
2. 需要一个当我们处理完`String`时将内存返回给操作系统的方法

第一部分由我们完成：当调用`String::from`时，它的实现请求它需要的内存。这在编程语言中是非常通用的。

然而，第二部分实现起来就各有区别了。在有**垃圾回收（GC）**的语言中， GC 记录并清除不再使用的内存，而我们作为程序员，并不需要关心他们。没有 GC 的话，识别出不再使用的内存并调用代码显式释放就是我们程序员的责任了，正如请求内存的时候一样。从历史的角度上说正确处理内存回收曾经是一个困难的编程问题。如果忘记回收了会浪费内存。如果过早回收了，将会出现无效变量。如果重复回收，这也是个 bug。我们需要`allocate`和`free`一一对应。

Rust 采取了一个不同的策略：内存在拥有它的变量离开作用域后就被自动释放。下面是列表 4-1 作用域例子的一个使用`String`而不是字符串字面值的版本：

```rust
{
    let s = String::from("hello"); // s is valid from this point forward

    // do stuff with s
}                                  // this scope is now over, and s is no
                                   // longer valid
```

这里是一个将`String`需要的内存返回给操作系统的很自然的位置：当`s`离开作用域的时候。当变量离开作用域，Rust 为其调用一个特殊的函数。这个函数叫做 `drop`，在这里`String`的作者可以放置释放内存的代码。Rust 在结尾的`}`处自动调用`drop`。

> 注意：在 C++ 中，这种 item 在生命周期结束时释放资源的方法有时被称作**资源获取即初始化**（*Resource Acquisition Is Initialization (RAII)*）。如果你使用过 RAII 模式的话应该对 Rust 的`drop`函数不陌生。

这个模式对编写 Rust 代码的方式有着深远的影响。它现在看起来很简单，不过在更复杂的场景下代码的行为可能是不可预测的，比如当有多个变量使用在堆上分配的内存时。现在让我们探索一些这样的场景。

#### 变量与数据交互：移动

Rust 中的多个变量以一种独特的方式与同一数据交互。让我们看看列表 4-2 中一个使用整型的例子：

<figure>

```rust
let x = 5;
let y = x;
```

<figcaption>

Listing 4-2: Assigning the integer value of variable `x` to `y`

</figcaption>
</figure>

根据其他语言的经验大致可以猜到这在干什么：“将`5`绑定到`x`；接着生成一个值`x`的拷贝并绑定到`y`”。现在有了两个变量，`x`和`y`，都等于`5`。这也正是事实上发生了的，因为正数是有已知固定大小的简单值，所以这两个`5`被放入了栈中。

现在看看这个`String`版本：

```rust
let s1 = String::from("hello");
let s2 = s1;
```

这看起来与上面的代码非常类似，所以我们可能会假设他们的运行方式也是类似的：也就是说，第二行可能会生成一个`s1`的拷贝并绑定到`s2`上。不过，事实上并不完全是这样。

为了更全面的解释这个问题，让我们看看图 4-3 中`String`真正是什么样。`String`由三部分组成，如图左侧所示：一个指向存放字符串内容内存的指针，一个长度，和一个容量。这一组数据储存在栈上。右侧则是堆上存放内容的内存部分。

<figure>
<img alt="String in memory" src="img/trpl04-01.svg" class="center" style="width: 50%;" />

<figcaption>

Figure 4-3: Representation in memory of a `String` holding the value `"hello"`
bound to `s1`

</figcaption>
</figure>

长度代表当前`String`的内容使用了多少字节的内存。容量是`String`从操作系统总共获取了多少字节的内存。长度与容量的区别是很重要的，不过目前为止的场景中并不重要，所以可以暂时忽略容量。

当我们把`s1`赋值给`s2`，`String`的数据被复制了，这意味着我们从栈上拷贝了它的指针、长度和容量。我们并没有复制堆上指针所指向的数据。换句话说，内存中数据的表现如图 4-4 所示。

<figure>
<img alt="s1 and s2 pointing to the same value" src="img/trpl04-02.svg" class="center" style="width: 50%;" />

<figcaption>

Figure 4-4: Representation in memory of the variable `s2` that has a copy of
the pointer, length, and capacity of `s1`

</figcaption>
</figure>

这个表现形式看起来**并不像**图 4-5 中的那样，它是如果 Rust 也拷贝了堆上的数据后内存看起来是怎么样的。如果 Rust 这么做了，那么操作`s2 = s1`在堆上数据比较大的时候可能会对运行时性能造成非常大的影响。

<figure>
<img alt="s1 and s2 to two places" src="img/trpl04-03.svg" class="center" style="width: 50%;" />

<figcaption>

Figure 4-5: Another possibility of what `s2 = s1` might do if Rust copied the
heap data as well

</figcaption>
</figure>

之前，我们提到过当变量离开作用域后 Rust 自动调用`drop`函数并清理变量的堆内存。不过图 4-4 展示了两个数据指针指向了同一位置。这就有了一个问题：当`s2`和`s1`离开作用域，他们都会尝试释放相同的内存。这是一个叫做 *double free* 的错误，也是之前提到过的内存安全性 bug 之一。两次释放（相同）内存会导致内存污染，它可能会导致安全漏洞。

为了确保内存安全，这种场景下 Rust 的处理有另一个细节值得注意。与其尝试拷贝被分配的内存，Rust 则认为`s1`不再有效，因此 Rust 不需要在`s1`离开作用域后清理任何东西。看看在`s2`被创建之后尝试使用`s1`会发生生么：

```rust,ignore
let s1 = String::from("hello");
let s2 = s1;

println!("{}", s1);
```

你会得到一个类似如下的错误，因为 Rust 禁止你使用无效的引用。

```sh
error[E0382]: use of moved value: `s1`
 --> src/main.rs:4:27
  |
3 |     let s2 = s1;
  |         -- value moved here
4 |     println!("{}, world!",s1);
  |                           ^^ value used here after move
  |
  = note: move occurs because `s1` has type `std::string::String`,
which does not implement the `Copy` trait
```

如果你在其他语言中听说过术语“浅拷贝”（“shallow copy”）和“深拷贝”（“deep copy”），那么拷贝指针、长度和容量而不拷贝数据可能听起来像浅拷贝。不过因为 Rust 同时使第一个变量无效化了，这个操作被成为**移动**（*move*），而不是浅拷贝。上面的例子可以解读为`s1`被**移动**到了`s2`中。那么具体发生了什么如图 4-6 所示。

<figure>
<img alt="s1 moved to s2" src="img/trpl04-04.svg" class="center" style="width: 50%;" />

<figcaption>

Figure 4-6: Representation in memory after `s1` has been invalidated

</figcaption>
</figure>

这样就解决了我们的麻烦！因为只有`s2`是有效的，当其离开作用域，它就释放自己的内存，完毕。

另外，这里还隐含了一个设计选择：Rust 永远也不会自动创建数据的“深拷贝”。因此，任何**自动**的复制可以被认为对运行时性能影响较小。

#### 变量与数据交互：克隆

如果我们**确实**需要深度复制`String`中堆上的数据，而不仅仅是栈上的数据，可以使用一个叫做`clone`的通用函数。第五章会讨论方法语法，不过因为方法在很多语言中是一个常见功能，所以之前你可能已经见过了。

这是一个实际使用`clone`方法的例子：

```rust
let s1 = String::from("hello");
let s2 = s1.clone();

println!("s1 = {}, s2 = {}", s1, s2);
```

这段代码能正常运行，也是如何显式产生图 4-5 中行为的方式，这里堆上的数据**被复制了**。

当出现`clone`调用时，你知道一些特有的代码被执行而且这些代码可能相当消耗资源。所以它作为一个可视化的标识代表了不同的行为。

#### 只在栈上的数据：拷贝

这里还有一个没有提到的小窍门。这些代码使用了整型并且是有效的，他们是之前列表 4-2 中的一部分：

```rust
let x = 5;
let y = x;

println!("x = {}, y = {}", x, y);
```

他们似乎与我们刚刚学到的内容向抵触：没有调用`clone`，不过`x`依然有效且没有被移动到`y`中。

原因是像整型这样的在编译时已知大小的类型被整个储存在栈上，所以拷贝其实际的值是快速的。这意味着没有理由在创建变量`y`后使`x`无效。换句话说，这里没有深浅拷贝的区别，所以调用`clone`并不会与通常的浅拷贝有什么不同，我们可以不用管它。

Rust 有一个叫做`Copy` trait 的特殊注解，可以用在类似整型这样的储存在栈上的类型（第十章详细讲解 trait）。如果一个类型拥有`Copy` trait，一个旧的变量在（重新）赋值后仍然可用。Rust 不允许自身或其任何部分实现了`Drop` trait 的类型使用`Copy` trait。如果我们对其值离开作用域时需要特殊处理的类型使用`Copy`注解，将会出现一个编译时错误。

那么什么类型是`Copy`的呢？可以查看给定类型的文档来确认，不过作为一个通用的规则，任何简单标量值的组合可以是`Copy`的，任何不需要分配内存或类似形式资源的类型是`Copy`的，如下是一些`Copy`的类型：

* 所有整数类型，比如`u32`。
* 布尔类型，`bool`，它的值是`true`和`false`。
* 所有浮点数类型，比如`f64`。
* 元组，当且仅当其包含的类型也都是`Copy`的时候。`(i32, i32)`是`Copy`的，不过`(i32, String)`就不是。

### 所有权与函数

将值传递给函数在语言上与给变量赋值相似。向函数传递值可能会移动或者复制，就像赋值语句一样。列表 4-7 是一个带有变量何时进入和离开作用域标注的例子：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let s = String::from("hello");  // s comes into scope.

    takes_ownership(s);             // s's value moves into the function...
                                    // ... and so is no longer valid here.
    let x = 5;                      // x comes into scope.

    makes_copy(x);                  // x would move into the function,
                                    // but i32 is Copy, so it’s okay to still
                                    // use x afterward.

} // Here, x goes out of scope, then s. But since s's value was moved, nothing
  // special happens.

fn takes_ownership(some_string: String) { // some_string comes into scope.
    println!("{}", some_string);
} // Here, some_string goes out of scope and `drop` is called. The backing
  // memory is freed.

fn makes_copy(some_integer: i32) { // some_integer comes into scope.
    println!("{}", some_integer);
} // Here, some_integer goes out of scope. Nothing special happens.
```

<figcaption>

Listing 4-7: Functions with ownership and scope annotated

</figcaption>
</figure>

当尝试在调用`takes_ownership`后使用`s`时，Rust 会抛出一个编译时错误。这些静态检查使我们免于犯错。试试在`main`函数中添加使用`s`和`x`的代码来看看哪里能使用他们，和哪里所有权规则会阻止我们这么做。

### 返回值与作用域

返回值也可以转移作用域。这里是一个有与列表 4-7 中类似标注的例子：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let s1 = gives_ownership();         // gives_ownership moves its return
                                        // value into s1.

    let s2 = String::from("hello");     // s2 comes into scope.

    let s3 = takes_and_gives_back(s2);  // s2 is moved into
                                        // takes_and_gives_back, which also
                                        // moves its return value into s3.
} // Here, s3 goes out of scope and is dropped. s2 goes out of scope but was
  // moved, so nothing happens. s1 goes out of scope and is dropped.

fn gives_ownership() -> String {             // gives_ownership will move its
                                             // return value into the function
                                             // that calls it.

    let some_string = String::from("hello"); // some_string comes into scope.

    some_string                              // some_string is returned and
                                             // moves out to the calling
                                             // function.
}

// takes_and_gives_back will take a String and return one.
fn takes_and_gives_back(a_string: String) -> String { // a_string comes into
                                                      // scope.

    a_string  // a_string is returned and moves out to the calling function.
}
```

变量的所有权总是遵循相同的模式：将值赋值给另一个变量时移动它，并且当变量值的堆书卷离开作用域时，如果数据的所有权没有被移动到另外一个变量时，其值将通过`drop`被清理掉。

在每一个函数中都获取并接着返回所有权是冗余乏味的。如果我们想要函数使用一个值但不获取所有权改怎么办呢？如果我们还要接着使用它的话，每次都传递出去再传回来就有点烦人了，另外我们也可能想要返回函数体产生的任何（不止一个）数据。

使用元组来返回多个值是可能的，像这样：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let s1 = String::from("hello");

    let (s2, len) = calculate_length(s1);

    println!("The length of '{}' is {}.", s2, len);
}

fn calculate_length(s: String) -> (String, usize) {
    let length = s.len(); // len() returns the length of a String.

    (s, length)
}
```

但是这不免有些形式主义，同时这离一个通用的观点还有很长距离。幸运的是，Rust 对此提供了一个功能，叫做**引用**（*references*）。
