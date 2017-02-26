## 泛型数据类型

> [ch10-01-syntax.md](https://github.com/rust-lang/book/blob/master/src/ch10-01-syntax.md)
> <br>
> commit 55d9e75ffec92e922273c997026bb10613a76578

泛型用于通常我们放置类型的位置，比如函数签名或结构体，允许我们创建可以代替许多具体数据类型的结构体定义。让我们看看如何使用泛型定义函数、结构体、枚举和方法，并且在本部分的结尾我们会讨论泛型代码的性能。

### 在函数定义中使用泛型

定义函数时可以在函数签名的参数数据类型和返回值中使用泛型。以这种方式编写的代码将更灵活并能向函数调用者提供更多功能，同时不引入重复代码。

回到`largest`函数上，列表 10-4 中展示了两个提供了相同的寻找 slice 中最大值功能的函数。第一个是从列表 10-3 中提取的寻找 slice 中`i32`最大值的函数。第二个函数寻找 slice 中`char`的最大值：

<figure>
<span class="filename">Filename: src/main.rs</span>

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
    let numbers = vec![34, 50, 25, 100, 65];

    let result = largest_i32(&numbers);
    println!("The largest number is {}", result);
#    assert_eq!(result, 100);

    let chars = vec!['y', 'm', 'a', 'q'];

    let result = largest_char(&chars);
    println!("The largest char is {}", result);
#    assert_eq!(result, 'y');
}
```

<figcaption>

Listing 10-4: Two functions that differ only in their names and the types in
their signatures

</figcaption>
</figure>

这里`largest_i32`和`largest_char`有着完全相同的函数体，所以能够将这两个函数变成一个来减少重复就太好了。所幸通过引入一个泛型参数就能实现。

为了参数化要定义的函数的签名中的类型，我们需要像给函数的值参数起名那样为这类型参数起一个名字。这里选择了名称`T`。任何标识符抖可以作为类型参数名，选择`T`是因为 Rust 的类型命名规范是骆驼命名法（CamelCase）。另外泛型类型参数的规范也倾向于简短，经常仅仅是一个字母。`T`作为“type”是大部分 Rust 程序员的首选。

当需要再函数体中使用一个参数时，必须再函数签名中声明这个参数以便编译器能知道函数体中这个名称的意义。同理，当在函数签名中使用一个类型参数时，必须在使用它之前就声明它。类型参数声明位于函数名称与参数列表中间的尖括号中。

我们将要定义的泛型版本的`largest`函数的签名看起来像这样：

```rust,ignore
fn largest<T>(list: &[T]) -> T {
```

这可以理解为：函数`largest`有泛型类型`T`。它有一个参数`list`，它的类型是一个`T`值的 slice。`largest`函数将会返回一个与`T`相同类型的值。

列表 10-5 展示一个在签名中使用了泛型的统一的`largest`函数定义，并向我们展示了如何对`i32`值的 slice 或`char`值的 slice 调用`largest`函数。注意这些代码还不能编译！


<figure>
<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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
    let numbers = vec![34, 50, 25, 100, 65];

    let result = largest(&numbers);
    println!("The largest number is {}", result);

    let chars = vec!['y', 'm', 'a', 'q'];

    let result = largest(&chars);
    println!("The largest char is {}", result);
}
```

<figcaption>

Listing 10-5: A definition of the `largest` function that uses generic type
parameters but doesn't compile yet

</figcaption>
</figure>

如果现在就尝试编译这些代码，会出现如下错误：

```
error[E0369]: binary operation `>` cannot be applied to type `T`
  |
5 |         if item > largest {
  |            ^^^^
  |
note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

注释中提到了`std::cmp::PartialOrd`，这是一个 *trait*。下一部分会讲到 trait，不过简单来说，这个错误表明`largest`的函数体对`T`的所有可能的类型都无法工作；因为在函数体需要比较`T`类型的值，不过它只能用于我们知道如何排序的类型。标准库中定义的`std::cmp::PartialOrd` trait 可以实现类型的排序功能。在下一部分会再次回到 trait 并讲解如何为泛型指定一个 trait，不过让我们先把这个例子放在一边并探索其他那些可以使用泛型类型参数的地方。

<!-- Liz: this is the reason we had the topics in the order we did in the first
draft of this chapter; it's hard to do anything interesting with generic types
in functions unless you also know about traits and trait bounds. I think this
ordering could work out okay, though, and keep a stronger thread with the
`longest` function going through the whole chapter, but we do pause with a
not-yet-compiling example here, which I know isn't ideal either. Let us know
what you think. /Carol -->

### 结构体定义中的泛型

同样也可以使用`<>`语法来定义拥有一个或多个泛型参数类型字段的结构体。列表 10-6 展示了如何定义和使用一个可以存放任何类型的`x`和`y`坐标值的结构体`Point`：

<figure>
<span class="filename">Filename: src/main.rs</span>

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

<figcaption>

Listing 10-6: A `Point` struct that holds `x` and `y` values of type `T`

</figcaption>
</figure>

其语法类似于函数定义中的泛型应用。首先，必须在结构体名称后面的尖括号中声明泛型参数的名称。接着在结构体定义中可以指定具体数据类型的位置使用泛型类型。

注意`Point`的定义中是使用了要给泛型类型，我们想要表达的是结构体`Point`对于一些类型`T`是泛型的，而且无论这个泛型是什么，字段`x`和`y`**都是**相同类型的。如果尝试创建一个有不同类型值的`Point`的实例，像列表 10-7 中的代码就不能编译：


<figure>
<span class="filename">Filename: src/main.rs</span>

```rust,ignore
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
}
```

<figcaption>

Listing 10-7: The fields `x` and `y` must be the same type because both have
the same generic data type `T`

</figcaption>
</figure>

尝试编译会得到如下错误：

```
error[E0308]: mismatched types
 -->
  |
7 |     let wont_work = Point { x: 5, y: 4.0 };
  |                                      ^^^ expected integral variable, found
  floating-point variable
  |
  = note: expected type `{integer}`
  = note:    found type `{float}`
```

当我们将 5 赋值给`x`，编译器就知道这个`Point`实例的泛型类型`T`是一个整型。接着我们将`y`指定为 4.0，而它被定义为与`x`有着相同的类型，所以出现了类型不匹配的错误。

如果想要一个`x`和`y`可以有不同类型且仍然是泛型的`Point`结构体，我们可以使用多个泛型类型参数。在列表 10-8 中，我们修改`Point`的定义为拥有两个泛型类型`T`和`U`。其中字段`x`是`T`类型的，而字段`y`是`U`类型的：

<figure>
<span class="filename">Filename: src/main.rs</span>

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

<figcaption>

Listing 10-8: A `Point` generic over two types so that `x` and `y` may be
values of different types

</figcaption>
</figure>

现在所有这些`Point`实例都是被允许的了！你可以在定义中使用任意多的泛型类型参数，不过太多的话代码将难以阅读和理解。如果你处于一个需要很多泛型类型的位置，这可能是一个需要重新组织代码并分隔成一些更小部分的信号。

### 枚举定义中的泛型数据类型

类似于结构体，枚举也可以在其成员中存放泛型数据类型。