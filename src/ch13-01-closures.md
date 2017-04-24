## 闭包

> [ch13-01-closures.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-01-closures.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

Rust 提供了定义**闭包**的能力，它类似于函数。让我们先不从技术上的定义开始，而是看看闭包语句结构，然后再返回他们的定义。列表 13-1 展示了一个被赋值给变量`add_one`的小的闭包定义，之后可以用这个变量来调用闭包：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let add_one = |x| x + 1;

    let five = add_one(4);

    assert_eq!(5, five);
}
```

<span class="caption">Listing 13-1: A closure that takes one parameter and adds
one to it, assigned to the variable `add_one`</span>

闭包的定义位于第一行，展示了闭包获取了一个叫做`x`的参数。闭包的参数位于竖线之间（`|`）。

这是一个很小的闭包，它只包含一个表达式。列表 13-2 展示了一个稍微复杂一点的闭包：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let calculate = |a, b| {
        let mut result = a * 2;

        result += b;

        result
    };

    assert_eq!(7, calculate(2, 3)); // 2 * 2 + 3 == 7
    assert_eq!(13, calculate(4, 5)); // 4 * 2 + 5 == 13
}
```

<span class="caption">Listing 13-2: A closure with two parameters and multiple
expressions in its body</span>

可以通过大括号来定义多于一个表达式的闭包体。

你会注意到一些闭包不同于`fn`关键字定义的函数的地方。第一个不同是并不需要声明闭包的参数和返回值的类型。也可以选择加上类型注解；列表 13-3 展示了列表 13-1 中闭包带有参数和返回值类型注解的版本：


<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let add_one = |x: i32| -> i32 { x + 1 };

    assert_eq!(2, add_one(1));
}
```

<span class="caption">Listing 13-3: A closure definition with optional
parameter and return value type annotations</span>

在带有类型注解的情况下闭包的语法于函数就更接近了。让我们来更直接的比较一下不同闭包的语法与函数的语法。这里增加了一些空格来对齐相关的部分：

```rust,ignore
fn  add_one_v1   (x: i32) -> i32 { x + 1 }  // a function
let add_one_v2 = |x: i32| -> i32 { x + 1 }; // the full syntax for a closure
let add_one_v3 = |x|             { x + 1 }; // a closure eliding types
let add_one_v4 = |x|               x + 1  ; // without braces
```

定义闭包时不要求类型注解而在定义函数时要求的原因在于函数是显式暴露给用户的接口的一部分，所以为了严格的定义接口确保所有人都同意函数使用和返回的值类型是很重要的。但是闭包并不像函数那样用于暴露接口：他们存在于绑定中并直接被调用。强制标注类型就等于为了很小的优点而显著的降低了工程性（本末倒置）。

不过闭包的定义确实会推断每一个参数和返回值的类型。例如，如果用`i8`调用列表 13-1 中没有类型注解的闭包，如果接着用`i32`调用同一闭包则会得到一个错误：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
let add_one = |x| x + 1;

let five = add_one(4i8);
assert_eq!(5i8, five);

let three = add_one(2i32);
```

编译器给出如下错误：

```
error[E0308]: mismatched types
 -->
  |
7 | let three = add_one(2i32);
  |                     ^^^^ expected i8, found i32
```

因为闭包是直接被调用的所以能可靠的推断出其类型，再强制要求标注类型就显得有些冗余了。

闭包与函数语法不同还有另一个原因是，它与函数有着不同的行为：闭包拥有其**环境（上下文）**。

### 闭包可以引用其环境

我们知道函数只能使用其作用域内的变量，或者要么是`const`的要么是被声明为参数的。闭包则可以做的更多：闭包允许使用包含他们的作用域的变量。列表 13-4 是一个在`equal_to_x`变量中并使用其周围环境中变量`x`的闭包的例子：


<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let x = 4;

    let equal_to_x = |z| z == x;

    let y = 4;

    assert!(equal_to_x(y));
}
```

<span class="caption">Listing 13-4: Example of a closure that refers to a
variable in its enclosing scope</span>

这里。即便`x`并不是`equal_to_x`的一个参数，`equal_to_x`闭包也被允许使用它，因为变量`x`定义于同样定义`equal_to_x`的作用域中。并不允许在函数中进行与列表 13-4 相同的操作；尝试这么做看看会发生什么：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let x = 4;

    fn equal_to_x(z: i32) -> bool { z == x }

    let y = 4;

    assert!(equal_to_x(y));
}
```

我们会得到一个错误：

```
error[E0434]: can't capture dynamic environment in a fn item; use the || { ... }
closure form instead
 -->
  |
4 |     fn equal_to_x(z: i32) -> bool { z == x }
  |                                          ^
```

编译器甚至提醒我们这只能用于闭包！

获取他们环境中值的闭包主要用于开始新线程的场景。我们也可以定义以闭包作为参数的函数，通过使用`Fn` trait。这里是一个函数`call_with_one`的例子，它的签名有一个闭包参数：

```rust
fn call_with_one<F>(some_closure: F) -> i32
    where F: Fn(i32) -> i32 {

    some_closure(1)
}

let answer = call_with_one(|x| x + 2);

assert_eq!(3, answer);
```

我们将`|x| x + 2`传递给了`call_with_one`，而`call_with_one`用`1`作为参数调用了这个闭包。`some_closure`调用的返回值接着被`call_with_one`返回。

`call_with_one`的签名使用了第十章 trait 部分讨论到的`where`语法。`some_closure`参数有一个泛型类型`F`，它在`where`从句中被定义为拥有`Fn(i32) -> i32` trait bound。`Fn` trait 代表了一个闭包，而且可以给`Fn` trait 增加类型来代表一个特定类型的闭包。在这种情况下，闭包拥有一个`i32`的参数并返回一个`i32`，所以泛型的 trait bound 被指定为`Fn(i32) -> i32`。

在函数签名中指定闭包要求使用泛型和 trait bound。每一个闭包都有一个独特的类型，所以不能写出闭包的类型而必须使用泛型。

`Fn`并不是唯一可以指定闭包的 trait bound，事实上有三个：`Fn`、`FnMut`和`FnOnce`。这是在 Rust 中经常见到的三种模式的延续：借用、可变借用和获取所有权。用`Fn`来指定可能只会借用其环境中值的闭包。用`FnMut`来指定会修改环境中值的闭包，而如果闭包会获取环境值的所有权则使用`FnOnce`。大部分情况可以从`Fn`开始，而编译器会根据调用闭包时会发生什么来告诉你是否需要`FnMut`或`FnOnce`。

为了展示拥有闭包作为参数的函数的应用场景，让我们继续下一主题：迭代器。