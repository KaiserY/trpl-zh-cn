## 泛型数据类型

> [ch10-01-syntax.md](https://github.com/rust-lang/book/blob/master/src/ch10-01-syntax.md)
> <br>
> commit af34ac954a6bd7fc4a8bbcc5c9685e23c5af87da

我们可以使用泛型为像函数签名或结构体这样的项创建定义，这样它们就可以用于多种不同的具体数据类型。让我们看看如何使用泛型定义函数、结构体、枚举和方法，然后我们将讨论泛型如何影响代码性能。

### 在函数定义中使用泛型

当使用泛型定义函数时，我们在函数签名中通常为参数和返回值指定数据类型的位置放置泛型。以这种方式编写的代码将更灵活并能向函数调用者提供更多功能，同时不引入重复代码。

回到 `largest` 函数上，示例 10-4 中展示了两个提供了相同的寻找 slice 中最大值功能的函数。

<span class="filename">文件名: src/main.rs</span>

```rust
fn largest_i32(list: &[i32]) -> i32 {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest_char(list: &[char]) -> char {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest_i32(&number_list);
    println!("The largest number is {}", result);
#    assert_eq!(result, 100);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest_char(&char_list);
    println!("The largest char is {}", result);
#    assert_eq!(result, 'y');
}
```

<span class="caption">示例 10-4：两个只在名称和签名中类型有所不同的函数</span>

`largest_i32` 函数是从示例 10-3 中提取的寻找 slice 中 `i32` 最大值的函数。`largest_char` 函数寻找 slice 中 `char` 的最大值：这两个函数有着相同的代码，所以让我们在一个单独的函数中引入泛型参数来消除重复。

为了参数化要定义的函数的签名中的类型，我们需要像给函数的值参数起名那样为这类型参数起一个名字。任何标识符都可以作为类型参数名。不过选择 `T` 是因为 Rust 的习惯是让变量名尽量短，通常就只有一个字母，同时 Rust 类型命名规范是骆驼命名法（CamelCase）。`T` 作为 “type” 的缩写是大部分 Rust 程序员的首选。

当需要在函数体中使用一个参数时，必须在函数签名中声明这个参数以便编译器能知道函数体中这个名称的意义。同理，当在函数签名中使用一个类型参数时，必须在使用它之前就声明它。为了定义泛型版本的 `largest` 函数，类型参数声明位于函数名称与参数列表中间的尖括号 `<>` 中，像这样：

```rust,ignore
fn largest<T>(list: &[T]) -> T {
```

这可以理解为：函数 `largest` 有泛型类型 `T`。它有一个参数 `list`，它的类型是一个 `T` 值的 slice。`largest` 函数将会返回一个与 `T` 相同类型的值。

示例 10-5 展示一个在签名中使用了泛型的统一的 `largest` 函数定义。该示例也向我们展示了如何对 `i32` 值的 slice 或 `char` 值的 slice 调用 `largest` 函数。注意这些代码还不能编译，不过本章稍后部分会修复错误。

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
fn largest<T>(list: &[T]) -> T {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {}", result);
}
```

<span class="caption">示例 10-5：一个还不能编译的使用泛型参数的 `largest` 函数定义</span>

如果现在就尝试编译这些代码，会出现如下错误：

```text
error[E0369]: binary operation `>` cannot be applied to type `T`
 --> src/main.rs:5:12
  |
5 |         if item > largest {
  |            ^^^^^^^^^^^^^^
  |
  = note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

注释中提到了 `std::cmp::PartialOrd`，这是一个 *trait*。下一部分会讲到 trait。不过简单来说，这个错误表明 `largest` 的函数体不能适用于 `T` 的所有可能的类型。因为在函数体需要比较 `T` 类型的值，不过它只能用于我们知道如何排序的类型。为了开启比较功能，标准库中定义的 `std::cmp::PartialOrd` trait 可以实现类型的比较功能（查看附录 C 获取该 trait 的更多信息）。

标准库中定义的 `std::cmp::PartialOrd` trait 可以实现类型的比较功能。在 [“trait 作为参数”][traits-as-parameters] 部分会讲解如何指定泛型实现特定的 trait，不过让我们先探索其他使用泛型参数的方法。

### 结构体定义中的泛型

同样也可以使用 `<>` 语法来定义拥有一个或多个泛型参数类型字段的结构体。示例 10-6 展示了如何定义和使用一个可以存放任何类型的 `x` 和 `y` 坐标值的结构体 `Point`：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

<span class="caption">示例 10-6：`Point` 结构体存放了两个 `T` 类型的值 `x` 和 `y`</span>

其语法类似于函数定义中使用泛型。首先，必须在结构体名称后面的尖括号中声明泛型参数的名称。接着在结构体定义中可以指定具体数据类型的位置使用泛型类型。

注意 `Point<T>` 的定义中只使用了一个泛型类型，这个定义表明结构体 `Point<T>` 对于一些类型 `T` 是泛型的，而且字段 `x` 和 `y` **都是** 相同类型的，无论它具体是何类型。如果尝试创建一个有不同类型值的 `Point<T>` 的实例，像示例 10-7 中的代码就不能编译：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
}
```

<span class="caption">示例 10-7：字段 `x` 和 `y` 必须是相同类型，因为他们都有相同的泛型类型 `T`</span>

在这个例子中，当把整型值 5 赋值给 `x` 时，就告诉了编译器这个 `Point<T>` 实例中的泛型 `T` 是整型的。接着指定 `y` 为 4.0，它被定义为与 `x` 相同类型，就会得到一个像这样的类型不匹配错误：

```text
error[E0308]: mismatched types
 --> src/main.rs:7:38
  |
7 |     let wont_work = Point { x: 5, y: 4.0 };
  |                                      ^^^ expected integer, found
floating-point number
  |
  = note: expected type `{integer}`
             found type `{float}`
```

如果想要定义一个 `x` 和 `y` 可以有不同类型且仍然是泛型的 `Point` 结构体，我们可以使用多个泛型类型参数。在示例 10-8 中，我们修改 `Point` 的定义为拥有两个泛型类型 `T` 和 `U`。其中字段 `x` 是 `T` 类型的，而字段 `y` 是 `U` 类型的：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let both_float = Point { x: 1.0, y: 4.0 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}
```

<span class="caption">示例 10-8：使用两个泛型的 `Point`，这样 `x` 和 `y` 可能是不同类型</span>

现在所有这些 `Point` 实例都是被允许的了！你可以在定义中使用任意多的泛型类型参数，不过太多的话代码将难以阅读和理解。当你的代码中需要许多泛型类型时，它可能表明你的代码需要重组为更小的部分。

### 枚举定义中的泛型

类似于结构体，枚举也可以在其成员中存放泛型数据类型。第六章我们使用过了标准库提供的 `Option<T>` 枚举，让我们再看看：

```rust
enum Option<T> {
    Some(T),
    None,
}
```

现在这个定义看起来就更容易理解了。如你所见 `Option<T>` 是一个拥有泛型 `T` 的枚举，它有两个成员：`Some`，它存放了一个类型 `T` 的值，和不存在任何值的`None`。通过 `Option<T>` 枚举可以表达有一个可能的值的抽象概念，同时因为 `Option<T>` 是泛型的，无论这个可能的值是什么类型都可以使用这个抽象。

枚举也可以拥有多个泛型类型。第九章使用过的 `Result` 枚举定义就是一个这样的例子：

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

`Result` 枚举有两个泛型类型，`T` 和 `E`。`Result` 有两个成员：`Ok`，它存放一个类型 `T` 的值，而 `Err` 则存放一个类型 `E` 的值。这个定义使得 `Result` 枚举能很方便的表达任何可能成功（返回 `T` 类型的值）也可能失败（返回 `E` 类型的值）的操作。回忆一下示例 9-3 中打开一个文件的场景：当文件被成功打开 `T` 被放入了 `std::fs::File` 类型而当打开文件出现问题时 `E` 被放入了 `std::io::Error` 类型。

当发现代码中有多个只有存放的值的类型有所不同的结构体或枚举定义时，你就应该像之前的函数定义中那样引入泛型类型来减少重复代码。

### 方法定义中的泛型

也可以在定义中使用泛型在结构体和枚举上实现方法（像第五章那样）。

可以像第五章介绍的那样来为其定义中带有泛型的结构体或枚举实现方法。示例 10-9 中展示了示例 10-6 中定义的结构体 `Point<T>`，和在其上实现的名为 `x` 的方法。

<span class="filename">文件名: src/main.rs</span>

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```

<span class="caption">示例 10-9：在 `Point<T>` 结构体上实现方法 `x`，它返回 `T` 类型的字段 `x` 的引用</span>

这里在 `Point<T>` 上定义了一个叫做 `x` 的方法来返回字段 `x` 中数据的引用：

注意必须在 `impl` 后面声明 `T`，这样就可以在 `Point<T>` 上实现的方法中使用它了。在 `impl` 之后声明泛型 `T` ，这样 Rust 就知道 `Point` 的尖括号中的类型是泛型而不是具体类型。

例如，可以选择为 `Point<f32>` 实例实现方法，而不是为泛型 `Point` 实例。示例 10-10 展示了一个没有在 `impl` 之后（的尖括号）声明泛型的例子，这里使用了一个具体类型，`f32`：

```rust
# struct Point<T> {
#     x: T,
#     y: T,
# }
#
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

<span class="caption">示例 10-10：构建一个只用于拥有泛型参数 `T` 的结构体的具体类型的 `impl` 块</span>

这段代码意味着 `Point<f32>` 类型会有一个方法 `distance_from_origin`，而其他 `T` 不是 `f32` 类型的 `Point<T>` 实例则没有定义此方法。这个方法计算点实例与坐标 (0.0, 0.0) 之间的距离，并使用了只能用于浮点型的数学运算符。

结构体定义中的泛型类型参数并不总是与结构体方法签名中使用的泛型是同一类型。示例 10-11 中在示例 10-8 中的结构体 `Point<T, U>` 上定义了一个方法 `mixup`。这个方法获取另一个 `Point` 作为参数，而它可能与调用 `mixup` 的 `self` 是不同的 `Point` 类型。这个方法用 `self` 的 `Point` 类型的 `x` 值（类型 `T`）和参数的 `Point` 类型的 `y` 值（类型 `W`）来创建一个新 `Point` 类型的实例：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

<span class="caption">示例 10-11：方法使用了与结构体定义中不同类型的泛型</span>

在 `main` 函数中，定义了一个有 `i32` 类型的 `x`（其值为 `5`）和 `f64` 的 `y`（其值为 `10.4`）的 `Point`。`p2` 则是一个有着字符串 slice 类型的 `x`（其值为 `"Hello"`）和 `char` 类型的 `y`（其值为`c`）的 `Point`。在 `p1` 上以 `p2` 作为参数调用 `mixup` 会返回一个 `p3`，它会有一个 `i32` 类型的 `x`，因为 `x` 来自 `p1`，并拥有一个 `char` 类型的 `y`，因为 `y` 来自 `p2`。`println!` 会打印出 `p3.x = 5, p3.y = c`。

这个例子的目的是展示一些泛型通过 `impl` 声明而另一些通过方法定义声明的情况。这里泛型参数 `T` 和 `U` 声明于 `impl` 之后，因为他们与结构体定义相对应。而泛型参数 `V` 和 `W` 声明于 `fn mixup` 之后，因为他们只是相对于方法本身的。

### 泛型代码的性能

在阅读本部分内容的同时，你可能会好奇使用泛型类型参数是否会有运行时消耗。好消息是：Rust 实现了泛型，使得使用泛型类型参数的代码相比使用具体类型并没有任何速度上的损失。

Rust 通过在编译时进行泛型代码的 **单态化**（*monomorphization*）来保证效率。单态化是一个通过填充编译时使用的具体类型，将通用代码转换为特定代码的过程。

编译器所做的工作正好与示例 10-5 中我们创建泛型函数的步骤相反。编译器寻找所有泛型代码被调用的位置并使用泛型代码针对具体类型生成代码。

让我们看看一个使用标准库中 `Option` 枚举的例子：

```rust
let integer = Some(5);
let float = Some(5.0);
```

当 Rust 编译这些代码的时候，它会进行单态化。编译器会读取传递给 `Option<T>` 的值并发现有两种 `Option<T>`：一个对应 `i32` 另一个对应 `f64`。为此，它会将泛型定义 `Option<T>` 展开为 `Option_i32` 和 `Option_f64`，接着将泛型定义替换为这两个具体的定义。

编译器生成的单态化版本的代码看起来像这样，并包含将泛型 `Option<T>` 替换为编译器创建的具体定义后的用例代码：

<span class="filename">文件名: src/main.rs</span>

```rust
enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}

fn main() {
    let integer = Option_i32::Some(5);
    let float = Option_f64::Some(5.0);
}
```

我们可以使用泛型来编写不重复的代码，而 Rust 将会为每一个实例编译其特定类型的代码。这意味着在使用泛型时没有运行时开销；当代码运行，它的执行效率就跟好像手写每个具体定义的重复代码一样。这个单态化过程正是 Rust 泛型在运行时极其高效的原因。

[traits-as-parameters]: ch10-02-traits.html#traits-as-parameters
