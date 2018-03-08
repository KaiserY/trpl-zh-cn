## 闭包：可以捕获环境的匿名函数

> [ch13-01-closures.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-01-closures.md)
> <br>
> commit f23a91d6a2f37ba6d415d2c8ca4302bf1b3a4e9e

Rust 的 **闭包**（*closures*）是可以保存进变量或作为参数传递给其他函数的匿名函数。可以在一个地方创建闭包，然后在不同的上下文中执行闭包运算。不同于函数，闭包允许捕获调用者作用域中的值。我们将展示闭包的这些功能如何复用代码和自定义行为。

### 使用闭包创建行为的抽象

让我们看看一个展示储存闭包并在之后执行是如何有价值的用例。其间我们会讨论闭包的语法、类型推断和 trait。

考虑一下这个假想的情况：我们在一个通过 app 生成自定义健身计划的初创企业工作。其后端使用 Rust 编写，而生成健身计划的算法需要考虑很多不同的因素，比如用户的年龄、身体质量指数（Body Mass Index）、用户喜好、最近的健身活动和用户指定的强度系数。本例中实际的算法并不重要，重要的是这个计算只花费几秒钟。我们只希望在需要时调用算法，并且只希望调用一次，这样就不会让用户等得太久。

这里将通过调用 `simulated_expensive_calculation` 函数来模拟调用假象的算法，如示例 13-1 所示，它会打印出 `calculating slowly...`，等待两秒，并接着返回传递给它的数字：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::time::Duration;

fn simulated_expensive_calculation(intensity: u32) -> u32 {
    println!("calculating slowly...");
    thread::sleep(Duration::from_secs(2));
    intensity
}
```

<span class="caption">示例 13-1：一个用来代替假象计算的函数，它大约会执行两秒钟</span>

接下来，`main` 函数中将会包含本例的健身 app 中的重要部分。这代表当用户请求健身计划时 app 会调用的代码。因为与 app 前端的交互与闭包的使用并不相关，所以我们将硬编码代表程序输入的值并打印输出。

所需的输入有：

* **一个来自用户的 intensity 数字**，请求健身计划时指定，它代表用户喜好低强度还是高强度健身。
* **一个随机数**，其会在健身计划中生成变化。

程序的输出将会是建议的锻炼计划。示例 13-2 展示了我们将要使用的 `main` 函数：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let simulated_user_specified_value = 10;
    let simulated_random_number = 7;

    generate_workout(
        simulated_user_specified_value,
        simulated_random_number
    );
}
# fn generate_workout(intensity: u32, random_number: u32) {}
```

<span class="caption">示例 13-2：`main` 函数包含了用于 `generate_workout` 函数的模拟用户输入和模拟随机数输入</span>

处于简单考虑这里硬编码了 `simulated_user_specified_value` 变量的值为 10 和 `simulated_random_number` 变量的值为 7；一个实际的程序会从 app 前端获取强度系数并使用 `rand` crate 来生成随机数，正如第二章的猜猜看游戏所做的那样。`main` 函数使用模拟的输入值调用 `generate_workout` 函数：

现在有了执行上下文，让我们编写算法。示例 13-3 中的 `generate_workout` 函数包含本例中我们最关心的 app 业务逻辑。本例中余下的代码修改都将在这个函数中进行：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
# fn simulated_expensive_calculation(num: u32) -> u32 {
#     println!("calculating slowly...");
#     thread::sleep(Duration::from_secs(2));
#     num
# }
#
fn generate_workout(intensity: u32, random_number: u32) {
    if intensity < 25 {
        println!(
            "Today, do {} pushups!",
            simulated_expensive_calculation(intensity)
        );
        println!(
            "Next, do {} situps!",
            simulated_expensive_calculation(intensity)
        );
    } else {
        if random_number == 3 {
            println!("Take a break today! Remember to stay hydrated!");
        } else {
            println!(
                "Today, run for {} minutes!",
                simulated_expensive_calculation(intensity)
            );
        }
    }
}
```

<span class="caption">示例 13-3：程序的业务逻辑，它根据输入并调用 `simulated_expensive_calculation` 函数来打印出健身计划</span>

示例 13-3 中的代码有多处慢计算函数的调用。第一个 `if` 块调用了 `simulated_expensive_calculation` 两次，外部 `else` 中的 `if` 完全没有调用它，第二个 `else` 中的代码调用了它一次。

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

`generate_workout` 函数的期望行为是首先检查用户需要低强度（由小于 25 的系数表示）锻炼还是高强度（25 或以上）锻炼。

低强度锻炼计划会根据由 `simulated_expensive_calculation` 函数所模拟的复杂算法建议一定数量的俯卧撑和仰卧起坐。

如果用户需要高强度锻炼，这里有一些额外的逻辑：如果 app 生成的随机数刚好是 3，app 相反会建议用户稍做休息并补充水分。如果不是，则用户会从复杂算法中得到数分钟跑步的高强度锻炼计划。

数据科学部门的同学告知我们将来会对调用算法的方式做出一些改变。为了在要做这些改动的时候简化更新步骤，我们将重构代码来让它只调用 `simulated_expensive_calculation` 一次。同时还希望去掉目前多余的连续两次函数调用，并不希望在计算过程中增加任何其他此函数的调用。也就是说，我们不希望在完全无需其结果的情况调用函数，不过仍然希望只调用函数一次。

#### 使用函数重构

有多种方法可以重构此程序。我们首先尝试的是将重复的慢计算函数调用提取到一个变量中，如示例 13-4 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
# fn simulated_expensive_calculation(num: u32) -> u32 {
#     println!("calculating slowly...");
#     thread::sleep(Duration::from_secs(2));
#     num
# }
#
fn generate_workout(intensity: u32, random_number: u32) {
    let expensive_result =
        simulated_expensive_calculation(intensity);

    if intensity < 25 {
        println!(
            "Today, do {} pushups!",
            expensive_result
        );
        println!(
            "Next, do {} situps!",
            expensive_result
        );
    } else {
        if random_number == 3 {
            println!("Take a break today! Remember to stay hydrated!");
        } else {
            println!(
                "Today, run for {} minutes!",
                expensive_result
            );
        }
    }
}
```

<span class="caption">示例 13-4：将 `simulated_expensive_calculation` 调用提取到一个位置，并将结果储存在变量 `expensive_result` 中</span>

这个修改统一了 `simulated_expensive_calculation` 调用并解决了第一个 `if` 块中不必要的两次调用函数的问题。不幸的是，现在所有的情况下都需要调用函数并等待结果，包括那个完全不需要这一结果的内部 `if` 块。

我们希望能够在程序的一个位置指定某些代码，并只在程序的某处实际需要结果的时候 **执行** 这些代码。这正是闭包的用武之地！

#### 重构使用闭包储存代码

不同于总是在 `if` 块之前调用 `simulated_expensive_calculation` 函数并储存其结果，我们可以定义一个闭包并将其储存在变量中，如示例 13-5 所示。实际上可以选择将整个 `simulated_expensive_calculation` 函数体移动到这里引入的闭包中：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
let expensive_closure = |num| {
    println!("calculating slowly...");
    thread::sleep(Duration::from_secs(2));
    num
};
# expensive_closure(5);
```

<span class="caption">示例 13-5：定义一个闭包并储存到变量 `expensive_closure` 中</span>

闭包定义是 `expensive_closure` 赋值的 `=` 之后的部分。闭包的定义以一对竖线（`|`）开始，在竖线中指定闭包的参数；之所以选择这个语法是因为它与 Smalltalk 和 Ruby 的闭包定义类似。这个闭包有一个参数 `num`；如果有多于一个参数，可以使用逗号分隔，比如 `|param1, param2|`。

参数之后是存放闭包体的大括号 ———— 如果闭包体只有一行则大括号是可以省略的。大括号之后闭包的结尾，需要用于 `let` 语句的分号。闭包体的最后一行（`num`）返回的值将是调用闭包时返回的值，因为最后一行没有分号；正如函数体中的一样。

注意这个 `let` 语句意味着 `expensive_closure` 包含一个匿名函数的 **定义**，不是调用匿名函数的 **返回值**。回忆一下使用闭包的原因是我们需要在一个位置定义代码，储存代码，并在之后的位置实际调用它；期望调用的代码现在储存在 `expensive_closure` 中。

定义了闭包之后，可以改变 `if` 块中的代码来调用闭包以执行代码并获取结果值。调用闭包类似于调用函数；指定存放闭包定义的变量名并后跟包含期望使用的参数的括号，如示例 13-6 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
fn generate_workout(intensity: u32, random_number: u32) {
    let expensive_closure = |num| {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    };

    if intensity < 25 {
        println!(
            "Today, do {} pushups!",
            expensive_closure(intensity)
        );
        println!(
            "Next, do {} situps!",
            expensive_closure(intensity)
        );
    } else {
        if random_number == 3 {
            println!("Take a break today! Remember to stay hydrated!");
        } else {
            println!(
                "Today, run for {} minutes!",
                expensive_closure(intensity)
            );
        }
    }
}
```

<span class="caption">示例 13-6：调用定义的 `expensive_closure`</span>

现在耗时的计算只在一个地方被调用，并只会在需要结果的时候执行改代码。

然而，我们又重新引入了示例 13-3 中的问题：仍然在第一个 `if` 块中调用了闭包两次，这会调用慢计算两次并使用户多等待一倍的时间。可以通过在 `if` 块中创建一个本地变量存放闭包调用的结果来解决这个问题，不过正因为使用了闭包还有另一个解决方案。稍后会回到这个方案上；首先讨论一下为何闭包定义中和所涉及的 trait 中没有类型注解。

### 闭包类型推断和注解

闭包不要求像 `fn` 函数那样在参数和返回值上注明类型。函数中需要类型注解是因为他们是暴露给用户的显式接口的一部分。严格的定义这些接口对于保证所有人都认同函数使用和返回值的类型来说是很重要的。但是闭包并不用于这样暴露在外的接口：他们储存在变量中并被使用，不用命名他们或暴露给库的用户调用。

另外，闭包通常很短并只与对应相对任意的场景较小的上下文中。在这些有限制的上下文中，编译器能可靠的推断参数和返回值的类型，类似于它是如何能够推断大部分变量的类型一样。

强制在这些小的匿名函数中注明类型是很恼人的，并且与编译器已知的信息存在大量的重复。

类似于变量，如果相比严格的必要性你更希望增加明确性并变得更啰嗦，可以选择增加类型注解；为示例 13-4 中定义的闭包标注类型将看起来像示例 13-7 中的定义：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
let expensive_closure = |num: u32| -> u32 {
    println!("calculating slowly...");
    thread::sleep(Duration::from_secs(2));
    num
};
```

<span class="caption">示例 13-7：为闭包的参数和返回值增加可选的类型注解</span>

有了类型注解闭包的语法就更类似函数了。如下是一个对其参数加一的函数的定义与拥有相同行为闭包语法的纵向对比。这里增加了一些空格来对齐相应部分。这展示了闭包语法如何类似于函数语法，除了使用竖线而不是括号以及几个可选的语法之外：

```rust,ignore
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

第一行展示了一个函数定义，而第二行展示了一个完整标注的闭包定义。第三行闭包定义中省略了类型注解，而第四行去掉了可选的大括号，因为闭包体只有一行。这些都是有效的闭包定义，并在调用时产生相同的行为。

闭包定义会为每个参数和返回值推断一个具体类型。例如，示例 13-8 中展示了仅仅将参数作为返回值的简短的闭包定义。除了作为示例的目的这个闭包并不是很实用。注意其定义并没有增加任何类型注解：如果尝试调用闭包两次，第一次使用 `String` 类型作为参数而第二次使用 `u32`，则会得到一个错误：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5);
```

<span class="caption">示例 13-8：尝试调用一个被推断为两个不同类型的闭包</span>

编译器给出如下错误：

```text
error[E0308]: mismatched types
 --> src/main.rs
  |
  | let n = example_closure(5);
  |                         ^ expected struct `std::string::String`, found
  integral variable
  |
  = note: expected type `std::string::String`
             found type `{integer}`
```

第一次使用 `String` 值调用 `example_closure` 时，编译器推断 `x` 和此闭包返回值的类型为 `String`。接着这些类型被锁定进闭包 `example_closure` 中，如果尝试对同一闭包使用不同类型则会得到类型错误。

### 使用带有泛型和 `Fn` trait 的闭包

回到我们的健身计划生成 app ，在示例 13-6 中的代码仍然调用了多于需要的慢计算闭包。解决这个问题的一个方法是在全部代码中的每一个需要多个慢计算闭包结果的地方，可以将结果保存进变量以供复用，这样就可以使用变量而不是再次调用闭包。但是这样就会有很多重复的保存结果变量的地方。

幸运的是，还有另一个可用的方案。可以创建一个存放闭包和调用闭包结果的结构体。该结构体只会在需要结果时执行闭包，并会缓存结果值，这样余下的代码就不必再负责保存结果并可以复用该值。你可能见过这种模式被称 *memoization* 或 *lazy evaluation*。

为了让结构体存放闭包，我们需要能够指定闭包的类型，因为结构体定义需要知道其每一个字段的类型。每一个闭包实例有其自己独有的匿名类型：也就是说，即便两个闭包有着相同的签名，他们的类型仍然可以被认为是不同。为了定义使用闭包的结构体、枚举或函数参数，需要像第十章讨论的那样使用泛型和 trait bound。

`Fn` 系列 trait 由标准库提供。所有的闭包都实现了 trait `Fn`、`FnMut` 或 `FnOnce` 中的一个。在下一部分捕获环境部分我们会讨论这些 trait 的区别；在这个例子中可以使用 `Fn` trait。

为了满足 `Fn` trait bound 我们增加了代表闭包所必须的参数和返回值类型的类型。在这个例子中，闭包有一个 `u32` 的参数并返回一个 `u32`，这样所指定的 trait bound 就是 `Fn(u32) -> u32`。

示例 13-9 展示了存放了闭包和一个 Option 结果值的 `Cacher` 结构体的定义：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Cacher<T>
    where T: Fn(u32) -> u32
{
    calculation: T,
    value: Option<u32>,
}
```

<span class="caption">示例 13-9：定义一个 `Cacher` 结构体来在 `calculation` 中存放闭包并在 `value` 中存放 Option 值</span>

结构体 `Cacher` 有一个泛型  `T` 的字段 `calculation`。`T` 的 trait bound 指定了 `T` 是一个使用 `Fn` 的闭包。任何我们希望储存到 `Cacher` 实例的 `calculation` 字段的闭包必须有一个 `u32` 参数（由 `Fn` 之后的括号的内容指定）并必须返回一个 `u32`（由 `->` 之后的内容）。

> 注意：函数也都实现了这三个 `Fn` trait。如果不需要捕获环境中的值，则在需要实现 `Fn` trait 是可以使用函数而不是闭包。

`value` 是 `Option<i32>` 类型的。在执行闭包之前，`value` 将是 `None`。如果使用 `Cacher` 的代码请求闭包的结果，这时会执行闭包并将结果储存在 `value` 字段的 `Some` 成员中。接着如果代码再次请求闭包的结果，这时不再执行闭包，而是会返回存放在 `Some` 成员中的结果。

刚才讨论的有关 `value` 字段逻辑定义于示例 13-10：

<span class="filename">文件名: src/main.rs</span>

```rust
# struct Cacher<T>
#     where T: Fn(u32) -> u32
# {
#     calculation: T,
#     value: Option<u32>,
# }
#
impl<T> Cacher<T>
    where T: Fn(u32) -> u32
{
    fn new(calculation: T) -> Cacher<T> {
        Cacher {
            calculation,
            value: None,
        }
    }

    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.calculation)(arg);
                self.value = Some(v);
                v
            },
        }
    }
}
```

<span class="caption">示例 13-10：`Cacher` 的缓存逻辑</span>

`Cacher` 结构体的字段是私有的，因为我们希望 `Cacher` 管理这些值而不是任由调用代码潜在的直接改变他们。

`Cacher::new` 函数获取一个泛型参数 `T`，它定义于 `impl` 块上下文中并与 `Cacher`  结构体有着相同的 trait bound。`Cacher::new` 返回一个在 `calculation` 字段中存放了指定闭包和在 `value` 字段中存放了 `None` 值的 `Cacher` 实例，因为我们还未执行闭包。

当调用代码需要闭包的执行结果时，不同于直接调用闭包，它会调用 `value` 方法。这个方法会检查 `self.value` 是否已经有了一个 `Some` 的结果值；如果有，它返回 `Some` 中的值并不会再次执行闭包。

如果 `self.value` 是 `None`，则会调用 `self.calculation` 中储存的闭包，将结果保存到 `self.value` 以便将来使用，并同时返回结果值。

示例 13-11 展示了如何在示例 13-6 的 `generate_workout` 函数中利用 `Cacher` 结构体：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::thread;
# use std::time::Duration;
#
# struct Cacher<T>
#     where T: Fn(u32) -> u32
# {
#     calculation: T,
#     value: Option<u32>,
# }
#
# impl<T> Cacher<T>
#     where T: Fn(u32) -> u32
# {
#     fn new(calculation: T) -> Cacher<T> {
#         Cacher {
#             calculation,
#             value: None,
#         }
#     }
#
#     fn value(&mut self, arg: u32) -> u32 {
#         match self.value {
#             Some(v) => v,
#             None => {
#                 let v = (self.calculation)(arg);
#                 self.value = Some(v);
#                 v
#             },
#         }
#     }
# }
#
fn generate_workout(intensity: u32, random_number: u32) {
    let mut expensive_result = Cacher::new(|num| {
        println!("calculating slowly...");
        thread::sleep(Duration::from_secs(2));
        num
    });

    if intensity < 25 {
        println!(
            "Today, do {} pushups!",
            expensive_result.value(intensity)
        );
        println!(
            "Next, do {} situps!",
            expensive_result.value(intensity)
        );
    } else {
        if random_number == 3 {
            println!("Take a break today! Remember to stay hydrated!");
        } else {
            println!(
                "Today, run for {} minutes!",
                expensive_result.value(intensity)
            );
        }
    }
}
```

<span class="caption">示例 13-11：在 `generate_workout` 函数中利用 `Cacher` 结构体来抽象出缓存逻辑</span>

不同于直接将闭包保存进一个变量，我们保存一个新的 `Cacher` 实例来存放闭包。接着，在每一个需要结果的地方，调用 `Cacher` 实例的 `value` 方法。可以调用 `value` 方法任意多次，或者一次也不调用，而慢计算最多只会运行一次。

尝试使用示例 13-2 中的 `main` 函数来运行这段程序，并改变 `simulated_user_specified_value` 和 `simulated_random_number` 变量中的值来验证在所有情况下在多个 `if` 和 `else` 块中，闭包打印的 `calculating slowly...` 只会在需要时出现并只会出现一次。`Cacher` 负责确保不会调用超过所需的慢计算所需的逻辑，这样 `generate_workout` 就可以专注业务逻辑了。

### `Cacher` 实现的限制

值缓存是一种更加广泛的实用行为，我们可能希望在代码中的其他闭包中也使用他们。然而，目前 `Cacher` 的实现存在一些小问题，这使得在不同上下文中复用变得很困难。

第一个问题是 `Cacher` 实例假设对于 `value` 方法的任何 `arg` 参数值总是会返回相同的值。也就是说，这个 `Cacher` 的测试会失败：

```rust,ignore
#[test]
fn call_with_different_values() {
    let mut c = Cacher::new(|a| a);

    let v1 = c.value(1);
    let v2 = c.value(2);

    assert_eq!(v2, 2);
}
```

这个测试使用返回传递给它的值的闭包创建了一个新的 `Cacher` 实例。使用为 1 的 `arg` 和为 2 的 `arg` 调用 `Cacher` 实例的 `value` 方法，同时我们期望使用为 2 的 `arg` 调用 `value` 会返回 2。

使用示例 13-9 和示例 13-10 的 `Cacher` 实现运行测试，它会在 `assert_eq!` 失败并显示如下信息：

```text
thread 'call_with_different_values' panicked at 'assertion failed: `(left == right)`
  left: `1`,
 right: `2`', src/main.rs
```

这里的问题是第一次使用 1 调用 `c.value`，`Cacher` 实例将 `Some(1)` 保存进 `self.value`。在这之后，无论传递什么值调用 `value`，它总是会返回 1。

尝试修改 `Cacher` 存放一个哈希 map 而不是单独一个值。哈希 map 的 key 将是传递进来的 `arg` 值，而 value 则是对应 key 调用闭包的结果值。相比之前检查 `self.value` 直接是 `Some` 还是 `None` 值，现在 `value` 会在哈希 map 中寻找 `arg`，如果存在就返回它。如果不存在，`Cacher` 会调用闭包并将结果值保存在哈希 map 对应 `arg` 值的位置。

当前 `Cacher` 实现的另一个问题是它的应用被限制为只接受获取一个 `u32` 值并返回一个 `u32` 值的闭包。比如说，我们可能需要能够缓存一个获取字符串 slice 并返回 `usize` 值的闭包的结果。请尝试引入更多泛型参数来增加 `Cacher` 功能的灵活性。

### 闭包会捕获其环境

在健身计划生成器的例子中，我们只将闭包作为内联匿名函数来使用。不过闭包还有另一个函数所没有的功能：他们可以捕获其环境并访问其被定义的作用域的变量。

示例 13-12 有一个储存在 `equal_to_x` 变量中闭包的例子，它使用了闭包环境中的变量 `x`：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 4;

    let equal_to_x = |z| z == x;

    let y = 4;

    assert!(equal_to_x(y));
}
```

<span class="caption">示例 13-12：一个引用了其周围作用域中变量的闭包示例</span>

这里，即便 `x` 并不是 `equal_to_x` 的一个参数，`equal_to_x` 闭包也被允许使用变量 `x`，因为它与 `equal_to_x` 定义于相同的作用域。

函数则不能做到同样的事，如果尝试如下例子，它并不能编译：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = 4;

    fn equal_to_x(z: i32) -> bool { z == x }

    let y = 4;

    assert!(equal_to_x(y));
}
```

这会得到一个错误：

```text
error[E0434]: can't capture dynamic environment in a fn item; use the || { ...
} closure form instead
 --> src/main.rs
  |
4 |     fn equal_to_x(z: i32) -> bool { z == x }
  |                                          ^
```

编译器甚至会提示我们这只能用于闭包！

当闭包从环境中捕获一个值，闭包会在闭包体中储存这个值以供使用。这会使用内存并产生额外的开销，当执行不会捕获环境的更通用的代码场景中我们不希望有这些开销。因为函数从未允许捕获环境，定义和使用函数也就从不会有这些额外开销。

闭包可以通过三种方式捕获其环境，他们直接对应函数的三种获取参数的方式：获取所有权，不可变借用和可变借用。这三种捕获值的方式被编码为如下三个 `Fn` trait：

* `FnOnce` 消费从周围作用域捕获的变量，闭包周围的作用域被称为其 **环境**，*environment*。为了消费捕获到的变量，闭包必须获取其所有权并在定义闭包时将其移动进闭包。其名称的 `Once` 部分代表了闭包不能多次获取相同变量的所有权的事实，所以它只能被调用一次。
* `Fn` 从其环境不可变的借用值
* `FnMut` 可变的借用值所以可以改变其环境

当创建一个闭包时，Rust 根据其如何使用环境中变量来推断我们希望如何引用环境。在示例 13-12 中，`equal_to_x` 闭包不可变的借用了 `x`（所以 `equal_to_x` 使用 `Fn` trait），因为闭包体只需要读取 `x` 的值。

如果我们希望强制闭包获取其使用的环境值的所有权，可以在参数列表前使用 `move` 关键字。这个技巧在将闭包传递给新线程以便将数据移动到新线程中时最为实用。

第十六章讨论并发时会展示更多 `move` 闭包的例子，不过现在这里修改了示例 13-12 中的代码（作为演示），在闭包定义中增加 `move` 关键字并使用 vector 代替整型，因为整型可以被拷贝而不是移动；注意这些代码还不能编译：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = vec![1, 2, 3];

    let equal_to_x = move |z| z == x;

    println!("can't use x here: {:?}", x);

    let y = vec![1, 2, 3];

    assert!(equal_to_x(y));
}
```

这个例子并不能编译：

```text
error[E0382]: use of moved value: `x`
 --> src/main.rs:6:40
  |
4 |     let equal_to_x = move |z| z == x;
  |                      -------- value moved (into closure) here
5 |
6 |     println!("can't use x here: {:?}", x);
  |                                        ^ value used here after move
  |
  = note: move occurs because `x` has type `std::vec::Vec<i32>`, which does not
  implement the `Copy` trait
```

`x` 被移动进了闭包，因为闭包使用 `move` 关键字定义。接着闭包获取了 `x` 的所有权，同时 `main` 就不再允许在 `println!` 语句中使用 `x` 了。去掉 `println!` 即可修复问题。

大部分需要指定一个 `Fn` trait bound 的时候，可以从 `Fn` 开始，而编译器会根据闭包体中的情况告诉你是否需要 `FnMut` 或 `FnOnce`。

为了展示闭包作为函数参数时捕获其环境的作用，让我们移动到下一个主题：迭代器。
