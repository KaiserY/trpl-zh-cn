## 编写测试

> [ch11-01-writing-tests.md](https://github.com/rust-lang/book/blob/master/src/ch11-01-writing-tests.md)
> <br>
> commit 77370c073661548dd56bbcb43cc64713585acbba

测试是一种使用特定功能的 Rust 函数，它用来验证非测试的代码按照期望的方式运行。我们讨论过的任何 Rust 代码规则都适用于测试！让我们看看 Rust 提供的具体用来编写测试的功能：`test`属性、一些宏和`should_panic`属性。

### `test`属性

作为最简单例子，Rust 中的测试就是一个带有`test`属性注解的函数。让我们使用 Cargo 来创建一个新的库项目`adder`：

```
$ cargo new adder
     Created library `adder` project
$ cd adder
```

Cargo 在创建新的库项目时自动生成一个简单的测试。这是`src/lib.rs`中的内容：

<span class="filename">Filename: src/lib.rs</span>

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
    }
}
```

现在让我们暂时忽略`tests`模块和`#[cfg(test)]`注解并只关注函数。注意它之前的`#[test]`：这个属性表明这是一个测试函数。这个函数目前没有任何内容，所以绝对是可以通过的！使用`cargo test`来运行测试：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.22 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
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