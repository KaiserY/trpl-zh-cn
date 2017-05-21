## 编写测试

> [ch11-01-writing-tests.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch11-01-writing-tests.md)
> <br>
> commit c6162d22288253b2f2a017cfe96cf1aa765c2955

测试用来验证非测试的代码按照期望的方式运行的 Rust 函数。测试函数体通常包括一些设置，运行需要测试的代码，接着断言其结果是我们所期望的。让我们看看 Rust 提供的具体用来编写测试的功能：`test`属性、一些宏和`should_panic`属性。

### 测试函数剖析

作为最简单例子，Rust 中的测试就是一个带有`test`属性注解的函数。属性（attribute）是关于 Rust 代码片段的元数据：第五章中结构体中用到的`derive`属性就是一个例子。为了将一个函数变成测试函数，需要在`fn`行之前加上`#[test]`。当使用`cargo test`命令运行测试函数时，Rust 会构建一个测试执行者二进制文件用来运行标记了`test`属性的函数并报告每一个测试是通过还是失败。


<!-- is it annotated with `test` by the user, or only automatically? I think
it's the latter, and has edited with a more active tone to make that clear, but
please change if I'm wrong -->
<!-- What do you mean by "only automatically"? The reader should be typing in
`#[test] on their own when they add new test functions; there's nothing special
about that text. I'm not sure what part of this chapter implied "only
automatically", can you point out where that's happening if we haven't taken
care of it? /Carol -->

第七章当使用 Cargo 新建一个库项目时，它会自动为我们生成一个测试模块和一个测试函数。这有助于我们开始编写测试，因为这样每次开始新项目时不必去查找测试函数的具体结构和语法了。同时可以额外增加任意多的测试函数以及测试模块！

我们将先通过对自动生成的测试模板做一些试验来探索测试如何工作的一些方面内容，而不实际测试任何代码。接着会写一些真实的测试来调用我们编写的代码并断言他们的行为是正确的。

让我们创建一个新的库项目`adder`：

```
$ cargo new adder
     Created library `adder` project
$ cd adder
```

adder 库中`src/lib.rs`的内容应该看起来像这样：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
    }
}
```

<span class="caption">Listing 11-1: The test module and function generated
automatically for us by `cargo new` </span>

现在让我们暂时忽略`tests`模块和`#[cfg(test)]`注解并只关注函数。注意`fn`行之前的`#[test]`：这个属性表明这是一个测试函数，这样测试执行者就知道将其作为测试处理。也可以在`tests`模块中拥有非测试的函数来帮助我们建立通用场景或进行常见操作，所以需要使用`#[test]`属性标明哪些函数是测试。

这个函数目前没有任何内容，这意味着没有代码会使测试失败；一个空的测试是可以通过的！让我们运行一下看看它是否通过了。

`cargo test`命令会运行项目中所有的测试，如列表 11-2 所示：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.22 secs
     Running target/debug/deps/adder-ce99bcc2479f4607

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

<span class="caption">Listing 11-2: The output from running the one
automatically generated test </span>

Cargo 编译并运行了测试。在`Compiling`、`Finished`和`Running`这几行之后，可以看到`running 1 test`这一行。下一行显示了生成的测试函数的名称，它是`it_works`，以及测试的运行结果，`ok`。接着可以看到全体测试运行结果的总结：`test result: ok.`意味着所有测试都通过了。`1 passed; 0 failed`表示通过或失败的测试数量。

这里并没有任何被标记为忽略的测试，所以总结表明`0 ignored`。在下一部分关于运行测试的不同方式中会讨论忽略测试。`0 measured`统计是针对测试性能的性能测试的。性能测试（benchmark tests）在编写本书时，仍只属于开发版 Rust（nightly Rust）。请查看附录 D 来了解更多开发版 Rust 的信息。

测试输出中以`Doc-tests adder`开头的下一部分是所有文档测试的结果。现在并没有任何文档测试，不过 Rust 会编译任何出现在 API 文档中的代码示例。这个功能帮助我们使文档和代码保持同步！在第十四章的“文档注释”部分会讲到如何编写文档测试。现在我们将忽略`Doc-tests`部分的输出。

<!-- I might suggest changing the name of the function, could be misconstrued
as part of the test output! -->
<!-- `it_works` is always the name that `cargo new` generates for the first
test function, though. We wanted to show the reader what happens when you run
the tests immediately after generating a new project; they pass without you
needing to change anything. I've added a bit to walk through changing the
function name and seeing how the output changes; I hope that's sufficient.
/Carol -->

让我们改变测试的名称并看看这如何改变测试的输出。给`it_works`函数起个不同的名字，比如`exploration`，像这样：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn exploration() {
    }
}
```

并再次运行`cargo test`。现在输出中将出现`exploration`而不是`it_works`：

```
running 1 test
test tests::exploration ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

让我们增加另一个测试，不过这一次是一个会失败的测试！当测试函数中出现 panic 时测试就失败了。第九章讲到了最简单的造成 panic 的方法：调用`panic!`宏！写入新函数后 `src/lib.rs` 现在看起来如列表 11-3 所示：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn exploration() {
    }

    #[test]
    fn another() {
        panic!("Make this test fail");
    }
}
```

<span class="caption">Listing 11-3: Adding a second test; one that will fail
since we call the `panic!` macro </span>


再次`cargo test`运行测试。输出应该看起来像列表 11-4，它表明`exploration`测试通过了而`another`失败了：


```text
running 2 tests
test tests::exploration ... ok
test tests::another ... FAILED

failures:

---- tests::another stdout ----
	thread 'tests::another' panicked at 'Make this test fail', src/lib.rs:9
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::another

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured

error: test failed
```

<span class="caption">Listing 11-4: Test results when one test passes and one
test fails </span>

`test tests::another`这一行是`FAILED`而不是`ok`了。在单独测试结果和总结之间多了两个新的部分：第一个部分显示了测试失败的详细原因。在这个例子中，`another`因为`panicked at 'Make this test fail'`而失败，这位于 *src/lib.rs* 的第 9 行。下一部分仅仅列出了所有失败的测试，这在很有多测试和很多失败测试的详细输出时很有帮助。可以使用失败测试的名称来只运行这个测试，这样比较方便调试；下一部分会讲到更多运行测试的方法。

最后是总结行：总体上讲，一个测试结果是`FAILED`的。有一个测试通过和一个测试失败。

现在我们见过不同场景中测试结果是什么样子的了，再来看看除了`panic!`之外一些在测试中有帮助的宏吧。

### 使用`assert!`宏来检查结果

`assert!`宏由标准库提供，在希望确保测试中一些条件为`true`时非常有用。需要向`assert!`宏提供一个计算为布尔值的参数。如果值是`true`，`assert!`什么也不做同时测试会通过。如果值为`false`，`assert!`调用`panic!`宏，这会导致测试失败。这是一个帮助我们检查代码是否以期望的方式运行的宏。

<!-- what kind of thing can be passed as an argument? Presumably when we use it
for real we won't pass it `true` or `false` as an argument, but some condition
that will evaluate to true or false? In which case, should below be phrased "If
the argument evaluates to true" and an explanation of that? Or maybe even a
working example would be better, this could be misleading -->
<!-- We were trying to really break it down, to show just how the `assert!`
macro works and what it looks like for it to pass or fail, before we got into
calling actual code. We've changed this section to move a bit faster and just
write actual tests instead. /Carol -->

回忆一下第五章中，列表 5-9 中有一个`Rectangle`结构体和一个`can_hold`方法，在列表 11-5 中再次使用他们。将他们放进 *src/lib.rs* 而不是 *src/main.rs* 并使用`assert!`宏编写一些测试。

<!-- Listing 5-9 wasn't marked as such; I'll fix it the next time I get Chapter
5 for editing. /Carol -->

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 11-5: The `Rectangle` struct and its `can_hold`
method from Chapter 5 </span>

`can_hold`方法返回一个布尔值，这意味着它完美符合`assert!`宏的使用场景。在列表 11-6 中，让我们编写一个`can_hold`方法的测试来作为练习，这里创建一个长为 8 宽为 7 的`Rectangle`实例，并假设它可以放得下另一个长为5 宽为 1 的`Rectangle`实例：

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 11-6: A test for `can_hold` that checks that a
larger rectangle indeed holds a smaller rectangle </span>

注意在`tests`模块中新增加了一行：`use super::*;`。`tests`是一个普通的模块，它遵循第七章介绍的通常的可见性规则。因为这是一个内部模块，需要将外部模块中被测试的代码引入到内部模块的作用域中。这里选择使用全局导入使得外部模块定义的所有内容在`tests`模块中都是可用的。

我们将测试命名为`larger_can_hold_smaller`，并创建所需的两个`Rectangle`实例。接着调用`assert!`宏并传递`larger.can_hold(&smaller)`调用的结果作为参数。这个表达式预期会返回`true`，所以测试应该通过。让我们拭目以待！

```
running 1 test
test tests::larger_can_hold_smaller ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

它确实通过了！再来增加另一个测试，这一回断言一个更小的矩形不能放下一个更大的矩形：

<span class="filename">Filename: src/lib.rs</span>

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

    #[test]
    fn smaller_can_hold_larger() {
        let larger = Rectangle { length: 8, width: 7 };
        let smaller = Rectangle { length: 5, width: 1 };

        assert!(!smaller.can_hold(&larger));
    }
}
```

因为这里`can_hold`函数的正确结果是`false`，我们需要将这个结果取反后传递给`assert!`宏。这样的话，测试就会通过而`can_hold`将返回`false`：

```
running 2 tests
test tests::smaller_can_hold_larger ... ok
test tests::larger_can_hold_smaller ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

这个通过的测试！现在让我们看看如果引入一个 bug 的话测试结果会发生什么。将`can_hold`方法中比较长度时本应使用大于号的地方改成小于号：

```rust
#[derive(Debug)]
pub struct Rectangle {
    length: u32,
    width: u32,
}

impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length < other.length && self.width > other.width
    }
}
```

现在运行测试会产生：

```
running 2 tests
test tests::smaller_can_hold_larger ... ok
test tests::larger_can_hold_smaller ... FAILED

failures:

---- tests::larger_can_hold_smaller stdout ----
	thread 'tests::larger_can_hold_smaller' panicked at 'assertion failed:
    larger.can_hold(&smaller)', src/lib.rs:22
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::larger_can_hold_smaller

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured
```

我们的测试捕获了 bug！因为`larger.length`是 8 而`smaller.length` 是 5，`can_hold`中的长度比较现在返回`false`因为 8 不小于 5。

### 使用`assert_eq!`和`assert_ne!`宏来测试相等

测试功能的一个常用方法是将需要测试代码的值与期望值做比较，并检查是否相等。可以通过向`assert!`宏传递一个使用`==`宏的表达式来做到。不过这个操作实在是太常见了，以至于标注库提供了一对宏来方便处理这些操作：`assert_eq!`和`assert_ne!`。这两个宏分别比较两个值是相等还是不相等。当断言失败时他们也会打印出这两个值具体是什么，以便于观察测试**为什么**失败，而`assert!`只会打印出它从`==`表达式中得到了`false`值，而不是导致`false`值的原因。

列表 11-7 中，让我们编写一个对其参数加二并返回结果的函数`add_two`。接着使用`assert_eq!`宏测试这个函数：

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 11-7: Testing the function `add_two` using the
`assert_eq!` macro </span>

测试通过了！

```
running 1 test
test tests::it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

传递给`assert_eq!`宏的第一个参数，4，等于调用`add_two(2)`的结果。我们将会看到这个测试的那一行说`test tests::it_adds_two ... ok`，`ok`表明测试通过了！

在代码中引入一个 bug 来看看使用`assert_eq!`的测试失败是什么样的。修改`add_two`函数的实现使其加 3：

```rust
pub fn add_two(a: i32) -> i32 {
    a + 3
}
```

再次运行测试：

```
running 1 test
test tests::it_adds_two ... FAILED

failures:

---- tests::it_adds_two stdout ----
	thread 'tests::it_adds_two' panicked at 'assertion failed: `(left ==
    right)` (left: `4`, right: `5`)', src/lib.rs:11
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::it_adds_two

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured
```

测试捕获到了 bug！`it_adds_two`测试失败并显示信息`` assertion failed: `(left == right)` (left: `4`, right: `5`) ``。这个信息有助于我们开始调试：它说`assert_eq!`的`left`参数是 4，而`right`参数，也就是`add_two(2)`的结果，是 5。

注意在一些语言和测试框架中，断言两个值相等的函数的参数叫做`expected`和`actual`，而且指定参数的顺序是需要注意的。然而在 Rust 中，他们则叫做`left`和`right`，同时指定期望的值和被测试代码产生的值的顺序并不重要。这个测试中的断言也可以写成`assert_eq!(add_two(2), 4)`，这时错误信息会变成`` assertion failed: `(left == right)` (left: `5`, right: `4`) ``。

`assert_ne!`宏在传递给它的两个值不相等时通过而在相等时失败。这个宏在代码按照我们期望运行时不确定值**应该**是什么，不过知道他们绝对**不应该**是什么的时候最有用处。例如，如果一个函数确定会以某种方式改变其输出，不过这种方式由运行测试是星期几来决定，这时最好的断言可能就是函数的输出不等于其输入。

`assert_eq!`和`assert_ne!`宏在底层分别使用了`==`和`!=`。当断言失败时，这些宏会使用调试格式打印出其参数，这意味着被比较的值必需实现了`PartialEq`和`Debug` trait。所有的基本类型和大部分标准库类型都实现了这些 trait。对于自定义的结构体和枚举，需要实现 `PartialEq`才能断言他们的值是否相等。需要实现 `Debug`才能在断言失败时打印他们的值。因为这两个 trait 都是可推导 trait，如第五章所提到的，通常可以直接在结构体或枚举上添加`#[derive(PartialEq, Debug)]`注解。附录 C 中有更多关于这些和其他可推导 trait 的详细信息。

### 自定义错误信息

也可以向`assert!`、`assert_eq!`和`assert_ne!`宏传递一个可选的参数来增加用于打印的自定义错误信息。任何在`assert!`必需的一个参数和`assert_eq!`和`assert_ne!`必需的两个参数之后指定的参数都会传递给第八章讲到的`format!`宏，所以可以传递一个包含`{}`占位符的格式字符串和放入占位符的值。自定义信息有助于记录断言的意义，这样到测试失败时，就能更好的例子代码出了什么问题。

例如，比如说有一个根据人名进行问候的函数，而我们希望测试将传递给函数的人名显示在输出中：

<span class="filename">Filename: src/lib.rs</span>

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

这个程序的需求还没有被确定，而我们非常确定问候开始的`Hello`文本不会改变。我们决定并不想在人名改变时
不得不更新测试，所以相比检查`greeting`函数返回的确切的值，我们将仅仅断言输出的文本中包含输入参数。

让我们通过改变`greeting`不包含`name`来在代码中引入一个 bug 来测试失败时是怎样的，

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
    result.contains("Carol")', src/lib.rs:12
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::greeting_contains_name
```

这仅仅告诉了我们断言失败了和失败的行号。一个更有用的错误信息应该打印出从`greeting`函数得到的值。让我们改变测试函数来使用一个由包含占位符的格式字符串和从`greeting`函数取得的值组成的自定义错误信息：

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

```
---- tests::greeting_contains_name stdout ----
	thread 'tests::greeting_contains_name' panicked at 'Greeting did not contain
    name, value was `Hello`', src/lib.rs:12
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

可以在测试输出中看到所取得的确切的值，这会帮助我们理解发生了什么而不是期望发生什么。

### 使用`should_panic`检查 panic

除了检查代码是否返回期望的正确的值之外，检查代码是否按照期望处理错误情况也是很重要的。例如，考虑第九章列表 9-8 创建的`Guess`类型。其他使用`Guess`的代码依赖于`Guess`实例只会包含 1 到 100 的值的保证。可以编写一个测试来确保创建一个超出范围的值的`Guess`实例会 panic。

可以通过对函数增加另一个属性`should_panic`来实现这些。这个属性在函数中的代码 panic 时会通过，而在其中的代码没有 panic 时失败。

列表 11-8 展示了如何编写一个测试来检查`Guess::new`按照我们的期望出现的错误情况：

<span class="filename">Filename: src/lib.rs</span>

```rust
struct Guess {
    value: u32,
}

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value: value,
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

<span class="caption">Listing 11-8: Testing that a condition will cause a
`panic!` </span>

`#[should_panic]`属性位于`#[test]`之后和对应的测试函数之前。让我们看看测试通过时它时什么样子：

```
running 1 test
test tests::greater_than_100 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

看起来不错！现在在代码中引入 bug，通过移除`new`函数在值大于 100 时会 panic 的条件：

```rust
# struct Guess {
#     value: u32,
# }
#
impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1  {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value: value,
        }
    }
}
```

如果运行列表 11-8 的测试，它会失败：

```
running 1 test
test tests::greater_than_100 ... FAILED

failures:

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured
```

这回并没有得到非常有用的信息，不过一旦我们观察测试函数，会发现它标注了`#[should_panic]`。这个错误意味着代码中函数`Guess::new(200)`并没有产生 panic。

然而`should_panic`测试可能是非常含糊不清的，因为他们只是告诉我们代码并没有产生 panic。`should_panic`甚至在测试因为其他不同的原因而不是我们期望发生的那个而 panic 时也会通过。为了使`should_panic`测试更精确，可以给`should_panic`属性增加一个可选的`expected`参数。测试工具会确保错误信息中包含其提供的文本。例如，考虑列表 11-9 中修改过的`Guess`，这里`new`函数更具其值是过大还或者过小而提供不同的 panic 信息：

<span class="filename">Filename: src/lib.rs</span>

```rust
struct Guess {
    value: u32,
}

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
            value: value,
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

<span class="caption">Listing 11-9: Testing that a condition will cause a
`panic!` with a particular panic message </span>

这个测试会通过，因为`should_panic`属性中`expected`参数提供的值是`Guess::new`函数 panic 信息的子字符串。我们可以指定期望的整个 panic 信息，在这个例子中是`Guess value must be less than or equal to 100, got 200.`。这依赖于 panic 有多独特或动态和你希望测试有多准确。在这个例子中，错误信息的子字符串足以确保函数在`else if value > 100`的情况下运行。

为了观察带有`expected`信息的`should_panic`测试失败时会发生什么，让我们再次引入一个 bug 来将`if value < 1`和`else if value > 100`的代码块对换：

```rust,ignore
if value < 1 {
    panic!("Guess value must be less than or equal to 100, got {}.", value);
} else if value > 100 {
    panic!("Guess value must be greater than or equal to 1, got {}.", value);
}
```

这一次运行`should_panic`测试，它会失败：

```
running 1 test
test tests::greater_than_100 ... FAILED

failures:

---- tests::greater_than_100 stdout ----
	thread 'tests::greater_than_100' panicked at 'Guess value must be greater
    than or equal to 1, got 200.', src/lib.rs:10
note: Run with `RUST_BACKTRACE=1` for a backtrace.
note: Panic did not include expected string 'Guess value must be less than or
equal to 100'

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured
```

错误信息表明测试确实如期望 panic 了，不过 panic 信息`did not include expected string 'Guess value must be less than or equal to 100'`。可以看到我们的到的 panic 信息，在这个例子中是`Guess value must be greater than or equal to 1, got 200.`。这样就可以开始寻找 bug 在哪了！

现在我们讲完了编写测试的方法，让我们看看运行测试时会发生什么并讨论可以用于`cargo test`的不同选项。