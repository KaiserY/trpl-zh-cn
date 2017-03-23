## 编写测试

> [ch11-01-writing-tests.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch11-01-writing-tests.md)
> <br>
> commit 55b294f20fc846a13a9be623bf322d8b364cee77

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












Cargo 编译并运行了测试。这里有两部分输出：本章我们将关注第一部分。第二部分是文档测试的输出，第十四章会介绍他们。现在注意看这一行：

```text
test it_works ... ok
```

`it_works`文本来源于测试函数的名称。

这里也有一行总结告诉我们所有测试的聚合结果：

```
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

### `assert!`宏

空的测试函数之所以能通过是因为任何没有`panic!`的测试都是通过的，而任何`panic!`的测试都算是失败。让我们使用`assert!宏来使测试失败：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
fn it_works() {
    assert!(false);
}
```
`assert!`宏由标准库提供，它获取一个参数，如果参数是`true`，什么也不会发生。如果参数是`false`，这个宏会`panic!`。再次运行测试：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.22 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test it_works ... FAILED

failures:

---- it_works stdout ----
	thread 'it_works' panicked at 'assertion failed: false', src/lib.rs:5
note: Run with `RUST_BACKTRACE=1` for a backtrace.


failures:
    it_works

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured

error: test failed
```

Rust 表明测试失败了：

```
test it_works ... FAILED
```

并展示了测试是因为src/lib.rs`的第 5 行`assert!`宏得到了一个`false`值而失败的：

```
thread 'it_works' panicked at 'assertion failed: false', src/lib.rs:5
```

失败的测试也体现在了总结行中：

```
test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured
```

### 使用`assert_eq!`和`assert_ne!`宏来测试相等

测试功能的一个常用方法是将需要测试代码的值与期望值做比较，并检查是否相等。可以通过向`assert!`宏传递一个使用`==`宏的表达式来做到。不过这个操作实在是太常见了，以至于标注库提供了一对宏来编译处理这些操作：`assert_eq!`和`assert_ne!`。这两个宏分别比较两个值是相等还是不相等。使用这些宏的另一个优势是当断言失败时他们会打印出这两个值具体是什么，以便于观察测试**为什么**失败，而`assert!`只会打印出它从`==`表达式中得到了`false`值。

下面是分别使用这两个宏其会测试通过的例子：

<span class="filename">Filename: src/lib.rs</span>

```
#[test]
fn it_works() {
    assert_eq!("Hello", "Hello");

    assert_ne!("Hello", "world");
}
```

也可以对这些宏指定可选的第三个参数，它是一个会加入错误信息的自定义文本。这两个宏展开后的逻辑看起来像这样：

```rust,ignore
// assert_eq! - panic if the values aren't equal
if left_val != right_val {
    panic!(
        "assertion failed: `(left == right)` (left: `{:?}`, right: `{:?}`): {}"
        left_val,
        right_val,
        optional_custom_message
    )
}

// assert_ne! - panic if the values are equal
if left_val == right_val {
    panic!(
        "assertion failed: `(left != right)` (left: `{:?}`, right: `{:?}`): {}"
        left_val,
        right_val,
        optional_custom_message
    )
}
```

看看这个因为`hello`不等于`world`而失败的测试。我们还增加了一个自定义的错误信息，`greeting operation failed`：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
fn a_simple_case() {
    let result = "hello"; // this value would come from running your code
    assert_eq!(result, "world", "greeting operation failed");
}
```

毫无疑问运行这个测试会失败，而错误信息解释了为什么测试失败了并且带有我们的指定的自定义错误信息：

```text
---- a_simple_case stdout ----
	thread 'a_simple_case' panicked at 'assertion failed: `(left == right)`
    (left: `"hello"`, right: `"world"`): greeting operation failed',
    src/main.rs:4
```

`assert_eq!`的两个参数被称为 "left" 和 "right" ，而不是 "expected" 和 "actual" ；值的顺序和硬编码的值并没有什么影响。

因为这些宏使用了`==`和`!=`运算符并使用调试格式打印这些值，进行比较的值必须实现`PartialEq`和`Debug` trait。Rust 提供的类型实现了这些 trait，不过自定义的结构体和枚举则需要自己实现`PartialEq`以便能够断言这些值是否相等，和实现`Debug`以便在断言失败时打印出这些值。因为第五章提到过这两个 trait 都是 derivable trait，所以通常可以直接在结构体或枚举上加上`#[derive(PartialEq, Debug)]`注解。查看附录 C 来寻找更多关于这些和其他 derivable trait 的信息。

## 使用`should_panic`测试期望的失败

可以使用另一个属性来反转测试中的失败：`should_panic`。这在测试调用特定的函数会产生错误的函数时很有帮助。例如，让我们测试第八章中的一些我们知道会 panic 的代码：尝试使用 range 语法和并不组成完整字母的字节索引来创建一个字符串 slice。在有`#[test]`属性的函数之前增加`#[should_panic]`属性，如列表 11-1 所示：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
#[should_panic]
fn slice_not_on_char_boundaries() {
    let s = "Здравствуйте";
    &s[0..1];
}
```

<figcaption>

Listing 11-1: A test expecting a `panic!`

</figcaption>
</figure>

这个测试是成功的，因为我们表示代码应该会 panic。相反如果代码因为某种原因没有产生`panic!`则测试会失败。

使用`should_panic`的测试是脆弱的，因为难以保证测试不会因为一个不同于我们期望的原因失败。为了帮助解决这个问题，`should_panic`属性可以增加一个可选的`expected`参数。测试工具会确保错误信息里包含我们提供的文本。一个比列表 11-1 更健壮的版本如列表 11-2 所示：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
#[test]
#[should_panic(expected = "do not lie on character boundary")]
fn slice_not_on_char_boundaries() {
    let s = "Здравствуйте";
    &s[0..1];
}
```

<!-- I will add ghosting in libreoffice /Carol -->

<figcaption>

Listing 11-2: A test expecting a `panic!` with a particular message

</figcaption>
</figure>

请自行尝试当`should_panic`的测试出现 panic 但并不符合期望的信息时会发生什么：在测试中因为不同原因造成`panic!`，或者将期望的 panic 信息改为并不与字母字节边界 panic 信息相匹配。