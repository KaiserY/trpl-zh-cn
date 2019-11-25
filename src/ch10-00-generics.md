# 泛型、trait 和生命周期

> [ch10-00-generics.md](https://github.com/rust-lang/book/blob/master/src/ch10-00-generics.md)
> <br>
> commit 48b057106646758f6453f42b7887f34b8c24caf6

每一个编程语言都有高效的处理重复概念的工具.在 Rust 中其工具之一就是 **泛型**（*generics*）。泛型是具体类型或其他属性的抽象替代。我们可以表达泛型的属性，比如他们的行为或如何与其他泛型相关联，而不需要在编写和编译代码时知道他们在这里实际上代表什么。

同理为了编写一份可以用于多种具体值的代码，函数并不知道其参数为何值，这时就可以让函数获取泛型而不是像 `i32` 或 `String` 这样的具体值。我们已经使用过第六章的 `Option<T>`，第八章的 `Vec<T>` 和 `HashMap<K, V>`，以及第九章的 `Result<T, E>` 这些泛型了。本章会探索如何使用泛型定义我们自己的类型、函数和方法！

首先，我们将回顾一下提取函数以减少代码重复的机制。接着使用一个只在参数类型上不同的泛型函数来实现相同的功能。我们也会讲到结构体和枚举定义中的泛型。

之后，我们讨论 **trait**，这是一个定义泛型行为的方法。trait 可以与泛型结合来将泛型限制为拥有特定行为的类型，而不是任意类型。

最后介绍 **生命周期**（*lifetimes*），它是一类允许我们向编译器提供引用如何相互关联的泛型。Rust 的生命周期功能允许在很多场景下借用值的同时仍然使编译器能够检查这些引用的有效性。

## 提取函数来减少重复

在介绍泛型语法之前，首先来回顾一个不使用泛型的处理重复的技术：提取一个函数。当熟悉了这个技术以后，我们将使用相同的机制来提取一个泛型函数！如同你识别出可以提取到函数中重复代码那样，你也会开始识别出能够使用泛型的重复代码。

考虑一下这个寻找列表中最大值的小程序，如示例 10-1 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let mut largest = number_list[0];

    for number in number_list {
        if number > largest {
            largest = number;
        }
    }

    println!("The largest number is {}", largest);
#  assert_eq!(largest, 100);
}
```

<span class="caption">示例 10-1：在一个数字列表中寻找最大值的函数</span>

这段代码获取一个整型列表，存放在变量 `number_list` 中。它将列表的第一项放入了变量 `largest` 中。接着遍历了列表中的所有数字，如果当前值大于 `largest` 中储存的值，将 `largest` 替换为这个值。如果当前值小于或者等于目前为止的最大值，`largest` 保持不变。当列表中所有值都被考虑到之后，`largest` 将会是最大值，在这里也就是 100。

如果需要在两个不同的列表中寻找最大值，我们可以重复示例 10-1 中的代码，这样程序中就会存在两段相同逻辑的代码，如示例 10-2 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let mut largest = number_list[0];

    for number in number_list {
        if number > largest {
            largest = number;
        }
    }

    println!("The largest number is {}", largest);

    let number_list = vec![102, 34, 6000, 89, 54, 2, 43, 8];

    let mut largest = number_list[0];

    for number in number_list {
        if number > largest {
            largest = number;
        }
    }

    println!("The largest number is {}", largest);
}
```

<span class="caption">示例 10-2：寻找 **两个** 数字列表最大值的代码</span>

虽然代码能够执行，但是重复的代码是冗余且容易出错的，并且意味着当更新逻辑时需要修改多处地方的代码。

为了消除重复，我们可以创建一层抽象，在这个例子中将表现为一个获取任意整型列表作为参数并对其进行处理的函数。这将增加代码的简洁性并让我们将表达和推导寻找列表中最大值的这个概念与使用这个概念的特定位置相互独立。

在示例 10-3 的程序中将寻找最大值的代码提取到了一个叫做 `largest` 的函数中。这不同于示例 10-1 中的代码只能在一个特定的列表中找到最大的数字，这个程序可以在两个不同的列表中找到最大的数字。

<span class="filename">文件名: src/main.rs</span>

```rust
fn largest(list: &[i32]) -> i32 {
    let mut largest = list[0];

    for &item in list {
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
#    assert_eq!(result, 100);

    let number_list = vec![102, 34, 6000, 89, 54, 2, 43, 8];

    let result = largest(&number_list);
    println!("The largest number is {}", result);
#    assert_eq!(result, 6000);
}
```

<span class="caption">示例 10-3：抽象后的寻找两个数字列表最大值的代码</span>

`largest` 函数有一个参数 `list`，它代表会传递给函数的任何具体的 `i32`值的 slice。函数定义中的 `list` 代表任何 `&[i32]`。当调用 `largest` 函数时，其代码实际上运行于我们传递的特定值上。

总的来说，从示例 10-2 到示例 10-3 中涉及的机制经历了如下几步：

1. 找出重复代码。
2. 将重复代码提取到了一个函数中，并在函数签名中指定了代码中的输入和返回值。
3. 将重复代码的两个实例，改为调用函数。

在不同的场景使用不同的方式，我们也可以利用相同的步骤和泛型来减少重复代码。与函数体可以在抽象`list`而不是特定值上操作的方式相同，泛型允许代码对抽象类型进行操作。

如果我们有两个函数，一个寻找一个 `i32` 值的 slice 中的最大项而另一个寻找 `char` 值的 slice 中的最大项该怎么办？该如何消除重复呢？让我们拭目以待！
