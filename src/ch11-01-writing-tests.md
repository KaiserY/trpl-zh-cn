## 如何编写测试

> [ch11-01-writing-tests.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch11-01-writing-tests.md)
> <br>
> commit 4464eab0892297b83db7134b7ace12762a89b389

测试用来验证非测试的代码是否按照期望的方式运行的 Rust 函数。测试函数体通常执行如下三种操作：

1. 设置任何所需的数据或状态
2. 运行需要测试的代码
3. 断言其结果是我们所期望的


让我们看看 Rust 提供的专门用来编写测试的功能：`test` 属性、一些宏和 `should_panic` 属性。

### 测试函数剖析

作为最简单例子，Rust 中的测试就是一个带有 `test` 属性注解的函数。属性（attribute）是关于 Rust 代码片段的元数据：第五章中结构体中用到的 `derive` 属性就是一个例子。为了将一个函数变成测试函数，需要在 `fn` 行之前加上 `#[test]`。当使用 `cargo test` 命令运行测试函数时，Rust 会构建一个测试执行者二进制文件用来运行标记了 `test` 属性的函数并报告每一个测试是通过还是失败。

第七章当使用 Cargo 新建一个库项目时，它会自动为我们生成一个测试模块和一个测试函数。这有助于我们开始编写测试，因为这样每次开始新项目时不必去查找测试函数的具体结构和语法了。当然也可以额外增加任意多的测试函数以及测试模块！

我们将先通过对自动生成的测试模板做一些试验来探索一些测试如何工作方面的内容，而不实际测试任何代码。接着会写一些真实的测试来调用我们编写的代码并断言他们的行为是否正确。

让我们创建一个新的库项目 `adder`：

```text
$ cargo new adder
     Created library `adder` project
$ cd adder
```

adder 库中 `src/lib.rs` 的内容应该看起来如示例 11-1 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

<span class="caption">示例 11-1：由 `cargo new` 自动生成的测试模块和函数</span>

现在让我们暂时忽略 `tests` 模块和 `#[cfg(test)]` 注解并只关注函数来了解其如何工作。注意 `fn` 行之前的 `#[test]`：这个属性表明这是一个测试函数，这样测试执行者就知道将其作为测试处理。因为也可以在 `tests` 模块中拥有非测试的函数来帮助我们建立通用场景或进行常见操作，所以需要使用 `#[test]` 属性标明哪些函数是测试。

函数体使用 `assert_eq!` 宏断言 2 加 2 等于 4。这个断言作为一个典型测试格式的例子。让我们运行以便看到测试通过。

`cargo test` 命令会运行项目中所有的测试，如示例 11-2 所示：

```text
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.22 secs
     Running target/debug/deps/adder-ce99bcc2479f4607

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

<span class="caption">示例 11-2：运行自动生成测试的输出</span>

Cargo 编译并运行了测试。在 `Compiling`、`Finished` 和 `Running` 这几行之后，可以看到 `running 1 test` 这一行。下一行显示了生成的测试函数的名称，它是 `it_works`，以及测试的运行结果，`ok`。接着可以看到全体测试运行结果的总结：`test result: ok.` 意味着所有测试都通过了。`1 passed; 0 failed` 表示通过或失败的测试数量。

这里并没有任何被标记为忽略的测试，所以总结表明 `0 ignored`。我们也没有过滤需要运行的测试，所以总结的结尾显示`0 filtered out`。在下一部分 “控制测试如何运行” 会讨论忽略和过滤测试。

`0 measured` 统计是针对性能测试的。性能测试（benchmark tests）在编写本书时，仍只能用于 Rust 开发版（nightly Rust）。请查看第一章来了解更多 Rust 开发版的信息。

测试输出中以 `Doc-tests adder` 开头的这一部分是所有文档测试的结果。现在并没有任何文档测试，不过 Rust 会编译任何出现在 API 文档中的代码示例。这个功能帮助我们使文档和代码保持同步！在第十四章的 “文档注释” 部分会讲到如何编写文档测试。现在我们将忽略 `Doc-tests` 部分的输出。

让我们改变测试的名称并看看这如何改变测试的输出。给 `it_works` 函数起个不同的名字，比如 `exploration`，像这样：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn exploration() {
        assert_eq!(2 + 2, 4);
    }
}
```

并再次运行 `cargo test`。现在输出中将出现 `exploration` 而不是 `it_works`：

```text
running 1 test
test tests::exploration ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

让我们增加另一个测试，不过这一次是一个会失败的测试！当测试函数中出现 panic 时测试就失败了。每一个测试都在一个新线程中运行，当主线程发现测试线程异常了，就将对应测试标记为失败。第九章讲到了最简单的造成 panic 的方法：调用 `panic!` 宏。写入新测试 `another` 后， src/lib.rs` 现在看起来如示例 11-3 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn exploration() {
        assert_eq!(2 + 2, 4);
    }

    #[test]
    fn another() {
        panic!("Make this test fail");
    }
}
```

<span class="caption">示例 11-3：增加第二个测试：他会因为调用了 `panic!` 宏而失败</span>


再次 `cargo test` 运行测试。输出应该看起来像示例 11-4，它表明 `exploration` 测试通过了而 `another` 失败了：

```text
running 2 tests
test tests::exploration ... ok
test tests::another ... FAILED

failures:

---- tests::another stdout ----
    thread 'tests::another' panicked at 'Make this test fail', src/lib.rs:10:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::another

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out

error: test failed
```

<span class="caption">示例 11-4：一个测试通过和一个测试失败的测试结果</span>

`test tests::another` 这一行是 `FAILED` 而不是 `ok` 了。在单独测试结果和总结之间多了两个新的部分：第一个部分显示了测试失败的详细原因。在这个例子中，`another` 因为 `panicked at 'Make this test fail'` 而失败，这位于 *src/lib.rs* 的第 10 行。下一部分仅仅列出了所有失败的测试，这在有很多测试和很多失败测试的详细输出时很有帮助。可以使用失败测试的名称来只运行这个测试，这样比较方便调试；下一部分 “控制测试如何运行” 会讲到更多运行测试的方法。

最后是总结行：总体上讲，测试结果是 `FAILED`。有一个测试通过和一个测试失败。

现在我们见过不同场景中测试结果是什么样子的了，再来看看除 `panic!` 之外的一些在测试中有帮助的宏吧。

### 使用 `assert!` 宏来检查结果

`assert!` 宏由标准库提供，在希望确保测试中一些条件为 `true` 时非常有用。需要向 `assert!` 宏提供一个计算为布尔值的参数。如果值是 `true`，`assert!` 什么也不做同时测试会通过。如果值为 `false`，`assert!` 调用 `panic!` 宏，这会导致测试失败。`assert!` 宏帮助我们检查代码是否以期望的方式运行。

回忆一下第五章中，示例 5-15 中有一个 `Rectangle` 结构体和一个 `can_hold` 方法，在示例 11-5 中再次使用他们。将他们放进 *src/lib.rs* 并使用 `assert!` 宏编写一些测试。

<span class="filename">文件名: src/lib.rs</span>

```rust
#[derive(Debug)]
pub struct Rectangle {
    length: u32,
    width: u32,
}

impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length > other.length && self.width > other.width
    }
}
```

<span class="caption">示例 11-5：第五章中 `Rectangle` 结构体和其 `can_hold` 方法</span>

`can_hold` 方法返回一个布尔值，这意味着它完美符合 `assert!` 宏的使用场景。在示例 11-6 中，让我们编写一个 `can_hold` 方法的测试来作为练习，这里创建一个长为 8 宽为 7 的 `Rectangle` 实例，并假设它可以放得下另一个长为 5 宽为 1 的 `Rectangle` 实例：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle { length: 8, width: 7 };
        let smaller = Rectangle { length: 5, width: 1 };

        assert!(larger.can_hold(&smaller));
    }
}
```

<span class="caption">示例 11-6：一个 `can_hold` 的测试，检查一个较大的矩形确实能放得下一个较小的矩形</span>

注意在 `tests` 模块中新增加了一行：`use super::*;`。`tests` 是一个普通的模块，它遵循第七章 “私有性规则” 部分介绍的常用可见性规则。因为这是一个内部模块，需要将外部模块中被测试的代码引入到内部模块的作用域中。这里选择使用全局导入使得外部模块定义的所有内容在 `tests` 模块中都是可用的。

我们将测试命名为 `larger_can_hold_smaller`，并创建所需的两个 `Rectangle` 实例。接着调用 `assert!` 宏并传递 `larger.can_hold(&smaller)` 调用的结果作为参数。这个表达式预期会返回 `true`，所以测试应该通过。让我们拭目以待！

```text
running 1 test
test tests::larger_can_hold_smaller ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

它确实通过了！再来增加另一个测试，这一回断言一个更小的矩形不能放下一个更大的矩形：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        // --snip--
    }

    #[test]
    fn smaller_cannot_hold_larger() {
        let larger = Rectangle { length: 8, width: 7 };
        let smaller = Rectangle { length: 5, width: 1 };

        assert!(!smaller.can_hold(&larger));
    }
}
```

因为这里 `can_hold` 函数的正确结果是 `false`，我们需要将这个结果取反后传递给 `assert!` 宏。这样的话，测试就会通过而 `can_hold` 将返回`false`：

```text
running 2 tests
test tests::smaller_cannot_hold_larger ... ok
test tests::larger_can_hold_smaller ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

两个通过的测试！现在让我们看看如果引入一个 bug 的话测试结果会发生什么。将 `can_hold` 方法中比较长度时本应使用大于号的地方改成小于号：

```rust
# #[derive(Debug)]
# pub struct Rectangle {
#     length: u32,
#     width: u32,
# }
// --snip--

impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length < other.length && self.width > other.width
    }
}
```

现在运行测试会产生：

```text
running 2 tests
test tests::smaller_cannot_hold_larger ... ok
test tests::larger_can_hold_smaller ... FAILED

failures:

---- tests::larger_can_hold_smaller stdout ----
    thread 'tests::larger_can_hold_smaller' panicked at 'assertion failed:
    larger.can_hold(&smaller)', src/lib.rs:22:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::larger_can_hold_smaller

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

我们的测试捕获了 bug！因为 `larger.length` 是 8 而 `smaller.length` 是 5，`can_hold` 中的长度比较现在因为 8 不小于 5 而返回 `false`。

### 使用 `assert_eq!` 和 `assert_ne!` 宏来测试相等

测试功能的一个常用方法是将需要测试代码的值与期望值做比较，并检查是否相等。可以通过向 `assert!` 宏传递一个使用 `==` 运算符的表达式来做到。不过这个操作实在是太常见了，以至于标注库提供了一对宏来更方便的处理这些操作：`assert_eq!` 和 `assert_ne!`。这两个宏分别比较两个值是相等还是不相等。当断言失败时他们也会打印出这两个值具体是什么，以便于观察测试 **为什么** 失败，而 `assert!` 只会打印出它从 `==` 表达式中得到了 `false` 值，而不是导致 `false` 的两个值。

示例 11-7 中，让我们编写一个对其参数加二并返回结果的函数 `add_two`。接着使用 `assert_eq!` 宏测试这个函数：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds_two() {
        assert_eq!(4, add_two(2));
    }
}
```

<span class="caption">示例 11-7：使用 `assert_eq!` 宏测试 `add_two`</span>

测试通过了！

```text
running 1 test
test tests::it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

传递给 `assert_eq!` 宏的第一个参数，4，等于调用 `add_two(2)` 的结果。我们将会看到这个测试的那一行说 `test tests::it_adds_two ... ok`，`ok` 表明测试通过了！

在代码中引入一个 bug 来看看使用 `assert_eq!` 的测试失败是什么样的。修改 `add_two` 函数的实现使其加 3：

```rust
pub fn add_two(a: i32) -> i32 {
    a + 3
}
```

再次运行测试：

```text
running 1 test
test tests::it_adds_two ... FAILED

failures:

---- tests::it_adds_two stdout ----
        thread 'tests::it_adds_two' panicked at 'assertion failed: `(left == right)`
  left: `4`,
 right: `5`', src/lib.rs:11:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::it_adds_two

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

测试捕获到了 bug！`it_adds_two` 测试失败，显示信息 `` assertion failed: `(left == right)` `` 并表明 `left` 是 `4` 而 `right` 是 `5`。这个信息有助于我们开始调试：它说 `assert_eq!` 的 `left` 参数是 `4`，而 `right` 参数，也就是 `add_two(2)` 的结果，是 `5`。

注意在一些语言和测试框架中，断言两个值相等的函数的参数叫做 `expected` 和 `actual`，而且指定参数的顺序是需要注意的。然而在 Rust 中，他们则叫做 `left` 和 `right`，同时指定期望的值和被测试代码产生的值的顺序并不重要。这个测试中的断言也可以写成 `assert_eq!(add_two(2), 4)`，这时错误信息会变成 `` assertion failed: `(left == right)` `` 其中 `left` 是 `5` 而 `right` 是 `4`。

`assert_ne!` 宏在传递给它的两个值不相等时通过而在相等时失败。这个宏在代码按照我们期望运行时不确定值 **会** 是什么，不过知道他们绝对 **不会** 是什么的时候最有用处。例如，如果一个函数确定会以某种方式改变其输出，不过这种方式由运行测试是星期几来决定，这时最好的断言可能就是函数的输出不等于其输入。

`assert_eq!` 和 `assert_ne!` 宏在底层分别使用了 `==` 和 `!=`。当断言失败时，这些宏会使用调试格式打印出其参数，这意味着被比较的值必需实现了 `PartialEq` 和 `Debug` trait。所有的基本类型和大部分标准库类型都实现了这些 trait。对于自定义的结构体和枚举，需要实现 `PartialEq` 才能断言他们的值是否相等。需要实现 `Debug` 才能在断言失败时打印他们的值。因为这两个 trait 都是派生 trait，如第五章示例 5-12 所提到的，通常可以直接在结构体或枚举上添加 `#[derive(PartialEq, Debug)]` 注解。附录 C 中有更多关于这些和其他派生 trait 的详细信息。

### 自定义错误信息

也可以向 `assert!`、`assert_eq!` 和 `assert_ne!` 宏传递一个可选的参数来增加用于打印的自定义错误信息。任何在 `assert!` 必需的一个参数和 `assert_eq!` 和 `assert_ne!` 必需的两个参数之后指定的参数都会传递给第八章讲到的 `format!` 宏，所以可以传递一个包含 `{}` 占位符的格式字符串和放入占位符的值。自定义信息有助于记录断言的意义，这样到测试失败时，就能更好的理解代码出了什么问题。

例如，比如说有一个根据人名进行问候的函数，而我们希望测试将传递给函数的人名显示在输出中：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub fn greeting(name: &str) -> String {
    format!("Hello {}!", name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(result.contains("Carol"));
    }
}
```

这个程序的需求还没有被确定，而我们非常确定问候开始的 `Hello` 文本不会改变。我们决定并不想在人名改变时不得不更新测试，所以相比检查 `greeting` 函数返回的确切的值，我们将仅仅断言输出的文本中包含输入参数。

让我们通过将 `greeting` 改为不包含 `name` 来在代码中引入一个 bug 来测试失败时是怎样的，

```rust
pub fn greeting(name: &str) -> String {
    String::from("Hello!")
}
```

运行测试会产生：

```text
running 1 test
test tests::greeting_contains_name ... FAILED

failures:

---- tests::greeting_contains_name stdout ----
        thread 'tests::greeting_contains_name' panicked at 'assertion failed:
result.contains("Carol")', src/lib.rs:12:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::greeting_contains_name
```

这仅仅告诉了我们断言失败了和失败的行号。一个更有用的错误信息应该打印出从 `greeting` 函数得到的值。让我们改变测试函数来使用一个由包含占位符的格式字符串和从 `greeting` 函数取得的值组成的自定义错误信息：

```rust,ignore
#[test]
fn greeting_contains_name() {
    let result = greeting("Carol");
    assert!(
        result.contains("Carol"),
        "Greeting did not contain name, value was `{}`", result
    );
}
```

现在如果再次运行测试，将会看到更有价值的错误信息：


```text
---- tests::greeting_contains_name stdout ----
        thread 'tests::greeting_contains_name' panicked at 'Greeting did not
contain name, value was `Hello!`', src/lib.rs:12:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

可以在测试输出中看到所取得的确切的值，这会帮助我们理解真正发生了什么而不是期望发生什么。

### 使用 `should_panic` 检查 panic

除了检查代码是否返回期望的正确的值之外，检查代码是否按照期望处理错误情况也是很重要的。例如，考虑第九章示例 9-9 创建的 `Guess` 类型。其他使用 `Guess` 的代码依赖于 `Guess` 实例只会包含 1 到 100 的值的保证。可以编写一个测试来确保创建一个超出范围的值的 `Guess` 实例会 panic。

可以通过对函数增加另一个属性 `should_panic` 来实现这些。这个属性在函数中的代码 panic 时会通过，而在其中的代码没有 panic 时失败。

示例 11-8 展示了如何编写一个测试来检查 `Guess::new` 按照我们的期望出现的错误情况：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct Guess {
    value: u32,
}

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

<span class="caption">示例 11-8：测试会造成 `panic!` 的条件</span>

`#[should_panic]` 属性位于 `#[test]` 之后和对应的测试函数之前。让我们看看测试通过时它是什么样子：

```text
running 1 test
test tests::greater_than_100 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

看起来不错！现在在代码中引入 bug，移除 `new` 函数在值大于 100 时会 panic 的条件：

```rust
# pub struct Guess {
#     value: u32,
# }
#
// --snip--

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1  {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value
        }
    }
}
```

如果运行示例 11-8 的测试，它会失败：

```text
running 1 test
test tests::greater_than_100 ... FAILED

failures:

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

这回并没有得到非常有用的信息，不过一旦我们观察测试函数，会发现它标注了 `#[should_panic]`。这个错误意味着代码中函数 `Guess::new(200)` 并没有产生 panic。

然而 `should_panic` 测试可能是非常含糊不清的，因为他们只是告诉我们代码并没有产生 panic。`should_panic` 甚至在测试因为其他不同的原因而不是我们期望发生的情况而 panic 时也会通过。为了使 `should_panic` 测试更精确，可以给 `should_panic` 属性增加一个可选的 `expected` 参数。测试工具会确保错误信息中包含其提供的文本。例如，考虑示例 11-9 中修改过的 `Guess`，这里 `new` 函数根据其值是过大还或者过小而提供不同的 panic 信息：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct Guess {
#     value: u32,
# }
#
// --snip--

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1 {
            panic!("Guess value must be greater than or equal to 1, got {}.",
                   value);
        } else if value > 100 {
            panic!("Guess value must be less than or equal to 100, got {}.",
                   value);
        }

        Guess {
            value
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "Guess value must be less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

<span class="caption">示例 11-9：一个会带有特定错误信息的 `panic!` 条件的测试</span>

这个测试会通过，因为 `should_panic` 属性中 `expected` 参数提供的值是 `Guess::new` 函数 panic 信息的子字符串。我们可以指定期望的整个 panic 信息，在这个例子中是 `Guess value must be less than or equal to 100, got 200.`。这依赖于 panic 有多独特或动态，和你希望测试有多准确。在这个例子中，错误信息的子字符串足以确保函数在 `else if value > 100` 的情况下运行。

为了观察带有 `expected` 信息的 `should_panic` 测试失败时会发生什么，让我们再次引入一个 bug，将 `if value < 1` 和 `else if value > 100` 的代码块对换：

```rust,ignore
if value < 1 {
    panic!("Guess value must be less than or equal to 100, got {}.", value);
} else if value > 100 {
    panic!("Guess value must be greater than or equal to 1, got {}.", value);
}
```

这一次运行 `should_panic` 测试，它会失败：

```text
running 1 test
test tests::greater_than_100 ... FAILED

failures:

---- tests::greater_than_100 stdout ----
        thread 'tests::greater_than_100' panicked at 'Guess value must be
greater than or equal to 1, got 200.', src/lib.rs:11:12
note: Run with `RUST_BACKTRACE=1` for a backtrace.
note: Panic did not include expected string 'Guess value must be less than or
equal to 100'

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

错误信息表明测试确实如期望 panic 了，不过 panic 信息是 `did not include expected string 'Guess value must be less than or equal to 100'`。可以看到我们得到的 panic 信息，在这个例子中是 `Guess value must be greater than or equal to 1, got 200.`。这样就可以开始寻找 bug 在哪了！

现在你知道了几种编写测试的方法，让我们看看运行测试时会发生什么并讨论可以用于 `cargo test` 的不同选项。